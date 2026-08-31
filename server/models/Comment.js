import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post_id: { type: String, ref: 'Post', required: true },
    author: { type: String, ref: 'User', required: true },
    content: { type: String, required: true }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
