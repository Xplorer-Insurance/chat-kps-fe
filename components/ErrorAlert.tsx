"use client"

import { Alert, Button, Group } from "@mantine/core"
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorAlert({ title = "Error", message, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} title={title} color="red" variant="light" style={{ margin: "1rem" }}>
      {message}
      {(onRetry || onDismiss) && (
        <Group gap="sm" mt="sm">
          {onRetry && (
            <Button size="xs" variant="light" color="red" leftSection={<IconRefresh size={14} />} onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {onDismiss && (
            <Button size="xs" variant="subtle" color="red" onClick={onDismiss}>
              Descartar
            </Button>
          )}
        </Group>
      )}
    </Alert>
  )
}
