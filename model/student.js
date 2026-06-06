// create a model for the alumni
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    reg_no: String,
    batch: String,
    name: String,
    email: String,
    phone: String,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
});
export default mongoose.model("Student", studentSchema);