import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'contents', required: true },
  userId: { type: String, required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("comments", commentSchema);