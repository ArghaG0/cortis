import React from 'react'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { useEffect, useState } from 'react'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'

const Feed = () => {
  const [feeds, setfeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const {data} = await api.get('/api/post/feed',{headers: {Authorization: `Bearer ${await getToken()}`}})
      if(data.success){
        setfeeds(data.posts)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }
  const handlePostDeleted = (deletedPostId) => {
    setfeeds(prev => prev.filter(p => p._id !== deletedPostId));
  }

  const handlePostUpdated = (updatedPost) => {
    setfeeds(prev => prev.map(p => p._id === updatedPost._id ? { ...p, ...updatedPost } : p));
  }

  useEffect(() => {
    fetchFeeds()
  },[])

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and post list */}
      <div>
        <StoriesBar/>
        <div className='p-4 space-y-6'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} onPostUpdated={handlePostUpdated} />
          ))}
        </div>
      </div>

      {/*Right sidebar */}
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="" />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful, easy-to-use platform build for results.</p>
        </div>
        <RecentMessages/>
      </div>
    </div>
  ) : <Loading/>
}

export default Feed