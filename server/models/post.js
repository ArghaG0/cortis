import mongoose from "mongoose";

const postSchema= new mongoose.Schema({
    user: {type: String, ref:'User', required: true},
    content: {type: String},
    image_urls: [{
        url: { type: String },
        fileId: { type: String }
    }],
    post_type: {type: String, enum: ['text', 'image', 'text_with_image'], required: true},
    likes_count: [{type: String, ref: 'User'}],
    isEdited: {type: Boolean, default: false}
}, {timestamps: true, minimize: false})

const post = mongoose.model('Post',postSchema)

export default post;