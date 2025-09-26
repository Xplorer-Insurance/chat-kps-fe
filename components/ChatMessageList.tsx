"use client"

import { useEffect, useRef } from "react"
import { Box, ScrollArea, Stack, Text, Loader, Center, Group, Paper } from "@mantine/core"
import { IconMessage } from "@tabler/icons-react"
import { useAppSelector } from "@/redux/hooks"
import { ChatMessage } from "./ChatMessage"
import type { RootState } from "@/redux/store"

interface ChatMessageListProps {
  chatId: string
}

export function ChatMessageList({ chatId }: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messages = useAppSelector((state: RootState) => state.messages.byChatId[chatId] || [])
  const status = useAppSelector((state: RootState) => state.messages.statusByChat[chatId] || "idle")
  const error = useAppSelector((state: RootState) => state.messages.errorByChat[chatId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <Center h="100%" style={{ flexDirection: "column" }}>
        <IconMessage size={64} color="var(--mantine-color-gray-4)" />
        <Text size="lg" c="dimmed" mt="md">
          ¡Comienza una conversación!
        </Text>
        <Text size="sm" c="dimmed" ta="center" mt="xs">
          Escribe un mensaje abajo para comenzar a chatear con el asistente de IA.
        </Text>
      </Center>
    )
  }

  return (
    <ScrollArea ref={scrollAreaRef} h="100%" className="chat-scroll" scrollbarSize={6} scrollHideDelay={1000}>
      <Stack gap={0}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {status === "loading" && (
          <Box py="md" px="lg">
            <Group align="flex-start" gap="md" maw={800} mx="auto">
              <Paper
                radius="md"
                p="xs"
                bg="gray.6"
                style={{
                  minWidth: 32,
                  minHeight: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconMessage size={16} color="white" />
              </Paper>
              <Box flex={1} pt="xs">
                <Group gap="xs">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    El asistente está escribiendo...
                  </Text>
                </Group>
              </Box>
            </Group>
          </Box>
        )}

        {/* Error message */}
        {error && (
          <Box py="md" px="lg">
            <Group align="flex-start" gap="md" maw={800} mx="auto">
              <Paper
                radius="md"
                p="xs"
                bg="red.6"
                style={{
                  minWidth: 32,
                  minHeight: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconMessage size={16} color="white" />
              </Paper>
              <Box flex={1}>
                <Text size="sm" c="red.7" fw={600}>
                  Error
                </Text>
                <Text size="sm" c="red.6" mt="xs">
                  {error}
                </Text>
              </Box>
            </Group>
          </Box>
        )}
      </Stack>
    </ScrollArea>
  )
}
