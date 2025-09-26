"use client"

import { Box, Text, Paper, Group, ActionIcon, Tooltip, CopyButton } from "@mantine/core"
import { IconUser, IconRobot, IconCopy, IconCheck } from "@tabler/icons-react"
import type { Message } from "@/types"
import { formatMessageTime } from "@/lib/openai"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  return (
    <Box
      py="md"
      px="lg"
      style={{
        backgroundColor: isUser ? "var(--mantine-color-blue-0)" : "transparent",
      }}
    >
      <Group align="flex-start" gap="md" maw={800} mx="auto">
        {/* Avatar */}
        <Paper
          radius="md"
          p="xs"
          bg={isUser ? "blue.6" : "gray.6"}
          style={{
            minWidth: 32,
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isUser ? <IconUser size={16} color="white" /> : <IconRobot size={16} color="white" />}
        </Paper>

        {/* Message Content */}
        <Box flex={1} miw={0}>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Text size="sm" fw={600} c={isUser ? "blue.7" : "gray.7"}>
              {isUser ? "Tú" : "Asistente"}
            </Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {formatMessageTime(message.createdAt)}
              </Text>
              {isAssistant && (
                <CopyButton value={message.content ?? ""}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copiado" : "Copiar mensaje"}>
                      <ActionIcon variant="subtle" size="sm" onClick={copy}>
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              )}
            </Group>
          </Group>

          {/* Texto plano (sin markdown) */}
          <Box
            style={{
              whiteSpace: "pre-wrap",   // respeta \n
              wordBreak: "break-word",  // evita overflow en palabras largas
              lineHeight: 1.6,
            }}
          >
            <Text size="sm">{message.content}</Text>
          </Box>
        </Box>
      </Group>
    </Box>
  )
}
