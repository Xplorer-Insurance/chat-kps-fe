import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const { messages } = await req.json();

    console.log("[/api/chat] IN", {
      time: new Date().toISOString(),
      count: Array.isArray(messages) ? messages.length : 0,
      preview: Array.isArray(messages) ? messages.at(-1)?.content?.slice(0, 80) : null,
    });

    if (!Array.isArray(messages) || messages.length === 0) {
      return streamText("❌ Se requiere un array de mensajes válido");
    }

    // Último mensaje del usuario -> question
    const lastUser = [...messages].reverse().find(
      (m: any) => m?.role === "user" && typeof m?.content === "string"
    );
    if (!lastUser?.content) {
      return streamText("❌ No se encontró un mensaje de usuario válido para construir la pregunta");
    }
    const question = String(lastUser.content).trim();

    // ID de hilo/sesión
    const userId = req.headers.get("x-session-id") ?? `web-${crypto.randomUUID()}`;

    const localApiUrl = process.env.LOCAL_CHAT_API_URL ?? "http://localhost:8000/chat";

    console.log("[/api/chat] CALL -> FastAPI", {
      userId,
      localApiUrl,
      questionPreview: question.slice(0, 80),
    });

    const response = await fetch(localApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, question }),
      cache: "no-store",
    });

    console.log("[/api/chat] FastAPI resp", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await safeReadText(response);
      console.error("[/api/chat] ❌ Error de API local:", {
        status: response.status,
        statusText: response.statusText,
        bodyPreview: errorText?.slice(0, 200),
      });
      return streamText(`❌ Error ${response.status}: ${response.statusText}`);
    }

    // Parseamos respuesta
    const payload = await safeReadJsonOrText(response);

    const answer: string =
      (payload && typeof payload === "object" && "answer" in payload && (payload as any).answer) ??
      (typeof payload === "string" ? payload : JSON.stringify(payload));

    console.log("[/api/chat] OK answer", {
      length: answer?.length ?? 0,
      preview: (answer ?? "").slice(0, 120),
      tookMs: Date.now() - startedAt,
    });

    return streamText(answer || "");
  } catch (error) {
    console.error("[/api/chat] ❌ Error general:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return streamText(`❌ Error: ${msg}`);
  }
}

async function safeReadJsonOrText(res: Response) {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }
}

async function safeReadText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

// Stream de texto *crudo* (markdown-friendly)
function streamText(text: string) {
  const encoder = new TextEncoder();
  const CHUNK_SIZE = 512;

  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        const part = text.slice(i, i + CHUNK_SIZE);
        controller.enqueue(encoder.encode(part)); // texto crudo, sin 0:"..."\n
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET() {
  return Response.json({
    message: "Proxy a FastAPI /chat con streaming de texto crudo (markdown) + logs",
    endpoint: "/api/chat",
    method: "POST",
    streaming: true,
    localApi: process.env.LOCAL_CHAT_API_URL ?? "http://localhost:8000/chat",
  });
}
