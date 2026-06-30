const mongoose = require("mongoose");

// Define the User schema with company details for Indian SMEs
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: [true, "Company Name is required"],
      trim: true,
    },
    businessType: {
      type: String,
      required: [true, "Business Type is required"],
      trim: true,
    },
    industryType: {
      type: String,
      required: false,
      trim: true,
    },
    experience: {
      type: String, // e.g. "3 years", "5+ years"
      required: [true, "Experience is required"],
      trim: true,
    },
    turnover: {
      type: String, // e.g. "₹50 Lakhs", "₹2 Crores"
      required: [true, "Annual turnover is required"],
      trim: true,
    },
    licenses: {
      type: String, // e.g. "GSTIN, MSME"
      default: "",
      trim: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["english", "hindi"],
      default: "english",
    },
  },
  {
    // Enable createdAt field automatically
    timestamps: { createdAt: true, updatedAt: true }
  }
);

// Export the User model
module.exports = mongoose.model("User", userSchema);
