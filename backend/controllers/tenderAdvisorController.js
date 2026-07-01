const User = require("../models/User");
const Tender = require("../models/Tender");
const TenderRecord = require("../models/tenderRecord");

/**
 * Controller to handle AI Tender Advisor requests.
 * Receives tenderId, message, and preferredLanguage from the request body.
 */
exports.getAdvisorAdvice = async (req, res) => {
  try {
    const { tenderId, message, preferredLanguage } = req.body;

    // Validate request inputs
    if (!tenderId) {
      return res.status(200).json({
        success: false,
        message: "Unable to generate AI advice right now."
      });
    }
    if (!message || !message.trim()) {
      return res.status(200).json({
        success: false,
        message: "Unable to generate AI advice right now."
      });
    }

    // 1. Fetch Tender Details
    const tender = await Tender.findById(tenderId);
    if (!tender) {
      console.error(`Tender with ID ${tenderId} not found.`);
      return res.status(200).json({
        success: false,
        message: "Unable to generate AI advice right now."
      });
    }

    // 2. Fetch Company Profile (Priority 1) or Company Snapshot (Priority 2)
    let companyContext = "";
    const profile = await User.findOne({ email: tender.userEmail });

    if (profile) {
      // Priority 1: Use active Company Profile
      companyContext = `
Company Profile Details:
- Company Name: ${profile.companyName || "N/A"}
- Business Type: ${profile.businessType || "N/A"}
- Industry Type: ${profile.industryType || "N/A"}
- Years of Experience: ${profile.experience || "N/A"}
- Annual Turnover: ${profile.turnover || "N/A"}
- Licenses & Certifications: ${profile.licenses || "None listed"}
`;
    } else if (tender.companySnapshot && Object.keys(tender.companySnapshot).length > 0) {
      // Priority 2: Fall back to Company Snapshot from tender document
      const snap = tender.companySnapshot;
      companyContext = `
Company Profile Details (Snapshot from Tender Analysis):
- Company Name: ${snap.companyName || "N/A"}
- Business Type: ${snap.businessType || "N/A"}
- Industry Type: ${snap.industryType || "N/A"}
- Years of Experience: ${snap.experience || "N/A"}
- Annual Turnover: ${snap.turnover || "N/A"}
- Licenses & Certifications: N/A (Snapshot only)
`;
    } else {
      // Priority 3: No company info exists, return graceful error
      console.error(`No company profile or snapshot found for tender ${tenderId}.`);
      return res.status(200).json({
        success: false,
        message: "Unable to generate AI advice right now."
      });
    }

    // 3. Build Tender Details Context
    const tenderContext = `
Tender Details:
- Tender Name: ${tender.tenderName || "N/A"}
- Tender Summary: ${tender.summary || "N/A"}
- Match Score: ${tender.fitScore ?? "N/A"}
- Eligibility Gap: ${Array.isArray(tender.eligibilityGap) ? tender.eligibilityGap.join(", ") : "N/A"}
- Required Documents: ${Array.isArray(tender.requiredDocuments) ? tender.requiredDocuments.join(", ") : "N/A"}
- Reverse Timeline: ${Array.isArray(tender.reverseTimeline) ? tender.reverseTimeline.map(item => `${item.task} (on ${item.date ? new Date(item.date).toLocaleDateString() : "N/A"})`).join("; ") : "N/A"}
- Deadline: ${tender.deadline ? new Date(tender.deadline).toLocaleDateString() : "N/A"}
`;

    // 4. Construct System Prompt & Language rules
    const lang = preferredLanguage || "english";
    const langInstruction = lang.toLowerCase() === "hindi"
      ? "Always answer in Hindi. If the preferred language is Hindi then answer only in Hindi."
      : "Always answer in English. If the preferred language is English then answer only in English.";

    const systemPrompt = `You are an expert Government Tender Consultant.

Only answer using the provided company profile and tender analysis.
Never invent information.
If information is unavailable, clearly state that.
Explain everything in simple language.
Give practical advice.
Answer questions such as:
- Should the company apply?
- Estimate chances of success.
- Explain eligibility gaps.
- Explain risks.
- Suggest preparation strategy.
- Explain required documents.
- Summarize the tender.

Never answer questions unrelated to this tender. If the user asks anything outside this tender context, politely refuse and explain that you are only the AI Tender Advisor for this specific tender.

Additional Instruction - Document Guidance:
When the user asks about any required document such as GST Certificate, MSME Registration (Udyam), ISO Certification, PAN, Bank Guarantee (EMD), Net Worth Certificate, Turnover Certificate, Experience Certificates, Affidavits, or any other compliance document, provide practical guidance.

For each document, explain:
• Why the document is required for the tender.
• Which authority, department, bank, or organization normally issues it in India.
• The typical processing time in India. Always mention that this is an approximate estimate and may vary depending on the state, issuing authority, verification process, and application method.
• Whether the document can usually be obtained online, offline, or both.
• If the current tender deadline is close, advise whether the user should start obtaining the document immediately.
• If the remaining time before the tender deadline is less than the estimated processing time, clearly warn the user that obtaining the document before the deadline may be difficult and recommend taking immediate action.

Never present processing times as guaranteed.
Always mention that timelines are approximate and based on standard procedures followed in India.
If the requested document is NOT listed in this tender's required documents, clearly state that it is not a mandatory requirement for this tender and provide only general guidance.
If applicable, also tell the user the official issuing authority or official government portal where the document is normally obtained (for example GST Portal, Udyam Registration Portal, Income Tax Department, EPFO, ESIC, GeM, Applicant's Bank, etc.).
Never invent government rules, legal requirements, or eligibility criteria that are not available in the provided tender context.

${langInstruction}`;

    const userPrompt = `
Here is the context data:
===
${companyContext}
===
${tenderContext}
===

User Question: ${message}
`;

    // 5. Call Groq API using standard global fetch
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API returned error status ${response.status}:`, errorText);
      return res.status(200).json({
        success: false,
        message: "Unable to generate AI advice right now."
      });
    }

    const data = await response.json();
    const advisorReply = data.choices?.[0]?.message?.content || "Unable to generate AI advice right now.";

    return res.status(200).json({
      success: true,
      data: advisorReply
    });

  } catch (err) {
    console.error("Error in getAdvisorAdvice controller:", err);
    return res.status(200).json({
      success: false,
      message: "Unable to generate AI advice right now."
    });
  }
};

/**
 * Controller to fetch relevant tenders matching the user's industry.
 */
exports.getRelevantTenders = async (req, res) => {
  try {
    const industryType = req.query.industryType ||
      req.headers.industrytype ||
      req.headers['industry-type'] ||
      (req.user && req.user.industryType);

    if (!industryType) {
      return res.status(400).json({
        success: false,
        message: "industryType is required"
      });
    }

    const filteredTenders = await TenderRecord.find({ industry: industryType });

    return res.status(200).json({
      success: true,
      data: filteredTenders
    });
  } catch (error) {
    console.error("Error in getRelevantTenders controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
