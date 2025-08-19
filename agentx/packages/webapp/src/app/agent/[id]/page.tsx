"use client";
import { useParams } from "next/navigation";
import { mockAgents } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const agent = mockAgents.find((a) => a.id === id);
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  if (!agent) return <div>Not found.</div>;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="rounded-xl bg-zinc-900 aspect-square flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={agent.image} alt={agent.name} className="w-40 h-14 opacity-80" />
      </div>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{agent.name}</h1>
        <p className="text-sm text-gray-400">by {agent.owner}</p>
        <p className="text-sm text-gray-300">{agent.description}</p>
        <div className="text-lg font-medium">{agent.priceEth} ETH</div>
        <Button size="lg">Buy Now</Button>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="chat">Chat with Agent</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <pre className="text-xs bg-black/30 p-3 rounded-lg overflow-auto">{JSON.stringify(agent, null, 2)}</pre>
          </TabsContent>
          <TabsContent value="history">
            <ul className="text-sm list-disc pl-5">
              {agent.history.map((h, i) => (
                <li key={i}>{h.date} – {h.activity} {h.priceEth ? `(${h.priceEth} ETH)` : ""}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="chat">
            <div className="space-y-2">
              <div className="h-48 overflow-auto rounded-md border p-3 text-sm">
                {messages.length === 0 ? (
                  <p className="text-gray-500">Say hi to the agent…</p>
                ) : (
                  <ul className="space-y-2">
                    {messages.map((m, i) => (
                      <li key={i} className="bg-gray-900 rounded px-2 py-1">{m}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 border rounded-md px-3 py-2 bg-transparent" value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Type a message" />
                <Button onClick={() => { if (!chat.trim()) return; setMessages((p) => [...p, chat]); setChat(""); }}>Send</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


