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

// Use memory storage for simplicity
const upload = multer({ storage: multer.memoryStorage() });

// Helper to call Groq API using fetch (Node >=18)
async function callGroqAPI(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // adjust as needed
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  // Expect first choice's message content to be JSON
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  try {
    const cleaned = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return { raw: content };
  }
}


/**
 * POST /api/tenders/analyze
 * Accepts multipart/form-data with fields:
 *   - email: user's email (must match a profile)
 *   - tenderName: name of the tender
 *   - file: PDF file
 *
 * Returns AI analysis result and stores it in MongoDB.
 */

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const { email, tenderName } = req.body;
    if (!email || !tenderName || !req.file) {
      return res.status(400).json({ success: false, message: 'email, tenderName and PDF file are required' });
    }

    // Fetch user profile for context
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Extract text from the uploaded PDF (buffer in memory)
    const tenderText = await extractTextFromPDF(req.file.buffer);

    // Build prompt for the LLM – include company profile fields and tender text
    const prompt = `You are an AI tender advisor. Based on the following company profile and tender document, provide a concise analysis in JSON format with the keys:
    {
      "summary": string, // short summary of the tender
      "fitScore": number, // 0‑100 indicating how well the tender matches the company
      "eligibilityGap": [string], // list of missing eligibility items
      "requiredDocuments": [string], // documents that need to be submitted
      "reverseTimeline": [{"task": string, "date": string}], // suggested reverse‑chronological timeline
      "deadline": string // ISO date string of the final submission deadline
    }
    
    Company Profile:
    - Email: ${user.email}
    - Company Name: ${user.companyName}
    - Business Type: ${user.businessType}
    - Experience: ${user.experience}
    - Turnover: ${user.turnover}
    - Licenses: ${user.licenses || 'none'}
    - Preferred Language: ${user.preferredLanguage}
    
    Tender Document (full text extracted from PDF):
    ${tenderText.slice(0, 4000)}
    
    Respond only with the JSON object described above.`;

    // Call Groq LLM
    const analysis = await callGroqAPI(prompt);
    console.log('Groq Response:', JSON.stringify(analysis));

    // Prepare data for storage
    // const tenderDoc = new Tender({
    //   userEmail: email.toLowerCase(),
    //   tenderName,
    //   summary: analysis.summary || '',
    //   fitScore: analysis.fitScore || 0,
    //   eligibilityGap: analysis.eligibilityGap || [],
    //   requiredDocuments: analysis.requiredDocuments || [],
    //   reverseTimeline: (analysis.reverseTimeline || []).map(item => ({
    //     task: item.task,
    //     date: new Date(item.date),
    //   })),
    //   deadline: analysis.deadline ? new Date(analysis.deadline) : undefined,
    // });

    // await tenderDoc.save();

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing tender:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Save analysis to dashboard
router.post('/save', async (req, res) => {
  try {
    const { email, tenderName, analysis } = req.body;
    if (!email || !tenderName || !analysis) {
      return res.status(400).json({ success: false, message: 'email, tenderName and analysis are required' });
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
      deadline: analysis.deadline ? new Date(analysis.deadline) : undefined,
    });
    await tender.save();
    return res.status(201).json({ success: true, data: tender });
  } catch (error) {
    console.error('Error saving tender:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Get all tenders for a user email
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


// Get single tender by ID
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

module.exports = router;
