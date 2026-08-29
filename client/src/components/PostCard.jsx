import { BadgeCheck, Heart, MessageCircle, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import EditPostModal from './EditPostModal'

const PostCard = ({post, onPostUpdated, onPostDeleted}) => {
    const postWithHastags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>')
    const [likes, setLikes] = useState(post.likes_count)
    const [showMenu, setShowMenu] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const currentUser = useSelector((state) => state.user.value)

    const {getToken} = useAuth()

    const handleLike = async () => {
        try {
            const {data} = await api.post(`/api/post/like`, {postId: post._id},{headers: {Authorization: `Bearer ${await getToken()}`}})
            if(data.success){
                toast.success(data.message)
                setLikes(prev => {
                    if(prev.includes(currentUser._id)){
                        return prev.filter(id => id != currentUser._id)
                    }else{
                        return [...prev, currentUser._id]
                    }
                })
            }else{
                toast(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

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
        <div className='flex justify-between items-start'>
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
                <div className='relative'>
                    <button onClick={() => { setShowMenu(!showMenu); setShowConfirmDelete(false); }} className='text-gray-500 hover:bg-gray-100 p-1 rounded-full transition cursor-pointer'>
                        <MoreVertical className='w-5 h-5'/>
                    </button>
                    
                    {showMenu && (
                        showConfirmDelete ? (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 p-3'>
                                <p className='text-sm text-gray-800 mb-3 text-center'>Delete this post?</p>
                                <div className='flex justify-between gap-2'>
                                    <button 
                                        onClick={() => { setShowConfirmDelete(false); setShowMenu(false); }}
                                        className='flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className='flex-1 px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-10'>
                                <button 
                                    onClick={() => { setShowMenu(false); setIsEditModalOpen(true); }}
                                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer'
                                >
                                    <Edit className='w-4 h-4'/> Edit
                                </button>
                                <button 
                                    onClick={() => setShowConfirmDelete(true)}
                                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer'
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
        <div className='grid grid-cols-2 gap-2'>
            {post.image_urls.map((img, index) => (
                <img src={img.url || img} key={index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} alt=""/>
            ))}

        </div>

        {/* post actions */}
        <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
            <div className='flex items-center gap-1'>
                <Heart className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} onClick={handleLike}/>
                <span>{likes.length}</span>
            </div>
            <div className='flex items-center gap-1'>
                <MessageCircle className='w-4 h-4'/>
                <span>{12}</span>
            </div>
            <div className='flex items-center gap-1'>
                <Share2 className='w-4 h-4'/>
                <span>{7}</span>
            </div>
        </div>

        <EditPostModal post={post} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onPostUpdated={onPostUpdated}/>
    </div>
  )
}

export default PostCard