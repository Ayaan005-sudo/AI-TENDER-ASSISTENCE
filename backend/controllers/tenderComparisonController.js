const User = require("../models/User");
const Tender = require("../models/Tender");

/**
 * Controller to handle AI Tender Comparison requests.
 * Receives tenderIds in the body, fetches details, queries Groq, and returns ranking.
 */
exports.compareTenders = async (req, res) => {
  try {
    const { tenderIds } = req.body;

    // Validate that tenderIds is an array containing at least two IDs
    if (!tenderIds || !Array.isArray(tenderIds) || tenderIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please select at least two tenders for comparison."
      });
    }

    // 1. Fetch Tenders from DB
    const tenders = await Tender.find({ _id: { $in: tenderIds } });

    if (!tenders || tenders.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please select at least two tenders for comparison."
      });
    }

    // 2. Fetch User Company Profile using userEmail from the first tender
    const profile = await User.findOne({ email: tenders[0].userEmail });

    // Determine user's preferred language (Priority: Profile -> Snapshot -> default 'english')
    const preferredLanguage = profile?.preferredLanguage || tenders[0].companySnapshot?.preferredLanguage || "english";

    // 3. Build Company Context
    let companyContext = "";
    if (profile) {
      companyContext = `
Company Profile:
- Company Name: ${profile.companyName || "N/A"}
- Business Type: ${profile.businessType || "N/A"}
- Industry Type: ${profile.industryType || "N/A"}
- Years of Experience: ${profile.experience || "N/A"}
- Annual Turnover: ${profile.turnover || "N/A"}
- Licenses & Certifications: ${profile.licenses || "None listed"}
`;
    } else {
      // Fallback snapshot data from the first tender
      const snap = tenders[0].companySnapshot || {};
      companyContext = `
Company Profile (From Saved Snapshot):
- Company Name: ${snap.companyName || "N/A"}
- Business Type: ${snap.businessType || "N/A"}
- Industry Type: ${snap.industryType || "N/A"}
- Years of Experience: ${snap.experience || "N/A"}
- Annual Turnover: ${snap.turnover || "N/A"}
- Licenses & Certifications: N/A (Snapshot only)
`;
    }

    // 4. Build Tenders Context
    let tendersContext = "";
    tenders.forEach((tender, idx) => {
      const timelineStr = Array.isArray(tender.reverseTimeline)
        ? tender.reverseTimeline.map(item => `${item.task} (on ${item.date ? new Date(item.date).toLocaleDateString() : "N/A"})`).join("; ")
        : "N/A";
      const eligibilityStr = Array.isArray(tender.eligibilityGap) ? tender.eligibilityGap.join(", ") : "N/A";
      const documentsStr = Array.isArray(tender.requiredDocuments) ? tender.requiredDocuments.join(", ") : "N/A";

      tendersContext += `
---
TENDER #${idx + 1} DETAILS:
- Tender ID: ${tender._id}
- Tender Name: ${tender.tenderName || "N/A"}
- Tender Summary: ${tender.summary || "N/A"}
- Match Score: ${tender.fitScore ?? "N/A"}
- Eligibility Gap: ${eligibilityStr}
- Required Documents: ${documentsStr}
- Reverse Timeline: ${timelineStr}
- Submission Deadline: ${tender.deadline ? new Date(tender.deadline).toLocaleDateString() : "N/A"}
- Company Snapshot at Saving: Name: ${tender.companySnapshot?.companyName || "N/A"}, Sector: ${tender.companySnapshot?.industryType || "N/A"}
`;
    });

    // 5. Construct Prompts & Instructions
    const lang = preferredLanguage.toLowerCase() === "hindi" ? "hindi" : "english";
    const langInstruction = lang === "hindi"
      ? "Always answer in Hindi. If the preferred language is Hindi then answer only in Hindi."
      : "Always answer in English. If the preferred language is English then answer only in English.";

    const systemPrompt = `You are an expert Government Tender Consultant.

Compare the selected tenders based on the provided company profile and tender analysis.
Rank all selected tenders from best to worst (using rankings like 🥇 for the best choice, 🥈 for the second best choice, 🥉 for the third best choice, etc.).

For every tender, detail and explain:
• Strengths
• Weaknesses
• Missing Documents
• Risks
• Deadline Risk (Clearly evaluate and categorize as: Low Risk, Medium Risk, or High Risk)
• Industry Compatibility
• Overall Suitability

Do not simply compare Match Scores. Consider the complete context including Match Score, Industry Compatibility, Eligibility Gap, Missing Documents, Submission Timeline, Tender Complexity, and Company Profile. Explain WHY one tender is better than another. Never rank tenders using only numerical values.

Finally, provide:
🏆 Best Tender Recommendation
Explain clearly WHY it is the best choice relative to the others.

Also provide:
Estimated Success Level: [High / Medium / Low]

Give practical business advice.
Never invent information. Only answer using the provided tender data and company profile.

${langInstruction}`;

    const userPrompt = `
Here is the context data:
===
${companyContext}
===
${tendersContext}
===

Please perform the AI comparison.
`;

    // 6. Call Groq completions API
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
      console.error(`Groq API error ${response.status}:`, errorText);
      return res.status(200).json({
        success: false,
        message: "Unable to run comparison right now."
      });
    }

    const data = await response.json();
    const comparisonOutput = data.choices?.[0]?.message?.content || "Unable to run comparison right now.";

    return res.status(200).json({
      success: true,
      data: comparisonOutput
    });

  } catch (err) {
    console.error("Error in compareTenders controller:", err);
    return res.status(200).json({
      success: false,
      message: "Unable to run comparison right now."
    });
  }
};
