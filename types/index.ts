export interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
  timestamp: string
}

export interface ChatState {
  items: Chat[]
  activeChatId: string | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

export interface MessagesState {
  byChatId: Record<string, Message[]>
  statusByChat: Record<string, "idle" | "loading" | "succeeded" | "failed">
  errorByChat: Record<string, string | null>
}

export interface UIState {
  sidebarCollapsed: boolean
  confirmDialog: {
    open: boolean
    title: string
    message: string
    onConfirm: (() => void) | null
  }
}

export interface ChatSettings {
  model: string
  temperature: number
}
