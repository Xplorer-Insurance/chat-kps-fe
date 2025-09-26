"use client"

import { Modal, Text, Group, Button } from "@mantine/core"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { closeConfirmDialog } from "@/redux/slices/uiSlice"

export function ConfirmDialog() {
  const dispatch = useAppDispatch()
  const { confirmDialog } = useAppSelector((state) => state.ui)

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm()
    }
    dispatch(closeConfirmDialog())
  }

  const handleCancel = () => {
    dispatch(closeConfirmDialog())
  }

  return (
    <Modal opened={confirmDialog.open} onClose={handleCancel} title={confirmDialog.title} centered size="sm">
      <Text mb="lg">{confirmDialog.message}</Text>
      <Group justify="flex-end" gap="sm">
        <Button variant="subtle" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button color="red" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Group>
    </Modal>
  )
}
