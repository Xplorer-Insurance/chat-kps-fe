"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { LoadingOverlay, Alert, Button, Group } from "@mantine/core"
import { IconAlertTriangle } from "@tabler/icons-react"
import { ErrorBoundary } from "./ErrorBoundary"
import { usePersistence } from "@/hooks/usePersistence"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useAppDispatch } from "@/redux/hooks"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { loadData, recoverFromBackup, clearAllData } = usePersistence()
  const { handleError } = useErrorHandler()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if localStorage is available
        if (typeof Storage === "undefined") {
          throw new Error("LocalStorage no está disponible")
        }

        // Test localStorage functionality
        const testKey = "test-persistence"
        localStorage.setItem(testKey, "test")
        localStorage.removeItem(testKey)

        const savedData = loadData()
        if (savedData) {
          // Here you would dispatch actions to restore the state
          // For now, we'll just log that data was found
          console.log("Loaded saved data:", savedData)
        }

        setIsLoading(false)
      } catch (error) {
        handleError(error, "app initialization")
        setHasError(true)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [handleError, loadData])

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  if (hasError) {
    return (
      <div style={{ padding: "2rem" }}>
        <Alert icon={<IconAlertTriangle size={16} />} title="Error de persistencia" color="red" variant="light">
          No se pueden cargar los datos guardados. Esto puede deberse a problemas con el almacenamiento local del
          navegador.
          <Group gap="sm" mt="md">
            <Button
              size="sm"
              variant="light"
              color="red"
              onClick={() => {
                const backup = recoverFromBackup()
                if (backup) {
                  window.location.reload()
                } else {
                  alert("No se encontró respaldo de datos")
                }
              }}
            >
              Recuperar respaldo
            </Button>
            <Button size="sm" variant="outline" color="red" onClick={clearAllData}>
              Limpiar datos
            </Button>
          </Group>
        </Alert>
      </div>
    )
  }

  return <ErrorBoundary>{children}</ErrorBoundary>
}
