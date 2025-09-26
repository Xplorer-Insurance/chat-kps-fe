"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setActiveChat, createChat } from "@/redux/slices/chatsSlice"
import { MessageBubble } from "@/components/MessageBubble"
import { TypingIndicator } from "@/components/TypingIndicator"
import { ModernChatInput } from "@/components/ModernChatInput"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles } from "lucide-react"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isCreating, setIsCreating] = useState(false)

  const { items: chats, activeChatId } = useAppSelector((state) => state.chats)
  const messages = useAppSelector((state) => state.messages.byChatId[params.chatId as string] || [])
  const status = useAppSelector((state) => state.messages.statusByChat[params.chatId as string] || "idle")

  const chatId = params.chatId as string
  const isLoading = status === "loading"

  const lastMessage = messages[messages.length - 1]
  const isStreamingResponse = isLoading && lastMessage?.role === "assistant"

  useEffect(() => {
    console.log("[v0] ChatPage useEffect - chatId:", chatId, "isCreating:", isCreating)

    if (chatId === "new" && !isCreating) {
      console.log("[v0] Starting chat creation...")
      setIsCreating(true)

      dispatch(createChat())
        .unwrap()
        .then((newChat) => {
          console.log("[v0] Chat created successfully:", newChat)
          router.replace(`/chat/${newChat.id}`)
        })
        .catch((error) => {
          console.error("[v0] Failed to create chat:", error)
          setIsCreating(false)
          router.push("/")
        })
    }
  }, [chatId, dispatch, router, isCreating])

  useEffect(() => {
    if (chatId && chatId !== "new" && isCreating) {
      console.log("[v0] Arrived at real chat, resetting isCreating")
      setIsCreating(false)
    }

    if (chatId && chatId !== "new" && chatId !== activeChatId && !isCreating) {
      console.log("[v0] Setting active chat:", chatId)
      const chatExists = chats.some((chat) => chat.id === chatId)
      if (chatExists) {
        dispatch(setActiveChat(chatId))
      } else {
        console.log("[v0] Chat not found, redirecting to home")
        router.push("/")
      }
    }
  }, [chatId, activeChatId, chats, dispatch, router, isCreating])

  if (chatId === "new" || isCreating) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Creando nuevo chat...</p>
        </div>
      </div>
    )
  }

  const currentChat = chats.find((chat) => chat.id === chatId)
  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Chat no encontrado</h2>
            <p className="text-muted-foreground mb-4">El chat que buscas no existe.</p>
            <Button onClick={() => router.push("/")}>Volver al inicio</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-card-foreground">{currentChat.title}</h1>
              <p className="text-xs text-muted-foreground">
                {messages.length} {messages.length === 1 ? "mensaje" : "mensajes"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto chat-scroll">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-card-foreground">¡Hola! ¿En qué puedo ayudarte?</h2>
                  <p className="text-muted-foreground max-w-md">
                    Escribe tu mensaje y comenzaremos una conversación.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                    isStreaming={isStreamingResponse && index === messages.length - 1}
                  />
                ))}
                {isLoading && !isStreamingResponse && <TypingIndicator />}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <ModernChatInput chatId={chatId} />
        </div>
      </div>
    </div>
  )
}
