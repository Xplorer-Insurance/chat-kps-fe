"use client"

import { useCallback } from "react"
import { notifications } from "@mantine/notifications"

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ""}:`, error)

    let message = "Ha ocurrido un error inesperado"

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === "string") {
      message = error
    }

    // Show user-friendly error messages
    if (message.includes("fetch")) {
      message = "Error de conexión. Verifica tu conexión a internet."
    } else if (message.includes("401")) {
      message = "Error de autenticación. Verifica tu clave API."
    } else if (message.includes("429")) {
      message = "Demasiadas solicitudes. Espera un momento antes de intentar de nuevo."
    } else if (message.includes("500")) {
      message = "Error del servidor. Intenta de nuevo más tarde."
    }

    notifications.show({
      title: "Error",
      message,
      color: "red",
      autoClose: 5000,
    })

    return message
  }, [])

  const handleSuccess = useCallback((message: string) => {
    notifications.show({
      title: "Éxito",
      message,
      color: "green",
      autoClose: 3000,
    })
  }, [])

  return { handleError, handleSuccess }
}
