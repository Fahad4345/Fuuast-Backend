// create a controller for the admin to create a new alumni
import Alumni from "../../model/alumni.js";
import SoftCompany from "../../model/softcompany.js";
import User from "../../model/user.js";
import post from "../../model/post.js";
import { sendEmail } from "./../../nodemailer.js";

export default function useCompany() {
  const getSoftCompany = async (req, res) => {
    try {
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
      const company = await SoftCompany.findByIdAndUpdate(
        id,
        { companyStatus: status },
        { new: true },
      );
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      console.log(company);
      if (status === "approved") {
        const user = new User({
          name: company.companyName,
          email: company.companyEmail,
          role: "Company",
          password: company.password,
          company: company._id
        });
        await user.save();
        await sendEmail({
          to: company.companyEmail,
          subject: "Your Company Registration Has Been Approved",
          html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        
        <h2 style="color: #08451c; margin-bottom: 20px;">
          🎉 Application Approved
        </h2>

        <p style="font-size: 16px; color: #333;">
          Dear ${company.companyName || "Partner"},
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          We are pleased to inform you that your company registration has been successfully reviewed and <strong>approved</strong> by our administration team.
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          You can now log in to your account and start using the platform to explore opportunities and manage your profile.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="https://your-platform-url.com/login"
             style="background-color: #08451c; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Login
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 13px; color: #888; text-align: center;">
          If you have any questions, feel free to contact our support team.
        </p>

        <p style="font-size: 13px; color: #888; text-align: center;">
          © ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>

      </div>
    </div>
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
        const emailResponse = await sendEmail({
          to: company.companyEmail,
          subject: "Update on Your Company Registration",
          html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">

        <h2 style="color: #b00020; margin-bottom: 20px;">
          ⚠️ Registration Status Update
        </h2>

        <p style="font-size: 16px; color: #333;">
          Dear ${company.companyName || "Applicant"},
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          We appreciate your interest in joining our platform. After carefully reviewing your company registration, we regret to inform you that your application has not been approved at this time.
        </p>

        <div style="background-color: #fff5f5; border-left: 4px solid #b00020; padding: 12px 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #b00020;">
            <strong>Reason:</strong> ${rejectionReason}
          </p>
        </div>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          You may review the requirements and submit a new application after addressing the above issue.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="https://your-platform-url.com/support"
             style="background-color: #b00020; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Contact Support
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 13px; color: #888; text-align: center;">
          If you believe this was a mistake, please reach out to our support team.
        </p>

        <p style="font-size: 13px; color: #888; text-align: center;">
          © ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>

      </div>
    </div>
  `,
        });
        res.status(200).json({ message: "Company status updated successfully", company, emailResponse });
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

      const today = new Date();
      const jobs = await post.find({
        user: Id, $or: [
          { lastDateToApply: null }, // no deadline
          { lastDateToApply: { $gte: today } }, // deadline not crossed
        ],
      });
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
  const getApplicants = async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await post.findById(jobId).populate("Applicants");
      if (!job) {
        return res.status(404).json({ message: "Job Not Found" });
      }
      res.status(200).json({ message: "Applicants fetched successfully", applicants: job.Applicants });
    } catch (error) {
      res.status(500).json({ message: "Failed to get applicants", error: error.message });
    }
  }
  const updateCompanyProfile = async (req, res) => {
    try {
      const {
        companyName,
        companyPhone,
        companyLocation,
        companyWebsite,
        companyDescription
      } = req.body;
      const id = req.params.Id;
      // Verify that the user is updating their own profile

      // Build update object, only including fields that are provided
      console.log(id)
      const updateData = {};
      if (companyName !== undefined) updateData.companyName = companyName;
      if (companyPhone !== undefined) updateData.companyPhone = companyPhone;
      if (companyLocation !== undefined) updateData.companyLocation = companyLocation;
      if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
      if (companyDescription !== undefined) updateData.companyDescription = companyDescription;
      console.log(id, updateData)
      const company = await SoftCompany.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!company) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "Profile updated successfully", company });
    } catch (error) {
      console.error("Profile update error:", error);
      res
        .status(500)
        .json({ error: "Failed to update profile", message: error.message });
    }
  };
  return { getSoftCompany, updateCompanyStatus, getMyJobs, getApplicants, updateCompanyProfile };
}
