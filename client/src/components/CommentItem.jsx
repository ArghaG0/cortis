import React from 'react';
import moment from 'moment';
import { Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { assets } from '../assets/assets';

const CommentItem = ({ comment, onDelete }) => {
    const currentUser = useSelector((state) => state.user.value);
    
    // Ensure author exists before rendering
    if (!comment || !comment.author) return null;

    const isAuthor = currentUser && currentUser._id === comment.author._id;

    return (
        <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition px-2 rounded-lg group">
            <img 
                src={comment.author.profile_picture || assets.sample_profile} 
                alt="" 
                className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800">{comment.author.full_name}</h4>
                        <p className="text-xs text-gray-500">@{comment.author.username} • {moment(comment.createdAt).fromNow()}</p>
                    </div>
                    {isAuthor && (
                        <button 
                            onClick={() => onDelete(comment._id)} 
                            className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer select-none"
                            title="Delete comment"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-700 mt-1 break-words">{comment.content}</p>
            </div>
        </div>
    );
};

export default CommentItem;
