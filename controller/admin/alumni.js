// create a controller for the admin to create a new alumni
import Alumni from '../../model/alumni.js';
export function useAlumni() {

const createAlumni = async (req, res) => {
try{
    console.log('createAlumni', req.body);
   const { reg_no, batch, name, email, phone, company } = req.body;
    const alumni = new Alumni({ reg_no, batch, name, email, phone, company });
    await alumni.save();
    res.status(201).json({ message: 'Alumni created successfully', alumni });
} catch (error) {
    res.status(500).json({ message: 'Failed to create alumni', error: error.message });
}
}
const getAlumni = async (req, res) => {
try{
    console.log('getAlumni');
    const alumni = await Alumni.find();
    res.status(200).json({ message: 'Alumni fetched successfully', alumni });
} catch (error) {
    res.status(500).json({ message: 'Failed to get alumni', error: error.message });
}
}
const deleteAlumni = async (req, res) => {
try{
    const { id } = req.params;
    await Alumni.findByIdAndDelete(id);
    res.status(200).json({ message: 'Alumni deleted successfully' });
} catch (error) {
    res.status(500).json({ message: 'Failed to delete alumni', error: error.message });
}
}
const updateAlumni = async (req, res) => {
try{
        const { id } = req.params;
        // Handle both regNo (camelCase) and reg_no (snake_case) from frontend
        const { regNo, reg_no, batch, name, email, phone, company } = req.body;
        const updateData = {
            regNo: regNo || reg_no, // Use whichever is provided
            batch,
            name,
            email,
            phone,
            company
        };
        // Remove undefined fields to avoid overwriting with undefined
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
    await Alumni.findByIdAndUpdate(id, updateData);
    res.status(200).json({ message: 'Alumni updated successfully' });
} catch (error) {
    res.status(500).json({ message: 'Failed to update alumni', error: error.message });
}
}
return{
    createAlumni,
    getAlumni,
    deleteAlumni,
    updateAlumni
}
}