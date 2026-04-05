// create a model for the alumni
import mongoose from 'mongoose';
const alumniSchema = new mongoose.Schema({
    reg_no: String,
    batch: String,
    name: String,
    email: String,
    phone: String,
    company: String,
    });
export default mongoose.model('Alumni', alumniSchema);