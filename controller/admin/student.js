// create a controller for the admin to create a new alumni
import Alumni from "../../model/alumni.js";
import Student from "../../model/student.js";
import { sendEmail } from "../../nodemailer.js";
export function useStudent() {
    const createStudent = async (req, res) => {
        try {
            const { reg_no, batch, name, phone } = req.body;
            const already = await Student.findOne({ reg_no });
            if (already) {
                return res.status(400).json({ message: "Student with this registration number already exists" });
            }
            const student = new Student({
                reg_no,
                email: "",
                batch,
                name,
                phone,
                user: null,
            });
            await student.save();
            res.status(201).json({ message: "Student created successfully", student });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Failed to create alumni", error: error.message });
        }
    };
    const getStudent = async (req, res) => {
        try {
            const student = await Student.find();
            res
                .status(200)
                .json({ message: "Student fetched successfully", student });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Failed to get student", error: error.message });
        }
    };
    const deleteStudent = async (req, res) => {
        try {
            const { id } = req.params;
            await Student.findByIdAndDelete(id);
            res.status(200).json({ message: "Student deleted successfully" });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Failed to delete alumni", error: error.message });
        }
    };
    const updateStudent = async (req, res) => {
        try {
            const { id } = req.params;
            // Handle both regNo (camelCase) and reg_no (snake_case) from frontend
            const { regNo, reg_no, batch, name, email, phone } = req.body;
            const updateData = {
                regNo: regNo || reg_no, // Use whichever is provided
                batch,
                name,
                email,
                phone,
            };
            // Remove undefined fields to avoid overwriting with undefined
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });
            const updateStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).json({ message: "Student updated successfully", student: updateStudent });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Failed to update student", error: error.message });
        }
    };


    return {
        createStudent,
        getStudent,
        deleteStudent,
        updateStudent,
    };
}
