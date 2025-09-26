"use client"

import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { createChat } from "@/redux/slices/chatsSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Sparkles, Zap, Shield, Globe } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items: chats } = useAppSelector((state) => state.chats)

  const handleNewChat = async () => {
    try {
      const result = await dispatch(createChat()).unwrap()
      router.push(`/chat/${result.id}`)
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Chat Inteligente</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Una experiencia de chat moderna y elegante construida con las últimas tecnologías web
            </p>
            <Button
              onClick={handleNewChat}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Comenzar Nuevo Chat
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Respuestas Rápidas</h3>
                <p className="text-sm text-muted-foreground">
                  Obtén respuestas instantáneas con streaming en tiempo real
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Seguro y Privado</h3>
                <p className="text-sm text-muted-foreground">
                  Tus conversaciones están protegidas y son completamente privadas
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Acceso Universal</h3>
                <p className="text-sm text-muted-foreground">
                  Disponible en cualquier dispositivo, en cualquier momento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Chats */}
          {chats.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">Chats Recientes</h2>
              <div className="grid gap-3 max-w-2xl mx-auto">
                {chats.slice(0, 5).map((chat) => (
                  <Card
                    key={chat.id}
                    className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 cursor-pointer hover:shadow-md"
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{chat.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
