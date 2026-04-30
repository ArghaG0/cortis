import {createSlice} from '@reduxjs/toolkit'

const initialState={
    messages: []
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {

    }
})

export default messagesSlice.reducer