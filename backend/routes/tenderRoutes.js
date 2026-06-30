




const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

const Tender = require('../models/Tender');
const User = require('../models/User');
const { sendConfirmationEmail } = require('../utils/emailService');

const upload = multer({ storage: multer.memoryStorage() });

async function callGroqAPI(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  try {
    const cleaned = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return { raw: content };
  }
}

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const { email, tenderName } = req.body;
    if (!email || !tenderName || !req.file) {
      return res.status(400).json({ success: false, message: 'email, tenderName and PDF file are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const tenderText = await extractTextFromPDF(req.file.buffer);
    const today = new Date().toISOString().split('T')[0];

    const prompt = `You are an AI tender advisor.
IMPORTANT: Respond in ${user.preferredLanguage === 'hindi' ? 'Hindi (Devanagari script)' : 'English'}. 
All text values in the JSON (summary, eligibilityGap 
items, requiredDocuments items, reverseTimeline task 
names) must be written in this language. Keep JSON 
keys in English, only translate the VALUES.

Based on the following company profile and tender document, provide a concise analysis in JSON format with the keys:
{
  "summary": string,
  "fitScore": number,
  "eligibilityGap": [string],
  "requiredDocuments": [string],
  "reverseTimeline": [{"task": string, "date": string}],
 "deadline": string, // MUST be in YYYY-MM-DD format only
  "isExpired": boolean,
  "isIndustryMismatch": boolean
}

Today's date is: ${today}

Instructions:
1. 1. FIRST, check if the company's industry/sector (${user.industryType || user.businessType}) is relevant to the nature/category/industry of this tender. If the tender is completely unrelated to the company's industry (for example, a construction company bidding for railway spare parts manufacturing, or a food business bidding for IT services), then:
   - Set "isIndustryMismatch": true
   - Set "fitScore": 0
   - Set "eligibilityGap": ["This tender is not relevant to your business industry"]
   - Set "reverseTimeline": [] (empty array)
   - Still extract "summary" and "deadline" normally
   - Skip steps 2 and 3 below

2. If the industries DO match (even broadly), set "isIndustryMismatch": false, then extract the tender deadline and compare it with today's date (${today}). If the deadline is before today, set "isExpired": true and return an empty reverseTimeline array.

3. If "isIndustryMismatch" is false AND "isExpired" is false, calculate fitScore (integer 0-100) based on turnover, experience, certifications, and generate reverseTimeline as follows:
   - For each document in requiredDocuments, estimate typical preparation days in India (e.g., GST certificate: already exists, MSME registration: few days, Bank Guarantee/EMD: 5-7 days, Net Worth Certificate from CA: 3-5 days).
   - Include other important milestones mentioned in the tender text, such as site visit (if required), pre-bid meeting date, document download date.
   - Work backward from the deadline to calculate suggested completion dates for each item.
   - Return reverseTimeline as an array sorted by date (earliest first).

Company Profile:
- Email: ${user.email}
- Company Name: ${user.companyName}
- Business Type: ${user.businessType}
- Industry/Sector: ${user.industryType || 'Not specified'}
- Experience: ${user.experience}
- Turnover: ${user.turnover}
- Licenses: ${user.licenses || 'none'}
- Preferred Language: ${user.preferredLanguage}

Tender Document (full text extracted from PDF):
${tenderText.slice(0, 8000)}

Respond only with the JSON object described above.`;

    const analysis = await callGroqAPI(prompt);
    console.log('Groq Response:', JSON.stringify(analysis));

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing tender:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { email, tenderName, analysis } = req.body;
    if (!email || !tenderName || !analysis) {
      return res.status(400).json({ success: false, message: 'email, tenderName and analysis are required' });
    }
    // Fetch user profile to include snapshot
    const userProfile = await User.findOne({ email: email.toLowerCase() });
    if (!userProfile) {
      console.warn('User profile not found for email:', email);
    }
    const tender = new Tender({
      userEmail: email.toLowerCase(),
      tenderName,
      summary: analysis.summary || '',
      fitScore: analysis.fitScore || 0,
      eligibilityGap: analysis.eligibilityGap || [],
      requiredDocuments: analysis.requiredDocuments || [],
      reverseTimeline: (analysis.reverseTimeline || []).map(item => ({
        task: item.task,
        date: item.date ? new Date(item.date) : undefined,
      })),
      deadline: analysis.deadline && !isNaN(new Date(analysis.deadline)) ? new Date(analysis.deadline) : undefined,
      isExpired: analysis.isExpired || false,
      companySnapshot: userProfile ? {
        companyName: userProfile.companyName,
        businessType: userProfile.businessType,
        industryType: userProfile.industryType,
        experience: userProfile.experience,
        turnover: userProfile.turnover,
      } : undefined,
    });
    await tender.save();
    // Determine custom status message based on analysis flags
    const statusMessage = analysis.isExpired
      ? 'This tender has been saved to your dashboard. However, the deadline has already passed, so no action items are required.'
      : analysis.isIndustryMismatch
        ? 'This tender has been saved to your dashboard. However, this tender does not match your business industry, so no action items are required.'
        : null;
    try {
      await sendConfirmationEmail(email, tenderName, tender.reverseTimeline, tender.deadline, statusMessage);
    } catch (emailErr) {
      console.warn('Failed to send confirmation email:', emailErr);
    }
    return res.status(201).json({ success: true, data: tender });
  } catch (error) {
    console.error('Error saving tender:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

router.get('/user/:email', async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }
    const tenders = await Tender.find({ userEmail: email });
    return res.status(200).json({ success: true, data: tenders });
  } catch (error) {
    console.error('Error fetching tenders:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }
    return res.status(200).json({ success: true, data: tender });
  } catch (error) {
    console.error('Error fetching tender:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tender = await Tender.findByIdAndDelete(req.params.id);
    if (!tender) {
      return res.status(404).json({ success: false, message: 'Tender not found' });
    }
    return res.status(200).json({ success: true, message: 'Tender deleted successfully' });
  } catch (error) {
    console.error('Error deleting tender:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});
router.post('/test-reminders', async (req, res) => {
  try {
    const { checkAndSendReminders } = require('../utils/reminderScheduler');
    await checkAndSendReminders();
    res.status(200).json({ success: true, message: 'Reminder check executed' });
  } catch (err) {
    console.error('Error in test reminders:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;



