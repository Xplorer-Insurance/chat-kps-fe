"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { sendStreamingMessage } from "@/redux/slices/messagesSlice"
import { updateChatTitle, updateChatTimestamp } from "@/redux/slices/chatsSlice"
import { generateChatTitle, DEFAULT_SETTINGS } from "@/lib/openai"
import type { ChatSettings } from "@/types"

interface ModernChatInputProps {
  chatId: string
}

export function ModernChatInput({ chatId }: ModernChatInputProps) {
  const dispatch = useAppDispatch()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState("")
  const [settings] = useState<ChatSettings>(DEFAULT_SETTINGS)

  const messages = useAppSelector((state) => state.messages.byChatId[chatId] || [])
  const status = useAppSelector((state) => state.messages.statusByChat[chatId] || "idle")
  const currentChat = useAppSelector((state) => state.chats.items.find((chat) => chat.id === chatId))

  const isLoading = status === "loading"
  const canSend = message.trim().length > 0 && !isLoading

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [chatId])

  const handleSend = async () => {
    if (!canSend) return

    const userMessage = message.trim()
    setMessage("")

    try {
      if (messages.length === 0 && currentChat) {
        const newTitle = generateChatTitle(userMessage)
        dispatch(updateChatTitle({ chatId, title: newTitle }))
      }

      await dispatch(
        sendStreamingMessage({
          chatId,
          userMessage,
          settings,
        }),
      ).unwrap()

      dispatch(updateChatTimestamp(chatId))
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-3 p-4 bg-background rounded-2xl border border-border shadow-sm">
        {/* <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button> */}

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "El asistente está respondiendo..." : "Escribe tu mensaje..."}
            disabled={isLoading}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent",
              "focus-visible:ring-0 focus-visible:ring-offset-0 p-2",
              "placeholder:text-muted-foreground/60",
            )}
            rows={1}
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
          >
            <Mic className="w-4 h-4" />
          </Button> */}

          <Button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "rounded-full w-8 h-8 p-0 transition-all duration-200 mb-1",
              canSend
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            size="icon"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60 text-center mt-2">
        Presiona Enter para enviar • Shift+Enter para nueva línea
      </p>
    </div>
  )
}
