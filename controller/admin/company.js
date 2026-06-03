// create a controller for the admin to create a new alumni
import Alumni from "../../model/alumni.js";
import SoftCompany from "../../model/softcompany.js";
import User from "../../model/user.js";
import post from "../../model/post.js";
import { sendEmail } from "./../../nodemailer.js";

export default function useCompany() {
  const getSoftCompany = async (req, res) => {
    try {
      console.log("getSoftCompany");
      const { type } = req.params;
      if (type === "all") {
        const companies = await SoftCompany.find({
          companyStatus: { $in: ["pending", "approved", "rejected"] },
        });
        res
          .status(200)
          .json({ message: "Companies fetched successfully", companies });
      } else if (type === "pending") {
        const companies = await SoftCompany.find({
          companyStatus: "pending",
        });
        res
          .status(200)
          .json({ message: "Companies fetched successfully", companies });
      } else if (type === "approved") {
        const companies = await SoftCompany.find({
          companyStatus: "approved",
        });
        res
          .status(200)
          .json({ message: "Companies fetched successfully", companies });
      } else if (type === "rejected") {
        const companies = await SoftCompany.find({
          companyStatus: "rejected",
        });
        res
          .status(200)
          .json({ message: "Companies fetched successfully", companies });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get companies", error: error.message });
    }
  };
  const updateCompanyStatus = async (req, res) => {
    try {
      const { id, status } = req.params;
      const { rejectionReason } = req.body;
      console.log("updateCompanyStatus", id, status, rejectionReason);
      const company = await SoftCompany.findByIdAndUpdate(
        id,
        { companyStatus: status },
        { new: true },
      );
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      if (status === "approved") {
        const user = new User({
          name: company.companyName,
          email: company.companyEmail,
          role: "Company",
          password: company.password,
        });
        await user.save();
        await sendEmail({
          to: company.companyEmail,
          subject: "Company Registration Approved",
          html: `
        <h2>Congratulations!</h2>
        <p>Your company account has been approved by the administrator.</p>
        <p>You can now log in and start using the platform.</p>
      `,
        });
        res
          .status(200)
          .json({ message: "Company status updated successfully", company });
      }
      if (status === "rejected") {
        await SoftCompany.findByIdAndUpdate(
          { _id: id },
          { rejectionReason: rejectionReason },
        );
        await sendEmail({
          to: company.companyEmail,
          subject: "Company Registration Rejected",
          html: `
        <h2>Company Registration Rejected</h2>
        <p>Your company account has been rejected by the administrator.</p>
        <p>Reason: ${rejectionReason}</p>
      `,
        });
        res
          .status(200)
          .json({ message: "Company status updated successfully", company });
      }
    } catch (error) {
      res.status(500).json({
        message: "Failed to update company status",
        error: error.message,
      });
    }
  };
  const getMyJobs = async (req, res) => {
    try {
      const { Id } = req.params;
      const jobs = await post.find({ user: Id });
      if (!jobs) {
        return res
          .status(404)
          .json({ message: "No jobs found for this company" });
      }
      res.status(200).json({ message: "Jobs fetched successfully", jobs });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get jobs", error: error.message });
    }
  };

  return { getSoftCompany, updateCompanyStatus, getMyJobs };
}
