import Post from "../../model/post.js";
import User from "../../model/user.js";
const POST_CATEGORIES = ["training", "event"];

export function TrainingWorkshops() {
  const createPost = async (req, res) => {
    try {
      const PostType = req.params.type;
      if (!PostType) {
        return res.status(400).json({ message: "Type is required" });
      }
      if (PostType === "training") {
        const {

          title,
          description,
          location,
          instructor,
          type,
          date,
          time,
          status,
        } = req.body;

        if (
          !title ||
          !description ||
          !location ||
          !instructor ||
          !type ||
          !date ||
          !time
        ) {
          return res
            .status(400)
            .json({ message: "Please fill all the fields" });
        }

        const payload = {
          postCategory: PostType,
          title,
          description,
          location,
          instructor,
          type,
          date,
          time,
          status,
        };
        const post = new Post(payload);
        await post.save();
        res
          .status(201)
          .json({ message: "Training post created successfully", post });
      }
      if (PostType === "event") {
        const {
          title,
          description,
          location,
          eventType,
          organizer,
          eventDate,
          eventMode,
          startTime,
          endTime,
          image,
          status,
        } = req.body;
        if (
          !title ||
          !description ||
          !location ||
          !eventType ||
          !organizer ||
          !eventDate ||
          !eventMode ||
          !startTime ||
          !endTime ||
          !status
        ) {
          return res
            .status(400)
            .json({ message: "Please fill all the fields" });
        }
        if (!req.file?.path) {
          return res.status(400).json({ message: "Please upload an image" });
        }

        const payload = {
          postCategory: PostType,
          title,
          description,
          location,
          eventType,
          organizer,
          eventDate,
          eventMode,
          startTime,
          endTime,
          image: req.file?.path,
          status,
        };
        const post = new Post(payload);
        await post.save();
        res
          .status(201)
          .json({ message: "Event post created successfully", post });
      }
      if (PostType === "Job") {

        console.log(req.body);

        const {
          userId,
          title,
          description,
          companyName,
          companyEmail,
          jobtype,
          location,
          salary,
          experiencelevel,
          educationlevel,
          skills,
          timings,
          workmode,
          lastDate,
        } = req.body;
        if (!userId) {
          return res.status(400).json({ message: "User ID is required" });
        }
        if (
          !title ||
          !description ||
          !companyName ||
          !jobtype ||
          !location ||
          !salary ||
          !experiencelevel ||
          !educationlevel ||
          !skills ||
          !timings ||
          !workmode
        ) {
          return res
            .status(400)
            .json({ message: "Please fill all the fields" });
        }
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const payload = {
          user,
          postCategory: PostType,
          title,
          description,
          companyName,
          companyEmail,
          jobtype,
          location,
          salary,
          experiencelevel,
          educationlevel,
          skills,
          timings,
          workmode,
          lastDateToApply: lastDate || null,
        };
        const post = new Post(payload);
        await post.save();
        res
          .status(201)
          .json({ message: "Job post created successfully", post });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create post", error: error.message });
    }
  };
  const getPosts = async (req, res) => {
    try {
      const PostType = req.params.type;
      if (!PostType) {
        return res.status(400).json({ message: "Type is required" });
      }
      if (PostType === "feed") {
        const posts = await Post.find()
          .sort({ createdAt: -1 })
          .populate("user", "name avatar role");
        res.status(200).json({ message: "Posts fetched successfully", posts });
      }
      if (PostType === "training") {
        const posts = await Post.find({ postCategory: PostType }).sort({
          createdAt: -1,
        });
        res.status(200).json({ message: "Posts fetched successfully", posts });
      }
      if (PostType === "event") {
        const posts = await Post.find({ postCategory: PostType }).sort({
          createdAt: -1,
        });
        res.status(200).json({ message: "Posts fetched successfully", posts });
      }
      if (PostType === "Job") {
        const today = new Date();

        const posts = await Post.find({
          postCategory: PostType,
          $or: [
            { lastDateToApply: null }, // no deadline
            { lastDateToApply: { $gte: today } }, // deadline not crossed
          ],
        })
          .sort({
            createdAt: -1,
          })
          .populate("user", "name avatar role");

        res.status(200).json({
          message: "Posts fetched successfully",
          posts,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get posts", error: error.message });
    }
  };
  const deletePost = async (req, res) => {
    try {
      const { id } = req.params;
      await Post.findByIdAndDelete(id);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete post", error: error.message });
    }
  };
  const updatePost = async (req, res) => {
    try {
      const { id } = req.params;
      const PostType = req.params.type;
      if (!PostType) {
        return res.status(400).json({ message: "Type is required" });
      }
      if (PostType === "training") {
        const {
          title,
          description,
          location,
          instructor,
          type,
          date,
          time,
          status,
        } = req.body;
        if (
          !title ||
          !description ||
          !location ||
          !instructor ||
          !type ||
          !date ||
          !time
        ) {
          return res
            .status(400)
            .json({ message: "Please fill all the fields" });
        }
        const payload = {
          title,
          postCategory: PostType,
          description,
          location,
          instructor,
          type,
          date,
          time,
          status,
        };
        const post = await Post.findByIdAndUpdate(id, payload, {
          new: true,
          runValidators: true,
        });
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post updated successfully", post });
      }
      if (PostType === "event") {
        const {
          title,
          description,
          location,
          eventType,
          organizer,
          eventDate,
          eventMode,
          startTime,
          endTime,
          image,
          status,
        } = req.body;
        if (
          !title ||
          !description ||
          !location ||
          !eventType ||
          !organizer ||
          !eventDate ||
          !eventMode ||
          !startTime ||
          !endTime ||
          !status
        ) {
          return res
            .status(400)
            .json({ message: "Please fill all the fields" });
        }



        const payload = {
          title,
          postCategory: PostType,
          description,
          location,
          eventType,
          organizer,
          eventDate,
          eventMode,
          startTime,
          endTime,
          image: req.file?.path,
          status,
        };
        const post = await Post.findByIdAndUpdate(id, payload, {
          new: true,
          runValidators: true,
        });
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post updated successfully", post });
      }
      if (PostType === "Job") {
        const { id } = req.params;
        const ispost = await Post.findById(id);
        if (!ispost) {
          return res.status(404).json({ message: "Post not found" });
        }
        const { title, description, companyName, companyEmail, jobtype, location, salary, experiencelevel, educationlevel, skills, timings, workmode, lastDate } = req.body;
        if (!title || !description || !companyName || !jobtype || !location || !salary || !experiencelevel || !educationlevel || !skills || !timings || !workmode || !lastDate) {
          return res.status(400).json({ message: "Please fill all the fields" });
        }
        const payload = {
          title,
          postCategory: PostType,
          description,
          companyName,
          companyEmail,
          jobtype,
          location,
          salary,
          experiencelevel,
          educationlevel,
          skills,
          timings,
          workmode,
          lastDateToApply: lastDate,
        };
        const post = await Post.findByIdAndUpdate(id, payload, {
          new: true,
          runValidators: true,
        });
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post updated successfully", post });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update post", error: error.message });
    }
  };
  return {
    createPost,
    getPosts,
    deletePost,
    updatePost,
  };
}
