import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UIState } from "@/types"

const initialState: UIState = {
  sidebarCollapsed: false,
  confirmDialog: {
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  },
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    openConfirmDialog: (
      state,
      action: PayloadAction<{
        title: string
        message: string
        onConfirm: () => void
      }>,
    ) => {
      state.confirmDialog = {
        open: true,
        title: action.payload.title,
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
      }
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog = {
        open: false,
        title: "",
        message: "",
        onConfirm: null,
      }
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed, openConfirmDialog, closeConfirmDialog } = uiSlice.actions
export default uiSlice.reducer
