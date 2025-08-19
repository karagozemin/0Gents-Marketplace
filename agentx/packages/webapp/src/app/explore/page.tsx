"use client";
import { useMemo, useState } from "react";
import { AgentCard } from "@/components/AgentCard";
import { mockAgents } from "@/lib/mock";
import { Input } from "@/components/ui/input";

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => mockAgents.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
      <aside className="space-y-4">
        <h2 className="text-sm font-medium">Filters</h2>
        <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="text-xs text-gray-400">Price range, category, owner (mock)</div>
      </aside>
      <div className="space-y-4">
        <h1 className="text-xl font-medium">Explore</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <AgentCard key={a.id} {...a} />
          ))}
        </div>
      </div>
    </div>
  );
}


