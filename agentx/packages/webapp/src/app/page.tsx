"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useChainId, useReadContract, useWriteContract } from "wagmi";
import { AGENT_REGISTRY_ABI, AGENT_REGISTRY_ADDRESS, INFT_ABI, INFT_ADDRESS, MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import type { ChatMessage } from "@/lib/compute";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [metadata, setMetadata] = useState("https://example.com/agents/demo.json");
  const [mintUri, setMintUri] = useState("https://example.com/agents/inft-demo.json");
  const [listTokenId, setListTokenId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [buyListingId, setBuyListingId] = useState("");
  const { writeContractAsync, isPending } = useWriteContract();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const totalAgents = useReadContract({
    address: (AGENT_REGISTRY_ADDRESS || undefined) as `0x${string}` | undefined,
    abi: AGENT_REGISTRY_ABI,
    functionName: "totalAgents",
    query: { enabled: Boolean(AGENT_REGISTRY_ADDRESS) },
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "agent", content: data.reply || "(no response)" }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: "agent", content: "Error contacting agent." }]);
    }
  };

  const wrongNetwork = mounted && chainId !== 16601;

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AgentX</h1>
          <p className="text-xs text-gray-500">Onchain AI Agent INFT Marketplace (0G-Galileo-Testnet)</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs rounded-full border px-2 py-1 text-gray-600">chain: {mounted && chainId ? chainId : "-"}</span>
          <ConnectButton />
        </div>
      </header>

      {wrongNetwork && (
        <div className="rounded-md border border-yellow-400 bg-yellow-50 text-yellow-700 px-3 py-2 text-sm">
          Please switch to 0G-Galileo-Testnet (chainId 16601) from your wallet.
        </div>
      )}

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">Register Agent (on 0G)</h2>
        {AGENT_REGISTRY_ADDRESS && (
          <p className="text-xs text-gray-500 break-all">Registry: {AGENT_REGISTRY_ADDRESS}</p>
        )}
        {typeof totalAgents.data === "bigint" && (
          <p className="text-xs">Total Agents: {totalAgents.data.toString()}</p>
        )}
        <div className="flex gap-2">
          <input
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder="metadata URI (e.g. https://...)"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!AGENT_REGISTRY_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: AGENT_REGISTRY_ADDRESS as `0x${string}`,
                  abi: AGENT_REGISTRY_ABI,
                  functionName: "create",
                  args: [metadata],
                });
                alert("Agent registered!");
              } catch (err) {
                console.error(err);
                alert("Failed to register agent");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            {isPending ? "Submitting..." : "Register"}
          </button>
        </div>
        {!AGENT_REGISTRY_ADDRESS && (
          <p className="text-xs text-gray-500">Set NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS in .env.local</p>
        )}
      </section>

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">Mint INFT</h2>
        {INFT_ADDRESS && (
          <p className="text-xs text-gray-500 break-all">INFT: {INFT_ADDRESS}</p>
        )}
        <div className="flex gap-2">
          <input
            value={mintUri}
            onChange={(e) => setMintUri(e.target.value)}
            placeholder="tokenURI"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!INFT_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: INFT_ADDRESS as `0x${string}`,
                  abi: INFT_ABI,
                  functionName: "mint",
                  args: [mintUri],
                });
                alert("Minted!");
              } catch (err) {
                console.error(err);
                alert("Mint failed");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            Mint
          </button>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">List INFT</h2>
        {MARKETPLACE_ADDRESS && (
          <p className="text-xs text-gray-500 break-all">Marketplace: {MARKETPLACE_ADDRESS}</p>
        )}
        <div className="flex gap-2">
          <input
            value={listTokenId}
            onChange={(e) => setListTokenId(e.target.value)}
            placeholder="tokenId"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <input
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            placeholder="price (wei)"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!INFT_ADDRESS || !MARKETPLACE_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                // approve marketplace to transfer token
                await writeContractAsync({
                  address: INFT_ADDRESS as `0x${string}`,
                  abi: INFT_ABI,
                  functionName: "approve",
                  args: [MARKETPLACE_ADDRESS as `0x${string}`, BigInt(listTokenId || "0")],
                });
                await writeContractAsync({
                  address: MARKETPLACE_ADDRESS as `0x${string}`,
                  abi: MARKETPLACE_ABI,
                  functionName: "list",
                  args: [INFT_ADDRESS as `0x${string}`, BigInt(listTokenId || "0"), BigInt(listPrice || "0")],
                });
                alert("Listed!");
              } catch (err) {
                console.error(err);
                alert("List failed");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            List
          </button>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">Buy Listing</h2>
        <div className="flex gap-2">
          <input
            value={buyListingId}
            onChange={(e) => setBuyListingId(e.target.value)}
            placeholder="listingId"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <input
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            placeholder="price (wei)"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!MARKETPLACE_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: MARKETPLACE_ADDRESS as `0x${string}`,
                  abi: MARKETPLACE_ABI,
                  functionName: "buy",
                  args: [BigInt(buyListingId || "0")],
                  value: BigInt(listPrice || "0"),
                });
                alert("Purchased!");
              } catch (err) {
                console.error(err);
                alert("Purchase failed");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            Buy
          </button>
        </div>
      </section>

      <section className="border rounded-lg p-4 h-[60vh] overflow-y-auto bg-white/50 dark:bg-black/20">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Start chatting with your agent…</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, idx) => (
              <li key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {m.content}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button onClick={handleSend} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">
          Send
        </button>
      </div>
    </div>
  );
}
