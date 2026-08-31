import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Post from '../models/post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { broadcast } from '../utils/sseManager.js';

// Add post
export const addPost= async (req,res) => {
    try {
        const {userId} = req.auth();
        const { content, post_type} = req.body;
        const images = req.files

        let image_urls = []

        if(images.length){
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const filebuffer = fs.readFileSync(image.path)
                    const response = await imagekit.upload({
                        file: filebuffer,
                        fileName: image.originalname,
                        folder: "posts",
                    })

                    const url = imagekit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' }
                        ]
                    })
                    return { url, fileId: response.fileId }

                })
            )
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        res.json({success: true, message:"Post created successfully"})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
        
    }
}

// get posts
export const getFeedPosts= async (req,res) => {
    try {
        const {userId} = req.auth();
        const user = await User.findById(userId)

        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1})

        res.json({success: true, posts})
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// like posts
export const likePost= async (req,res) => {
    try {
        const {userId} = req.auth();
        const {postId} = req.body;

        const post = await Post.findById(postId)

        let message = '';
        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            message = 'Post Unliked';
        }else{
            post.likes_count.push(userId)
            await post.save()
            message = 'Post liked';
        }

        broadcast({
            type: 'post_update',
            postId: post._id,
            updateType: 'like_toggled',
            likes: post.likes_count,
            comments_count: post.comments_count
        });

        res.json({success:true, message});

        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Edit post
export const editPost = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {postId} = req.params;
        const {content} = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.json({success: false, message: 'Post not found'});
        }

        if (post.user !== userId) {
            return res.json({success: false, message: 'Not authorized to edit this post'});
        }

        post.content = content;
        post.isEdited = true;
        await post.save();
        await post.populate('user');

        res.json({success: true, message: 'Post updated successfully', post});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Delete post
export const deletePost = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {postId} = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.json({success: false, message: 'Post not found'});
        }

        if (post.user !== userId) {
            return res.json({success: false, message: 'Not authorized to delete this post'});
        }

        // Cleanup ImageKit
        if (post.image_urls && post.image_urls.length > 0) {
            for (const img of post.image_urls) {
                if (img.fileId) {
                    try {
                        await imagekit.deleteFile(img.fileId);
                    } catch (err) {
                        console.log(`Failed to delete fileId ${img.fileId} from ImageKit:`, err.message);
                    }
                }
            }
        }

        await Post.findByIdAndDelete(postId);
        res.json({success: true, message: 'Post deleted successfully'});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Add comment
export const addComment = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {postId, content} = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.json({success: false, message: 'Post not found'});
        }

        const comment = new Comment({
            post_id: postId,
            author: userId,
            content
        });

        await comment.save();

        post.comments_count += 1;
        await post.save();

        const populatedComment = await Comment.findById(comment._id).populate('author', 'full_name username profile_picture');

        broadcast({
            type: 'post_update',
            postId: post._id,
            updateType: 'comment_added',
            likes: post.likes_count,
            comments_count: post.comments_count,
            comment: populatedComment
        });

        res.json({success: true, message: 'Comment added successfully', comment});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Get comments for a post
export const getComments = async (req, res) => {
    try {
        const {postId} = req.params;
        const comments = await Comment.find({post_id: postId})
            .populate('author', 'full_name username profile_picture')
            .sort({createdAt: -1}); // newest first (standard for feeds usually, or we can use 1 for oldest first. the prompt says "match how likes/existing lists are ordered elsewhere". The feed uses -1)
            
        res.json({success: true, comments});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {commentId} = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.json({success: false, message: 'Comment not found'});
        }

        if (comment.author !== userId) {
            return res.json({success: false, message: 'Not authorized to delete this comment'});
        }

        await Comment.findByIdAndDelete(commentId);

        const post = await Post.findById(comment.post_id);
        if (post) {
            post.comments_count -= 1;
            await post.save();

            broadcast({
                type: 'post_update',
                postId: post._id,
                updateType: 'comment_deleted',
                commentId: commentId,
                likes: post.likes_count,
                comments_count: post.comments_count
            });
        }

        res.json({success: true, message: 'Comment deleted successfully'});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}