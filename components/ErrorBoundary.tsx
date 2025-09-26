"use client"

import type React from "react"

import { Component, type ReactNode } from "react"
import { Container, Text, Button, Stack, Alert, Paper } from "@mantine/core"
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Container size="sm" py="xl">
          <Paper p="xl" radius="md" bg="red.0" style={{ border: "1px solid var(--mantine-color-red-3)" }}>
            <Stack align="center" gap="md">
              <IconAlertTriangle size={48} color="var(--mantine-color-red-6)" />
              <Text size="xl" fw={600} c="red.7">
                ¡Algo salió mal!
              </Text>
              <Text c="red.6" ta="center">
                Ha ocurrido un error inesperado en la aplicación. Por favor, recarga la página para continuar.
              </Text>
              {this.state.error && (
                <Alert color="red" title="Detalles del error" style={{ width: "100%" }}>
                  <Text size="sm" ff="monospace">
                    {this.state.error.message}
                  </Text>
                </Alert>
              )}
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={() => window.location.reload()}
                color="red"
                variant="filled"
              >
                Recargar página
              </Button>
            </Stack>
          </Paper>
        </Container>
      )
    }

    return this.props.children
  }
}
