import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Message, MessagesState, ChatSettings } from "@/types"
import type { RootState } from "../store"

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    {
      chatId,
      userMessage,
      settings = { model: "gpt-4o-mini", temperature: 0.7 },
    }: {
      chatId: string
      userMessage: string
      settings?: ChatSettings
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState
      const existingMessages = state.messages.byChatId[chatId] || []

      // Create user message
      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      }

      // Prepare messages for API
      const messagesForAPI = [
        ...existingMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user" as const, content: userMessage },
      ]

      // Call API (streaming simulado con líneas 0:"...")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForAPI,
          model: settings.model,
          temperature: settings.temperature,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error("No response body")

      let fullContent = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for (let raw of lines) {
          const line = raw.trim()
          if (!line) continue
          if (line.startsWith('0:"')) {
            let content = line.slice(3)
            if (content.endsWith('"')) content = content.slice(0, -1)
            content = content.replace(/\\"/g, '"')
            fullContent += content
          } else if (line.startsWith("data: ")) {
            // Fallback SSE JSON
            const dataStr = line.slice(6)
            try {
              const parsed = JSON.parse(dataStr)
              if (parsed?.content) fullContent += parsed.content
            } catch {
              /* ignore */
            }
          }
        }
      }

      // Assistant final
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullContent,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      }

      return { chatId, userMessage: newUserMessage, assistantMessage }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error")
    }
  },
)

// Normaliza markdown: arregla \r\n, agrega línea en blanco antes de títulos/listas, colapsa saltos extra
function sanitizeMarkdown(s: string): string {
  if (!s) return "";
  return s
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")   // blankline antes de ### Título
    .replace(/([^\n])\n(-|\*|\d+\.)\s/g, "$1\n\n$2 ") // blankline antes de listas
    .replace(/\n{3,}/g, "\n\n"); // colapsa demasiados \n
}

export const sendStreamingMessage = createAsyncThunk(
  "messages/sendStreamingMessage",
  async (
    {
      chatId,
      userMessage,
      settings = { model: "gpt-4o-mini", temperature: 0.7 },
    }: { chatId: string; userMessage: string; settings?: ChatSettings },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const TYPING_SPEED_MS = 12;
      const BATCH_SIZE = 4;
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      const state = getState() as RootState;
      const existingMessages = state.messages.byChatId[chatId] || [];

      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage({ chatId, message: newUserMessage }));

      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage({ chatId, message: assistantMessage }));

      const messagesForAPI = [
        ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: userMessage },
      ];

      console.log("[thunk] -> POST /api/chat", { chatId, count: messagesForAPI.length });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-id": chatId },
        body: JSON.stringify({ messages: messagesForAPI, ...settings }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body (stream)");
      const decoder = new TextDecoder();

      let fullContent = "";
      let buffer = "";

      const typeWriter = async (append: string) => {
        if (!append) return;
        // Sanitizo on the fly para que el markdown quede bien formado
        const sanitizedAppend = sanitizeMarkdown(append);
        for (let i = 0; i < sanitizedAppend.length; i += BATCH_SIZE) {
          const part = sanitizedAppend.slice(i, i + BATCH_SIZE);
          fullContent += part;
          const normalized = sanitizeMarkdown(fullContent);
          dispatch(updateMessageContent({ chatId, messageId: assistantMessageId, content: normalized }));
          await sleep(TYPING_SPEED_MS);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.debug("[thunk] chunk raw:", JSON.stringify(chunk));

        // Compatibilidad con protocolo viejo 0:"..."\n
        buffer += chunk;
        const looksOld = buffer.startsWith('0:"') || buffer.includes('\n0:"');

        if (looksOld) {
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const m = line.match(/^0:"(.*)"$/);
            if (!m) continue;
            const unescaped = m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
            await typeWriter(unescaped);
          }
        } else {
          await typeWriter(chunk);
          buffer = "";
        }

        console.log("[thunk] fullContent snapshot:", JSON.stringify(fullContent));
      }

      console.log("[thunk] stream done. len:", fullContent.length);

      const finalNormalized = sanitizeMarkdown(fullContent);
      dispatch(updateMessageContent({ chatId, messageId: assistantMessageId, content: finalNormalized }));

      return {
        chatId,
        userMessage: newUserMessage,
        assistantMessage: { ...assistantMessage, content: finalNormalized },
      };
    } catch (error) {
      console.error("[thunk] ❌", error);
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);



export const loadMessages = createAsyncThunk("messages/loadMessages", async (chatId: string) => {
  // Persistidos en localStorage; esto asegura shape inicial
  return { chatId }
})

const initialState: MessagesState = {
  byChatId: {},
  statusByChat: {},
  errorByChat: {},
}

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload
      if (!state.byChatId[chatId]) state.byChatId[chatId] = []
      state.byChatId[chatId].push(message)
    },
    updateMessageContent: (state, action: PayloadAction<{ chatId: string; messageId: string; content: string }>) => {
      const { chatId, messageId, content } = action.payload
      if (state.byChatId[chatId]) {
        const message = state.byChatId[chatId].find((m) => m.id === messageId)
        if (message) message.content = content
      }
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const chatId = action.payload
      delete state.byChatId[chatId]
      delete state.statusByChat[chatId]
      delete state.errorByChat[chatId]
    },
    deleteMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload
      if (state.byChatId[chatId]) {
        state.byChatId[chatId] = state.byChatId[chatId].filter((m) => m.id !== messageId)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message (no incremental)
      .addCase(sendMessage.pending, (state, action) => {
        const chatId = action.meta.arg.chatId
        state.statusByChat[chatId] = "loading"
        state.errorByChat[chatId] = null as any
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, userMessage, assistantMessage } = action.payload
        state.statusByChat[chatId] = "succeeded"
        if (!state.byChatId[chatId]) state.byChatId[chatId] = []
        state.byChatId[chatId].push(userMessage, assistantMessage)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const chatId = action.meta.arg.chatId
        state.statusByChat[chatId] = "failed"
        state.errorByChat[chatId] = action.payload as string
      })
      // Load messages
      .addCase(loadMessages.fulfilled, (state, action) => {
        const { chatId } = action.payload
        if (!state.byChatId[chatId]) state.byChatId[chatId] = []
        state.statusByChat[chatId] = "succeeded"
      })
      // Streaming (incremental)
      .addCase(sendStreamingMessage.pending, (state, action) => {
        const chatId = action.meta.arg.chatId
        state.statusByChat[chatId] = "loading"
        state.errorByChat[chatId] = null as any
      })
      .addCase(sendStreamingMessage.fulfilled, (state, action) => {
        const chatId = action.meta.arg.chatId
        state.statusByChat[chatId] = "succeeded"
      })
      .addCase(sendStreamingMessage.rejected, (state, action) => {
        const chatId = action.meta.arg.chatId
        state.statusByChat[chatId] = "failed"
        state.errorByChat[chatId] = action.payload as string
      })
  },
})

export const { addMessage, updateMessageContent, clearMessages, deleteMessage } = messagesSlice.actions
export default messagesSlice.reducer
