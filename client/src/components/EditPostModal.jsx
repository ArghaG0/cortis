import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const EditPostModal = ({ post, isOpen, onClose, onPostUpdated }) => {
    const [content, setContent] = useState(post?.content || '');
    const [loading, setLoading] = useState(false);
    const { getToken } = useAuth();

    if (!isOpen) return null;

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const { data } = await api.put(`/api/post/${post._id}`, { content }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            
            if (data.success) {
                toast.success('Post updated successfully');
                onPostUpdated(data.post);
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Edit Post</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 cursor-pointer">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="What's on your mind?"
                />
                
                <div className="flex justify-end mt-4">
                    <button 
                        onClick={onClose}
                        className="mr-3 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;
