// create a controller for the admin to create a new alumni
import Alumni from "../../model/alumni.js";
export function useAlumni() {
  const createAlumni = async (req, res) => {
    try {
      console.log("createAlumni", req.body);
      const { reg_no, batch, name, email, phone, company } = req.body;
      const alumni = new Alumni({
        reg_no,
        batch,
        name,
        email,
        phone,
        company,
        user: null,
      });
      await alumni.save();
      res.status(201).json({ message: "Alumni created successfully", alumni });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create alumni", error: error.message });
    }
  };
  const getAlumni = async (req, res) => {
    try {
      console.log("getAlumni");
      const { type } = req.params;
      if (type === "all") {
        const alumni = await Alumni.find();
        res
          .status(200)
          .json({ message: "Alumni fetched successfully", alumni });
      } else if (type === "pending") {
        const alumni = await Alumni.find({
          associationStatus: "pending",
        }).populate("user");
        res
          .status(200)
          .json({ message: "Alumni fetched successfully", alumni });
      } else if (type === "approved") {
        const alumni = await Alumni.find({
          associationStatus: "approved",
        }).populate("user");
        res
          .status(200)
          .json({ message: "Alumni fetched successfully", alumni });
      } else if (type === "rejected") {
        const alumni = await Alumni.find({
          associationStatus: "rejected",
        }).populate("user");
        res
          .status(200)
          .json({ message: "Alumni fetched successfully", alumni });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get alumni", error: error.message });
    }
  };
  const deleteAlumni = async (req, res) => {
    try {
      const { id } = req.params;
      await Alumni.findByIdAndDelete(id);
      res.status(200).json({ message: "Alumni deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete alumni", error: error.message });
    }
  };
  const updateAlumni = async (req, res) => {
    try {
      const { id } = req.params;
      // Handle both regNo (camelCase) and reg_no (snake_case) from frontend
      const { regNo, reg_no, batch, name, email, phone, company } = req.body;
      const updateData = {
        regNo: regNo || reg_no, // Use whichever is provided
        batch,
        name,
        email,
        phone,
        company,
      };
      // Remove undefined fields to avoid overwriting with undefined
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      await Alumni.findByIdAndUpdate(id, updateData);
      res.status(200).json({ message: "Alumni updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update alumni", error: error.message });
    }
  };
  const requestjoinAssociation = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("requestjoinAssociation", id);
      await Alumni.findByIdAndUpdate(id, { associationStatus: "pending" });
      res
        .status(200)
        .json({ message: "Alumni joined association successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to join association", error: error.message });
    }
  };
  const changeAssociationStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await Alumni.findByIdAndUpdate(id, { associationStatus: status });
      res
        .status(200)
        .json({ message: "Alumni association status changed successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to change association status",
        error: error.message,
      });
    }
  };
  const getAlumniAssociation = async (req, res) => {
    try {
      const { type } = req.params;
      if (type === "pending") {
        const alumni = await Alumni.find({
          associationStatus: "pending",
        });
        res
          .status(200)
          .json({ message: "Alumni association fetched successfully", alumni });
      } else if (type === "approved") {
        console.log("approved");
        const alumni = await Alumni.find({
          associationStatus: "approved",
        });
        res
          .status(200)
          .json({ message: "Alumni association fetched successfully", alumni });
      }
    } catch (error) {
      res.status(500).json({
        message: "Failed to get alumni association",
        error: error.message,
      });
    }
  };

  return {
    createAlumni,
    getAlumni,
    deleteAlumni,
    updateAlumni,
    requestjoinAssociation,
    changeAssociationStatus,
    getAlumniAssociation,
  };
}
