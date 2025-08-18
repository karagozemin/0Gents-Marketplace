export type ChatMessage = { role: "user" | "agent"; content: string };

export async function callCompute(messages: ChatMessage[]): Promise<string> {
  // TODO: integrate 0G Compute SDK in later waves
  const lastUser = messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
  return `Echo: ${lastUser}`;
}


