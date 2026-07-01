const mongoose = require('mongoose');

const tenderRecordSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Tender ID is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    referenceNumber: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    estimatedValue: {
      type: Number,
      default: null,
    },
    emd: {
      type: Number,
      default: null,
    },
    turnoverRequired: {
      type: Number,
      default: null,
    },
    experienceRequired: {
      type: Number,
      default: null,
    },
    requiredLicenses: {
      type: [String],
      default: [],
    },
    closingDate: {
      type: Date,
      default: null,
    },
    bidOpeningDate: {
      type: Date,
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    sourceUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'tender_records',
  }
);

module.exports = mongoose.model('TenderRecord', tenderRecordSchema);
