import { configureStore, combineReducers } from "@reduxjs/toolkit"
import chatsReducer from "./slices/chatsSlice"
import messagesReducer from "./slices/messagesSlice"
import uiReducer from "./slices/uiSlice"

const rootReducer = combineReducers({
  chats: chatsReducer,
  messages: messagesReducer,
  ui: uiReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
