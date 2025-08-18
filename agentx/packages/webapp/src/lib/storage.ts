import type { ChatMessage } from "./compute";

export type ChatLog = {
  agentId: string;
  createdAt: string;
  messages: ChatMessage[];
};

export async function persistChatLog(log: ChatLog): Promise<void> {
  // TODO: integrate 0G Storage SDK in later waves
  // For Wave 1, we no-op or log to console
  console.info("Persist chat log (stub)", log.agentId, log.messages.length);
}


