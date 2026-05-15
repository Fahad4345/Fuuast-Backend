// create a model for the alumni
import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema({
  reg_no: String,
  batch: String,
  name: String,
  email: String,
  phone: String,
  company: String,
  association: Boolean,
  associationStatus: {
    type: String,
    enum: ["not_requested", "pending", "approved", "rejected"],
    default: "not_requested",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});
export default mongoose.model("Alumni", alumniSchema);
