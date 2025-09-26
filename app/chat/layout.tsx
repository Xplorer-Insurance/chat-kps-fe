"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { createChat } from "@/redux/slices/chatsSlice"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, Plus, Menu, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { items: chats, activeChatId } = useAppSelector((state) => state.chats)

  const handleNewChat = async () => {
    try {
      const result = await dispatch(createChat()).unwrap()
      router.push(`/chat/${result.id}`)
      setSidebarOpen(false)
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setSidebarOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        >
          <Plus className="w-4 h-4" />
          Nuevo Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              onClick={() => handleChatSelect(chat.id)}
              title={chat.title}
              className={cn(
                "w-full justify-start gap-2 text-left h-auto p-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                activeChatId === chat.id && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{`${chat.title.slice(0, 25)}...`}</p>
                <p className="text-xs text-muted-foreground">{new Date(chat.createdAt).toLocaleDateString()}</p>
              </div>
            </Button>
          ))}
          {chats.length === 0 && (
            <div className="text-center py-8 text-sidebar-foreground/60">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay chats aún</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">{children}</div>
    </div>
  )
}
