import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import Layout from './pages/Layout'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Discover from './pages/Discover'
import Connections from './pages/Connections'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import {useUser} from '@clerk/clerk-react'
import {Toaster} from 'react-hot-toast'

const App = () => {
  const {user} = useUser()
  return (
    <>
      <Toaster/>
      <Routes>
        <Route path='/' element={ !user ? <Login/> : <Layout/>}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userID' element={<ChatBox />} />
          <Route path='discover' element={<Discover />} />
          <Route path='connections' element={<Connections />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App