const express = require("express");
const router = express.Router();
const User = require("../models/User");

// @route   POST /api/users/profile
// @desc    Create or update company profile
// @access  Public
router.post("/profile", async (req, res) => {
  try {
    // Extract fields from request body
    const { email, companyName, businessType, experience, turnover, licenses, preferredLanguage } = req.body;
    // Validate required fields
    const requiredFields = { email, companyName, businessType, experience, turnover };
    const missing = Object.entries(requiredFields).filter(([key, value]) => !value);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.map(([k]) => k).join(', ')}`,
      });
    }

    // Check if user profile already exists, if so update it, otherwise create a new one (Upsert operation)
    let user = await User.findOne({ email: email.toLowerCase() });


    if (user) {
      // Update existing profile details
      user.companyName = companyName || user.companyName;
      user.businessType = businessType || user.businessType;
      user.experience = experience || user.experience;
      user.turnover = turnover || user.turnover;
      user.licenses = licenses !== undefined ? licenses : user.licenses;
      user.preferredLanguage = preferredLanguage || user.preferredLanguage;

      await user.save();
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
        data: user,
      });
    } else {
      // Create a brand new profile
      user = new User({
        email: email.toLowerCase(),
        companyName,
        businessType,
        experience,
        turnover,
        licenses,
        preferredLanguage,
      });

      await user.save();
      return res.status(201).json({
        success: true,
        message: "Profile created successfully!",
        data: user,
      });
    }
  } catch (error) {
    console.error("Error saving/updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// @route   GET /api/users/profile/:email
// @desc    Get company profile details by email
// @access  Public
router.get("/profile/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email parameter is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found for this email",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
