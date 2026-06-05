
import post from "../../model/post.js";


export default function useStudent() {
    const applyJob = async (req, res) => {
        try {
            const { id, jobId } = req.body;
            const job = await post.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: "Job Not Found" });
            }
            if (job.Applicants.includes(id)) {
                return res.status(400).json({ message: "Job Already Applied " });
            }
            job.Applicants.push(id);
            await job.save();
            res.status(200).json({ message: "Job Applied For Successfully", job, success: true });
        } catch (error) {
            res.status(500).json({ message: "Failed to apply for job", error: error.message, success: false });
        }
    }


    return { applyJob };
}
