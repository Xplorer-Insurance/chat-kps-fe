"use client"

import { useState } from "react"
import { Modal, Select, Slider, Text, Button, Stack, Group, Box } from "@mantine/core"
import { AVAILABLE_MODELS, DEFAULT_SETTINGS, TEMPERATURE_MARKS } from "@/lib/openai"
import type { ChatSettings } from "@/types"

interface ChatSettingsModalProps {
  opened: boolean
  onClose: () => void
  settings: ChatSettings
  onSave: (settings: ChatSettings) => void
}

export function ChatSettingsModal({ opened, onClose, settings, onSave }: ChatSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings)

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS)
  }

  const handleSettingsChange = (key: keyof ChatSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Configuración del Chat" size="md" centered>
      <Stack gap="lg">
        <Select
          label="Modelo de IA"
          description="Selecciona el modelo que quieres usar para las respuestas"
          value={localSettings.model}
          onChange={(value) => value && handleSettingsChange("model", value)}
          data={AVAILABLE_MODELS}
        />

        <Box>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Temperatura: {localSettings.temperature}
            </Text>
            <Text size="xs" c="dimmed">
              {localSettings.temperature === 0
                ? "Preciso"
                : localSettings.temperature <= 0.5
                  ? "Balanceado"
                  : localSettings.temperature <= 1
                    ? "Creativo"
                    : localSettings.temperature <= 1.5
                      ? "Muy creativo"
                      : "Experimental"}
            </Text>
          </Group>
          <Slider
            value={localSettings.temperature}
            onChange={(value) => handleSettingsChange("temperature", value)}
            min={0}
            max={2}
            step={0.1}
            marks={TEMPERATURE_MARKS}
          />
          <Text size="xs" c="dimmed" mt="xs">
            Controla la creatividad de las respuestas. Valores más altos generan respuestas más creativas pero menos
            predecibles.
          </Text>
        </Box>

        <Group justify="space-between" mt="md">
          <Button variant="subtle" onClick={handleReset}>
            Restablecer
          </Button>
          <Group gap="sm">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}
