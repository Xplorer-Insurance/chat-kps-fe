"use client"
import { ChevronDown } from "lucide-react"
import * as Select from "@radix-ui/react-select"

const models = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "Azure AI" },
  { id: "gpt-4o", name: "GPT-4o", provider: "Azure AI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "Azure AI" },
]

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Modelo:</span>
      <Select.Root value={selectedModel} onValueChange={onModelChange}>
        <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
          <Select.Value />
          <ChevronDown className="h-4 w-4" />
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
            <Select.Viewport>
              {models.map((model) => (
                <Select.Item
                  key={model.id}
                  value={model.id}
                  className="flex flex-col items-start px-3 py-2 rounded-md hover:bg-accent cursor-pointer outline-none"
                >
                  <Select.ItemText>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
