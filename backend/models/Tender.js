const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    tenderName: {
      type: String,
      required: [true, 'Tender name is required'],
      trim: true,
    },
    summary: {
      type: String,
      default: '',
    },
    fitScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    eligibilityGap: {
      type: [String],
      default: [],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    reverseTimeline: {
      type: [
        {
          task: { type: String, required: true },
          date: { type: Date, required: true },
        },
      ],
      default: [],
    },
    deadline: { type: Date },
    // Snapshot of user company profile at time of saving tender
    companySnapshot: {
      companyName: { type: String },
      businessType: { type: String },
      industryType: { type: String },
      experience: { type: String },
      turnover: { type: String },
    },
    isExpired: { type: Boolean, default: false },
    reminderEnabled: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Tender', tenderSchema);
