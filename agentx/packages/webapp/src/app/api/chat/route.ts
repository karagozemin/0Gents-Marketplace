import { NextResponse } from "next/server";
import { callCompute, type ChatMessage } from "@/lib/compute";
import { persistChatLog } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = (body?.messages || []) as ChatMessage[];
    const reply = await callCompute(messages);
    await persistChatLog({ agentId: "demo-agent", createdAt: new Date().toISOString(), messages });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}


