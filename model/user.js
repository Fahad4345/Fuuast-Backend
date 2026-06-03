// create a user model
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni",
  },
  name: {
    type: String,
    required: function () {
      return this.role !== "Company";
    },
  },
  reg_no: {
    type: String,
    required: function () {
      return this.role !== "Company";
    },
  },
  role: {
    type: String,
    enum: ["Alumni", "Company", "Admin", "Student"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  banner: {
    type: String,
    default: "",
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
  headline: {
    type: String,
  },
  location: {
    type: String,
  },
  about: {
    type: String,
  },
  skills: {
    type: [String],
    required: function () {
      return this.role !== "Company";
    },
  },
  experience: {
    type: [
      {
        role: {
          type: String,
        },
        company: {
          type: String,
        },
        location: {
          type: String,
        },
        type: {
          type: String,
        },
        startDate: {
          type: String,
        },
        endDate: {
          type: String,
        },
        duration: {
          type: String,
        },
        description: {
          type: String,
        },
        logo: {
          type: String,
        },
      },
    ],
    required: function () {
      return this.role !== "Company";
    },
  },
  resume: {
    type: String,
  },
  education: {
    school: {
      type: String,
    },
    degree: {
      type: String,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    grade: {
      type: String,
    },
    activities: {
      type: String,
    },
    logo: {
      type: String,
    },
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return;
  }

  try {
    // Hash password with salt rounds of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
