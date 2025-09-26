import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Chat, ChatState } from "@/types"

// Async thunks
export const createChat = createAsyncThunk("chats/createChat", async (title?: string) => {
  console.log("[v0] createChat thunk started with title:", title)

  const newChat: Chat = {
    id: crypto.randomUUID(),
    title: title || "Nuevo chat",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  console.log("[v0] createChat thunk created chat:", newChat)
  return newChat
})

export const updateChatTitle = createAsyncThunk(
  "chats/updateChatTitle",
  async ({ chatId, title }: { chatId: string; title: string }) => {
    return { chatId, title, updatedAt: new Date().toISOString() }
  },
)

export const deleteChat = createAsyncThunk("chats/deleteChat", async (chatId: string) => {
  return chatId
})

const initialState: ChatState = {
  items: [],
  activeChatId: null,
  status: "idle",
  error: null,
}

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload
    },
    updateChatTimestamp: (state, action: PayloadAction<string>) => {
      const chat = state.items.find((c) => c.id === action.payload)
      if (chat) {
        chat.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create chat
      .addCase(createChat.pending, (state) => {
        console.log("[v0] createChat.pending")
        state.status = "loading"
      })
      .addCase(createChat.fulfilled, (state, action) => {
        console.log("[v0] createChat.fulfilled with payload:", action.payload)
        state.status = "succeeded"
        state.items.unshift(action.payload)
        state.activeChatId = action.payload.id
      })
      .addCase(createChat.rejected, (state, action) => {
        console.log("[v0] createChat.rejected with error:", action.error)
        state.status = "failed"
        state.error = action.error.message || "Error creating chat"
      })
      // Update chat title
      .addCase(updateChatTitle.fulfilled, (state, action) => {
        const chat = state.items.find((c) => c.id === action.payload.chatId)
        if (chat) {
          chat.title = action.payload.title
          chat.updatedAt = action.payload.updatedAt
        }
      })
      // Delete chat
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
        if (state.activeChatId === action.payload) {
          state.activeChatId = state.items.length > 0 ? state.items[0].id : null
        }
      })
  },
})

export const { setActiveChat, updateChatTimestamp } = chatsSlice.actions
export default chatsSlice.reducer
