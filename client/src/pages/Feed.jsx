import React from 'react'
import { dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import { useEffect, useState } from 'react'
import StoriesBar from '../components/StoriesBar'

const Feed = () => {
  const [feeds, setfeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchFeeds = async () => {
    setfeeds(dummyPostsData)
    setLoading(false)
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
          List of post
        </div>
      </div>

      {/*Right sidebar */}
      <div>
        <div>
          <h1>sponsored</h1>
        </div>
        <h1>recent messages</h1>
      </div>
    </div>
  ) : <Loading/>
}

export default Feed