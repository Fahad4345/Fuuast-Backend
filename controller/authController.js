import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Alumni from "../model/alumni.js";
import { uploadToCloudinary } from "../utils.js";
import SoftCompany from "../model/softcompany.js";
import crypto from "crypto";
import { sendEmail } from "./../nodemailer.js";
dotenv.config();

class AuthController {
  static instance;
  constructor() {
    this.accessTokenSecret = process.env.ACCESS_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_SECRET;

    // make sure it's a singleton
    if (AuthController.instance) {
      return AuthController.instance;
    }
    AuthController.instance = this;
    return this;
  }

  generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_SECRET, { expiresIn: "1h" });
  };

  generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_SECRET, { expiresIn: "15d" });
  };

  getCookieOptions = () => {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    };
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email }).populate("alumni");
    console.log("user", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log("user found, comparing password...", password, user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("isMatch", isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();
    res.cookie("refreshToken", refreshToken, this.getCookieOptions());
    res.json({ message: "Login successful", user: user, accessToken });
  };

  register = async (req, res) => {
    const { name, email, password, reg_no, role } = req.body;
    console.log(name, email, password, reg_no, role);
    if (role === "Alumni") {
      const alumni = await Alumni.findOne({ reg_no });
      console.log("alumni", alumni);
      if (!alumni) {
        return res.status(400).json({ error: "Alumni not found" });
      }
      if (alumni.name !== name) {
        return res.status(400).json({ error: "Alumni name does not match" });
      }
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
      console.log("alumni", alumni);

      const newUser = new User({
        name,
        email,
        password,
        reg_no,
        role,
        alumni: alumni._id,
      });
      await newUser.save();
      await Alumni.findByIdAndUpdate(alumni._id, {
        user: newUser._id,
        email: email,
      });
    } else {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
      const newUser = new User({ name, email, password, reg_no, role });
      await newUser.save();
    }
    res.status(201).json({ message: "User created successfully" });
  };
  requestAccess = async (req, res) => {
    const {
      email,
      role,
      password,
      companyName,
      companyPhone,
      companyRegNo,
      companyLocation,
      companyWebsite,
      companyDescription,
    } = req.body;
    console.log(email, role);
    if (role !== "Company") {
      return res
        .status(400)
        .json({ error: "Only company  can request access" });
    }
    if (
      !email ||
      !password ||
      !companyName ||
      !companyPhone ||
      !companyRegNo ||
      !companyLocation ||
      !companyWebsite ||
      !companyDescription
    ) {
      return res
        .status(400)
        .json({ error: "All company details are required" });
    }

    const checkReg = await SoftCompany.findOne({
      companyRegNo,
    });
    if (checkReg) {
      return res.status(400).json({ error: "Company already exists" });
    }
    const checkEmail = await SoftCompany.findOne({
      companyEmail: email,
    });
    if (checkEmail) {
      return res.status(400).json({ error: "Company email already exists" });
    }

    const newUser = new SoftCompany({
      companyEmail: email,
      role,
      password,
      companyName,
      companyPhone,
      companyRegNo,
      companyLocation,
      companyWebsite,
      companyDescription,
      companyStatus: "pending",
    });
    await newUser.save();
    res.status(201).json({ message: "Access request submitted successfully" });
  };

  refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const accessToken = this.generateAccessToken(user._id);
    res.json({ accessToken });
  };
  logout = async (req, res) => {
    try {
      const token = req.cookies.refreshToken;
      console.log(token);
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
          const user = await User.findById(decoded.id);

          if (user && user.refreshTokens) {
            user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
            await user.save();
          }
        } catch (err) {
          console.log("Token already invalid or expired");
        }
      }

      res.clearCookie("refreshToken", this.getCookieOptions());

      return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
  };
  sendResetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required", success: false });
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ error: "User with this gmail do not exist", success: false });
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = Date.now() + 1000 * 60 * 60;
      await user.save();

      const resetUrl = `http://localhost:3000/resetPassword?token=${token}&id=${user._id}`;
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">

        <h2 style="color: #08451c; margin-bottom: 20px;">
          🔐 Password Reset Request
        </h2>

        <p style="font-size: 16px; color: #333;">
          Hello,
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          We received a request to reset your password. If you made this request, click the button below to create a new password.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}"
             style="background-color: #08451c; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #777; line-height: 1.6;">
          This link will expire in <strong>1 hour</strong> for your security.
        </p>

        <p style="font-size: 14px; color: #777; line-height: 1.6;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <p style="font-size: 12px; color: #aaa; text-align: center;">
          If you're having trouble clicking the button, copy and paste this URL into your browser:
        </p>

        <p style="font-size: 12px; color: #aaa; word-break: break-all; text-align: center;">
          ${resetUrl}
        </p>

        <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 20px;">
          © ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>

      </div>
    </div>
  `,
      });
      return res.json({
        message: "Reset Password link sent successfully on your email.",
        success: true
      });
    } catch (err) {
      console.error("SendGrid error:", err);
      return res.status(500).json({ error: "Failed to send reset password email", success: false });
    }

  };
  resetPassword = async (req, res) => {
    const { id, token, newPassword } = req.body;
    if (!id || !token || !newPassword)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findById(id);
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (Date.now() > user.resetPasswordExpires)
      return res.status(400).json({ message: "Token expired" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== user.resetPasswordToken)
      return res.status(400).json({ message: "Invalid token" });
    if (user.role === "Company") {
      const company = await SoftCompany.findByIdAndUpdate(id, { password: newPassword }, { new: true });
      if (!company) return res.status(404).json({ error: "Company not found", success: false });
      company.password = newPassword;

      company.resetPasswordToken = undefined;
      company.resetPasswordExpires = undefined;
      await company.save();
      user.password = newPassword;

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

    }
    user.password = newPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  };
  updateprofile = async (req, res) => {
    try {
      const {
        name,
        headline,
        location,
        about,
        skills,
        experience,
        education,
        avatar,
        banner,
      } = req.body;
      const id = req.params.id;
      // Verify that the user is updating their own profile

      // Build update object, only including fields that are provided
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (headline !== undefined) updateData.headline = headline;
      if (location !== undefined) updateData.location = location;
      if (about !== undefined) updateData.about = about;
      if (skills !== undefined) updateData.skills = skills;
      if (experience !== undefined) updateData.experience = experience;
      if (education !== undefined) updateData.education = education;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (banner !== undefined) updateData.banner = banner;

      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Profile update error:", error);
      res
        .status(500)
        .json({ error: "Failed to update profile", message: error.message });
    }
  };
  uploadImages = async (req, res) => {
    try {
      const id = req.params.id;

      let updateData = {};

      if (req.files?.avatar?.length > 0) {
        updateData.avatar = req.files.avatar[0].path;
      }

      if (req.files?.banner?.length > 0) {
        updateData.banner = req.files.banner[0].path;
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.json({
        success: true,
        user: updatedUser,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || err,
      });
    }
  };
}

export default AuthController;
