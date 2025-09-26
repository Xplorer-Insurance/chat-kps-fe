"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  TextInput,
  ScrollArea,
  Stack,
  Group,
  Text,
  ActionIcon,
  Menu,
  Paper,
  Divider,
  Tooltip,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconPlus, IconSearch, IconMessage, IconDots, IconEdit, IconTrash, IconMenu2, IconX } from "@tabler/icons-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { createChat, deleteChat, updateChatTitle, setActiveChat } from "@/redux/slices/chatsSlice"
import { clearMessages } from "@/redux/slices/messagesSlice"
import { toggleSidebar, openConfirmDialog } from "@/redux/slices/uiSlice"
import { formatMessageTime } from "@/lib/openai"
import type { Chat } from "@/types"

interface ChatItemProps {
  chat: Chat
  isActive: boolean
  onSelect: (chatId: string) => void
  onRename: (chatId: string, newTitle: string) => void
  onDelete: (chatId: string) => void
}

function ChatItem({ chat, isActive, onSelect, onRename, onDelete }: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chat.title)

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      onRename(chat.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleRename()
    } else if (event.key === "Escape") {
      setEditTitle(chat.title)
      setIsEditing(false)
    }
  }

  return (
    <Paper
      p="sm"
      radius="md"
      bg={isActive ? "blue.0" : "transparent"}
      style={{
        cursor: "pointer",
        border: isActive ? "1px solid var(--mantine-color-blue-3)" : "1px solid transparent",
      }}
      onClick={() => !isEditing && onSelect(chat.id)}
    >
      <Group justify="space-between" align="flex-start" gap="xs">
        <Box flex={1} miw={0}>
          {isEditing ? (
            <TextInput
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              size="xs"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Stack gap={2}>
              <Text size="sm" fw={500} lineClamp={2}>
                {chat.title}
              </Text>
              <Text size="xs" c="dimmed">
                {formatMessageTime(chat.updatedAt)}
              </Text>
            </Stack>
          )}
        </Box>

        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              style={{ opacity: isActive ? 1 : 0.6 }}
            >
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              Renombrar
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(chat.id)
              }}
            >
              Eliminar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  )
}

export function Sidebar() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items: chats, activeChatId, status } = useAppSelector((state) => state.chats)
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleNewChat = async () => {
    try {
      const result = await dispatch(createChat())
      if (createChat.fulfilled.match(result)) {
        router.push(`/chat/${result.payload.id}`)
        notifications.show({
          title: "Nuevo chat creado",
          message: "¡Listo para comenzar a conversar!",
          color: "green",
        })
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo crear el chat",
        color: "red",
      })
    }
  }

  const handleSelectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId))
    router.push(`/chat/${chatId}`)
  }

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      await dispatch(updateChatTitle({ chatId, title: newTitle }))
      notifications.show({
        title: "Chat renombrado",
        message: "El título se ha actualizado correctamente",
        color: "green",
      })
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo renombrar el chat",
        color: "red",
      })
    }
  }

  const handleDeleteChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) return

    dispatch(
      openConfirmDialog({
        title: "Eliminar chat",
        message: `¿Estás seguro de que quieres eliminar "${chat.title}"? Esta acción no se puede deshacer.`,
        onConfirm: async () => {
          try {
            await dispatch(deleteChat(chatId))
            dispatch(clearMessages(chatId))

            // Redirect if this was the active chat
            if (activeChatId === chatId) {
              const remainingChats = chats.filter((c) => c.id !== chatId)
              if (remainingChats.length > 0) {
                router.push(`/chat/${remainingChats[0].id}`)
              } else {
                router.push("/")
              }
            }

            notifications.show({
              title: "Chat eliminado",
              message: "El chat se ha eliminado correctamente",
              color: "green",
            })
          } catch (error) {
            notifications.show({
              title: "Error",
              message: "No se pudo eliminar el chat",
              color: "red",
            })
          }
        },
      }),
    )
  }

  if (sidebarCollapsed) {
    return (
      <Box
        w={60}
        h="100vh"
        bg="gray.0"
        p="sm"
        style={{
          borderRight: "1px solid var(--mantine-color-gray-3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Tooltip label="Expandir sidebar" position="right">
          <ActionIcon variant="subtle" onClick={() => dispatch(toggleSidebar())}>
            <IconMenu2 size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Nuevo chat" position="right">
          <ActionIcon variant="filled" color="blue" mt="md" onClick={handleNewChat}>
            <IconPlus size={20} />
          </ActionIcon>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box
      w={300}
      h="100vh"
      bg="gray.0"
      p="md"
      style={{
        borderRight: "1px solid var(--mantine-color-gray-3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600}>
          ChatGPT Clone
        </Text>
        <ActionIcon variant="subtle" onClick={() => dispatch(toggleSidebar())}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {/* New Chat Button */}
      <Button
        leftSection={<IconPlus size={16} />}
        variant="filled"
        fullWidth
        mb="md"
        onClick={handleNewChat}
        loading={status === "loading"}
      >
        Nuevo chat
      </Button>

      {/* Search */}
      <TextInput
        placeholder="Buscar chats..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb="md"
      />

      <Divider mb="md" />

      {/* Chat List */}
      <ScrollArea flex={1} className="chat-scroll">
        {filteredChats.length === 0 ? (
          <Stack align="center" justify="center" h={200} gap="md">
            <IconMessage size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" ta="center">
              {searchQuery ? "No se encontraron chats" : "No hay chats aún"}
            </Text>
            {!searchQuery && (
              <Button variant="light" size="sm" onClick={handleNewChat}>
                Crear primer chat
              </Button>
            )}
          </Stack>
        ) : (
          <Stack gap="xs">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={handleSelectChat}
                onRename={handleRenameChat}
                onDelete={handleDeleteChat}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Box>
  )
}
