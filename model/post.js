import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postCategory: {
      type: String,
      required: true,
      enum: ["training", "event", "Job"],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Training fields
    instructor: {
      type: String,
      required: function () {
        return this.postCategory === "training";
      },
    },
    type: {
      type: String,
      enum: ["Workshop", "Training", "Seminar"],
      required: function () {
        return this.postCategory === "training";
      },
    },
    date: {
      type: Date,
      required: function () {
        return this.postCategory === "training";
      },
    },
    time: {
      type: String,
      required: function () {
        return this.postCategory === "training";
      },
    },
    location: {
      type: String,
      required: function () {
        return this.postCategory === "training";
      },
    },
    // Event fields
    eventType: {
      type: String,
      enum: ["Workshop", "Seminar", "Reunion", "Meetup"],
      required: function () {
        return this.postCategory === "event";
      },
    },
    organizer: {
      type: String,
      required: function () {
        return this.postCategory === "event";
      },
    },
    eventDate: {
      type: Date,
      required: function () {
        return this.postCategory === "event";
      },
    },
    eventMode: {
      type: String,
      enum: ["Online", "Physical", "Hybrid"],
      required: function () {
        return this.postCategory === "event";
      },
    },
    startTime: String,
    endTime: String,
    image: String,
    status: {
      type: String,
      default: "Upcoming",
    },
    companyName: String,
    jobtype: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
    },
    salary: String,
    experiencelevel: String,
    educationlevel: String,
    skills: [String],
    timings: String,
    workmode: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Post", postSchema);
