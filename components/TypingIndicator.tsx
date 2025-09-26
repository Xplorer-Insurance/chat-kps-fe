"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="group flex gap-4 message-bubble">
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-muted text-muted-foreground">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

      {/* Typing Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">Asistente</span>
          <span className="text-xs text-muted-foreground">escribiendo...</span>
        </div>

        <div className="bg-muted/50 text-foreground border border-border rounded-lg px-4 py-3">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
