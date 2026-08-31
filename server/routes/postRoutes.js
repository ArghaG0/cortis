import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/auth.js';
import { addPost, getFeedPosts, likePost, editPost, deletePost, addComment, getComments, deleteComment } from '../controllers/postController.js';

const postRouter = express.Router()

postRouter.post('/add', upload.array('images', 4), protect, addPost)
postRouter.get('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)
postRouter.put('/:postId', protect, editPost)
postRouter.delete('/:postId', protect, deletePost)

// Comment routes
postRouter.post('/comment', protect, addComment)
postRouter.get('/comment/:postId', protect, getComments)
postRouter.delete('/comment/:commentId', protect, deleteComment)

export default postRouter