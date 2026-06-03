import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Alumni from "../model/alumni.js";
import { uploadToCloudinary } from "../utils.js";
import SoftCompany from "../model/softcompany.js";
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
  updateprofile = async (req, res) => {
    try {
      console.log("req.files", req.files);
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
      const id = req.user._id;
      console.log(id, req.user._id);
      console.log(avatar, banner);
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
