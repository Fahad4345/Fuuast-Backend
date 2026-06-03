import mongoose from "mongoose";
import bcrypt from "bcrypt";
const softCompanySchema = new mongoose.Schema({
  // Company fields
  companyName: {
    type: String,
    required: true,
  },

  companyPhone: {
    type: String,
    required: true,
  },

  companyRegNo: {
    type: String,
    required: true,
  },

  companyWebsite: {
    type: String,
    required: true,
  },
  companyLocation: {
    type: String,
    required: true,
  },
  companyWebsite: {
    type: String,
    required: true,
  },
  companyDescription: {
    type: String,
    required: true,
  },
  companyStatus: {
    type: String,
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  companyEmail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
});

export default mongoose.model("SoftCompany", softCompanySchema);
