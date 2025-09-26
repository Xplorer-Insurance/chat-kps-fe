"use client"

import { Group, Text, ActionIcon, Menu, Tooltip } from "@mantine/core"
import { IconDots, IconEdit, IconTrash, IconMenu2 } from "@tabler/icons-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { toggleSidebar, openConfirmDialog } from "@/redux/slices/uiSlice"
import { deleteChat, updateChatTitle } from "@/redux/slices/chatsSlice"
import { clearMessages } from "@/redux/slices/messagesSlice"
import { notifications } from "@mantine/notifications"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ChatHeaderProps {
  chatId: string
}

export function ChatHeader({ chatId }: ChatHeaderProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items: chats, activeChatId } = useAppSelector((state) => state.chats)
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)
  const [isEditing, setIsEditing] = useState(false)

  const currentChat = chats.find((chat) => chat.id === chatId)

  if (!currentChat) {
    return null
  }

  const handleRename = () => {
    setIsEditing(true)
    // This would typically open a modal or inline edit
    // For now, we'll use a simple prompt
    const newTitle = prompt("Nuevo título:", currentChat.title)
    if (newTitle && newTitle.trim() !== currentChat.title) {
      dispatch(updateChatTitle({ chatId, title: newTitle.trim() }))
        .unwrap()
        .then(() => {
          notifications.show({
            title: "Chat renombrado",
            message: "El título se ha actualizado correctamente",
            color: "green",
          })
        })
        .catch(() => {
          notifications.show({
            title: "Error",
            message: "No se pudo renombrar el chat",
            color: "red",
          })
        })
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    dispatch(
      openConfirmDialog({
        title: "Eliminar chat",
        message: `¿Estás seguro de que quieres eliminar "${currentChat.title}"? Esta acción no se puede deshacer.`,
        onConfirm: async () => {
          try {
            await dispatch(deleteChat(chatId)).unwrap()
            dispatch(clearMessages(chatId))

            // Redirect to home or another chat
            const remainingChats = chats.filter((c) => c.id !== chatId)
            if (remainingChats.length > 0) {
              router.push(`/chat/${remainingChats[0].id}`)
            } else {
              router.push("/")
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

  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-white)",
      }}
    >
      <Group gap="sm">
        {sidebarCollapsed && (
          <Tooltip label="Mostrar sidebar">
            <ActionIcon variant="subtle" onClick={() => dispatch(toggleSidebar())}>
              <IconMenu2 size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <Text size="lg" fw={600} lineClamp={1}>
          {currentChat.title}
        </Text>
      </Group>

      <Menu shadow="md" width={160} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle">
            <IconDots size={18} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleRename}>
            Renombrar chat
          </Menu.Item>
          <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={handleDelete}>
            Eliminar chat
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
