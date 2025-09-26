// OpenAI configuration and helper functions
export const AVAILABLE_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Recomendado)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
] as const

export const DEFAULT_SETTINGS = {
  model: "gpt-4o-mini",
  temperature: 0.7,
} as const

export const TEMPERATURE_MARKS = [
  { value: 0, label: "Preciso" },
  { value: 0.5, label: "Balanceado" },
  { value: 1, label: "Creativo" },
  { value: 1.5, label: "Muy creativo" },
  { value: 2, label: "Experimental" },
]

// Helper function to generate chat title from first message
export function generateChatTitle(firstMessage: string): string {
  // Take first 50 characters and clean up
  const title = firstMessage.slice(0, 50).replace(/\n/g, " ").trim()

  return title.length < firstMessage.length ? `${title}...` : title
}

// Helper function to format message timestamp
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return "Hace unos minutos"
  } else if (diffInHours < 24) {
    return `Hace ${Math.floor(diffInHours)} horas`
  } else {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}

// Helper function to validate API key format
export function isValidOpenAIKey(key: string): boolean {
  return key.startsWith("sk-") && key.length > 20
}

// Helper function to validate GitHub token format
export function isValidGitHubToken(token: string): boolean {
  return token.startsWith("ghp_") && token.length > 20
}
