import { BadgeCheck, Heart, MessageCircle, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import EditPostModal from './EditPostModal'
import Lightbox from './Lightbox'
import CommentItem from './CommentItem'

const PostCard = ({post, onPostUpdated, onPostDeleted}) => {
    const postWithHastags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>')
    const [likes, setLikes] = useState(post.likes_count)
    const [showMenu, setShowMenu] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(-1)
    
    // Comments state
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)

    const currentUser = useSelector((state) => state.user.value)

    useEffect(() => {
        const handlePostUpdate = (e) => {
            const data = e.detail;
            if (data.postId === post._id) {
                if (data.likes) {
                    setLikes(data.likes);
                }
                
                if (typeof data.comments_count === 'number') {
                    setCommentsCount(data.comments_count);
                }

                if (showComments) {
                    if (data.updateType === 'comment_added' && data.comment) {
                        setComments(prev => {
                            if (prev.some(c => c._id === data.comment._id)) return prev;
                            return [data.comment, ...prev];
                        });
                    } else if (data.updateType === 'comment_deleted' && data.commentId) {
                        setComments(prev => prev.filter(c => c._id !== data.commentId));
                    }
                }
            }
        };

        window.addEventListener('post_update', handlePostUpdate);
        return () => window.removeEventListener('post_update', handlePostUpdate);
    }, [post._id, showComments]);

    const {getToken} = useAuth()

    const handleLike = async () => {
        try {
            const {data} = await api.post(`/api/post/like`, {postId: post._id},{headers: {Authorization: `Bearer ${await getToken()}`}})
            if(data.success){
                // UI update relies entirely on SSE broadcast
                toast.success(data.message)
            }else{
                toast(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setIsLoadingComments(true);
            try {
                const {data} = await api.get(`/api/post/comment/${post._id}`, {headers: {Authorization: `Bearer ${await getToken()}`}});
                if (data.success) {
                    setComments(data.comments);
                    setCommentsCount(data.comments.length);
                }
            } catch (error) {
                toast.error("Failed to load comments");
            } finally {
                setIsLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            const {data} = await api.post('/api/post/comment', { postId: post._id, content: newComment }, {headers: {Authorization: `Bearer ${await getToken()}`}});
            if (data.success) {
                // Comments and count UI update relies entirely on SSE broadcast
                setNewComment('');
                toast.success('Comment added');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const {data} = await api.delete(`/api/post/comment/${commentId}`, {headers: {Authorization: `Bearer ${await getToken()}`}});
            if (data.success) {
                // Comments and count UI update relies entirely on SSE broadcast
                toast.success('Comment deleted');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const navigate = useNavigate()

    const handleDelete = async () => {
        try {
            setShowConfirmDelete(false);
            setShowMenu(false);
            const {data} = await api.delete(`/api/post/${post._id}`, {headers: {Authorization: `Bearer ${await getToken()}`}});
            if (data.success) {
                toast.success(data.message);
                if (onPostDeleted) onPostDeleted(post._id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
        {/* user info & menu */}
        <div className='flex justify-between items-start select-none'>
            <div onClick={() => navigate('/profile/' + post.user._id )} className='inline-flex items-center gap-3 cursor-pointer'>
                <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow'/>
                <div>
                    <div className='flex items-center space-x-1'>
                        <span>{post.user.full_name}</span>
                        <BadgeCheck className='w-4 h-4 text-blue-500'/>
                    </div>
                    <div className='text-gray-500 text-sm'>
                        @{post.user.username} | {moment(post.createdAt).fromNow()} {post.isEdited && <span className='italic text-xs'>(edited)</span>}
                    </div>
                </div>
            </div>

            {currentUser._id === post.user._id && (
                <div className='relative select-none'>
                    <button onClick={() => { setShowMenu(!showMenu); setShowConfirmDelete(false); }} className='text-gray-500 hover:bg-gray-100 p-1 rounded-full transition cursor-pointer select-none'>
                        <MoreVertical className='w-5 h-5'/>
                    </button>
                    
                    {showMenu && (
                        showConfirmDelete ? (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 p-3'>
                                <p className='text-sm text-gray-800 mb-3 text-center'>Delete this post?</p>
                                <div className='flex justify-between gap-2'>
                                    <button 
                                        onClick={() => { setShowConfirmDelete(false); setShowMenu(false); }}
                                        className='flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer select-none'
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className='flex-1 px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition select-none'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-10'>
                                <button 
                                    onClick={() => { setShowMenu(false); setIsEditModalOpen(true); }}
                                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer select-none'
                                >
                                    <Edit className='w-4 h-4'/> Edit
                                </button>
                                <button 
                                    onClick={() => setShowConfirmDelete(true)}
                                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer select-none'
                                >
                                    <Trash2 className='w-4 h-4'/> Delete
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>

        {/* post content */}
        {post.content && <div className='text-gray-800 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{__html: postWithHastags}}/>}

        {/* post media */}
        <div className='grid grid-cols-2 gap-2 select-none'>
            {post.image_urls.map((img, index) => (
                <img 
                    src={img.url || img} 
                    key={index} 
                    className={`w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-95 transition ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} 
                    alt=""
                    onClick={() => setLightboxIndex(index)}
                />
            ))}
        </div>

        {/* post actions */}
        <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300 select-none'>
            <div className='flex items-center gap-1 cursor-pointer select-none' onClick={handleLike}>
                <Heart className={`w-4 h-4 ${likes.includes(currentUser._id) ? 'text-red-500 fill-red-500' : ''}`} />
                <span>{likes.length}</span>
            </div>
            <div className='flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition select-none' onClick={toggleComments}>
                <MessageCircle className={`w-4 h-4 ${showComments ? 'text-indigo-600 fill-indigo-100' : ''}`}/>
                <span>{commentsCount}</span>
            </div>
            <div className='flex items-center gap-1'>
                <Share2 className='w-4 h-4'/>
                <span>{7}</span>
            </div>
        </div>

        {/* Comments Section */}
        {showComments && (
            <div className='pt-3 border-t border-gray-100 mt-2 space-y-3'>
                {isLoadingComments ? (
                    <p className="text-sm text-gray-500 text-center py-2">Loading comments...</p>
                ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <CommentItem key={comment._id} comment={comment} onDelete={handleDeleteComment} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                )}
                
                <form onSubmit={handleAddComment} className='flex items-center gap-2 mt-2 pt-2'>
                    <img src={currentUser.profile_picture} alt="" className='w-8 h-8 rounded-full object-cover'/>
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder='Add a comment...' 
                        className='flex-1 bg-gray-100 rounded-full px-4 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition'
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className='text-indigo-600 text-sm font-medium px-2 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer'
                    >
                        Post
                    </button>
                </form>
            </div>
        )}

        <EditPostModal post={post} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onPostUpdated={onPostUpdated}/>
        <Lightbox 
            images={post.image_urls} 
            isOpen={lightboxIndex >= 0} 
            initialIndex={lightboxIndex >= 0 ? lightboxIndex : 0} 
            onClose={() => setLightboxIndex(-1)} 
        />
    </div>
  )
}

export default PostCard