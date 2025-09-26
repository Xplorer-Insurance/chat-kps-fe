"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  Textarea,
  Button,
  Group,
  ActionIcon,
  Collapse,
  Select,
  Slider,
  Text,
  Paper,
  Stack,
  Tooltip,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconSend, IconSettings, IconChevronDown } from "@tabler/icons-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
// 👉 Podés alternar entre streaming o no streaming cambiando esta import:
import { sendStreamingMessage, sendMessage } from "@/redux/slices/messagesSlice"
import { updateChatTitle, updateChatTimestamp } from "@/redux/slices/chatsSlice"
import { AVAILABLE_MODELS, DEFAULT_SETTINGS, TEMPERATURE_MARKS, generateChatTitle } from "@/lib/openai"
import type { ChatSettings } from "@/types"

interface ChatInputProps {
  chatId: string
}

export function ChatInput({ chatId }: ChatInputProps) {
  const dispatch = useAppDispatch()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS)

  const messages = useAppSelector((state) => state.messages.byChatId[chatId] || [])
  const status = useAppSelector((state) => state.messages.statusByChat[chatId] || "idle")
  const currentChat = useAppSelector((state) => state.chats.items.find((chat) => chat.id === chatId))

  const isLoading = status === "loading"
  const canSend = message.trim().length > 0 && !isLoading

  // Focus textarea on mount and when chatId changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [chatId])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = async () => {
    if (!canSend) return

    const userMessage = message.trim()
    setMessage("")

    try {
      // Si es el primer mensaje, generamos un título
      if (messages.length === 0 && currentChat) {
        const newTitle = generateChatTitle(userMessage)
        dispatch(updateChatTitle({ chatId, title: newTitle }))
      }

      // 👉 Elegí UNA de las dos opciones:
      // A) Streaming en vivo (recomendado para UX)
      await dispatch(
        sendStreamingMessage({
          chatId,
          userMessage,
          settings,
        }),
      ).unwrap()

      // // B) Sin streaming (mensaje final recién al terminar)
      // await dispatch(
      //   sendMessage({
      //     chatId,
      //     userMessage,
      //     settings,
      //   }),
      // ).unwrap()

      // Actualizar timestamp del chat
      dispatch(updateChatTimestamp(chatId))
    } catch (error) {
      notifications.show({
        title: "Error al enviar mensaje",
        message: error instanceof Error ? error.message : "Error desconocido",
        color: "red",
      })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleSettingsChange = (key: keyof ChatSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Box
      p="md"
      style={{
        borderTop: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-white)",
      }}
    >
      <Box maw={800} mx="auto">
        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Paper p="md" mb="md" bg="gray.0" radius="md">
            <Stack gap="md">
              <Group grow>
                <Select
                  label="Modelo"
                  value={settings.model}
                  onChange={(value) => value && handleSettingsChange("model", value)}
                  data={AVAILABLE_MODELS}
                  size="sm"
                />
              </Group>

              <Box>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    Temperatura: {settings.temperature}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {settings.temperature === 0
                      ? "Preciso"
                      : settings.temperature <= 0.5
                        ? "Balanceado"
                        : settings.temperature <= 1
                          ? "Creativo"
                          : settings.temperature <= 1.5
                            ? "Muy creativo"
                            : "Experimental"}
                  </Text>
                </Group>
                <Slider
                  value={settings.temperature}
                  onChange={(value) => handleSettingsChange("temperature", value)}
                  min={0}
                  max={2}
                  step={0.1}
                  marks={TEMPERATURE_MARKS}
                  size="sm"
                />
                <Text size="xs" c="dimmed" mt="xs">
                  Controla la creatividad de las respuestas. Valores más altos generan respuestas más creativas pero
                  menos predecibles.
                </Text>
              </Box>
            </Stack>
          </Paper>
        </Collapse>

        {/* Input Area */}
        <Group align="flex-end" gap="sm">
          <Box flex={1}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
              autosize
              minRows={1}
              maxRows={8}
              disabled={isLoading}
              styles={{
                input: { resize: "none" },
              }}
            />
          </Box>

          <Group gap="xs">
            <Tooltip label={showSettings ? "Ocultar configuración" : "Mostrar configuración"}>
              <ActionIcon
                variant={showSettings ? "filled" : "subtle"}
                onClick={() => setShowSettings(!showSettings)}
                size="lg"
              >
                {showSettings ? <IconChevronDown size={18} /> : <IconSettings size={18} />}
              </ActionIcon>
            </Tooltip>

            <Button leftSection={<IconSend size={16} />} onClick={handleSend} disabled={!canSend} loading={isLoading} size="md">
              Enviar
            </Button>
          </Group>
        </Group>

        {/* Keyboard shortcuts hint */}
        <Text size="xs" c="dimmed" ta="center" mt="xs">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </Text>
      </Box>
    </Box>
  )
}
