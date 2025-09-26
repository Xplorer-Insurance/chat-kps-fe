"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bot, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Message } from "@/types"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

interface MessageBubbleProps {
  message: Message
  isLast?: boolean
  isStreaming?: boolean
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isLast,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  // Normaliza saltos y evita \r\n raros
  const md = useMemo(() => (message.content || "").replace(/\r\n/g, "\n"), [message.content])

  const formatTime = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) throw new Error("invalid date")
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className={cn("group flex gap-4 message-bubble", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{isUser ? "Tú" : "Asistente"}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp || message.createdAt || new Date())}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm leading-relaxed",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground border border-border"
          )}
        >
          {/* 🔽 AQUÍ se renderiza el Markdown */}
          <div className="break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              // por seguridad, ignoramos HTML embebido
              skipHtml
              components={{
                // párrafos
                p: ({ children, ...props }) => (
                  <p className="my-2 whitespace-pre-wrap" {...props}>
                    {children}
                  </p>
                ),
                // títulos
                h1: ({ children, ...props }) => (
                  <h3 className="text-base font-semibold mt-3 mb-1" {...props}>
                    {children}
                  </h3>
                ),
                h2: ({ children, ...props }) => (
                  <h4 className="text-sm font-semibold mt-3 mb-1" {...props}>
                    {children}
                  </h4>
                ),
                h3: ({ children, ...props }) => (
                  <h5 className="text-sm font-semibold mt-3 mb-1" {...props}>
                    {children}
                  </h5>
                ),
                // listas
                ul: ({ children, ...props }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => <li className="[&_p]:m-0" {...props}>{children}</li>,
                // enlaces
                a: ({ children, ...props }) => (
                  <a className="underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                ),
                // código
                code: ({ inline, children, ...props }: any) =>
                  inline ? (
                    <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted border border-border rounded-md p-3 my-3 overflow-x-auto">
                      <code className="font-mono text-xs" {...props}>
                        {children}
                      </code>
                    </pre>
                  ),
                // cita
                blockquote: ({ children, ...props }: any) => (
                  <blockquote
                    className="border-l-4 border-border pl-3 my-3 text-muted-foreground"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-4 border-border" />,
                strong: ({ children, ...props }) => (
                  <strong className="font-semibold" {...props}>
                    {children}
                  </strong>
                ),
                em: ({ children, ...props }) => (
                  <em className="italic" {...props}>
                    {children}
                  </em>
                ),
              }}
            >
              {md}
            </ReactMarkdown>

            {/* cursor de “escribiendo” */}
            {isStreaming && !isUser && (
              <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse rounded-sm align-text-bottom" />
            )}
          </div>
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})
