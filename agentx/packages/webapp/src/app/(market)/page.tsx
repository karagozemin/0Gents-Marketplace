import { AgentCard } from "@/components/AgentCard";
import { AgentWideCard } from "@/components/AgentWideCard";
import { mockAgents } from "@/lib/mock";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-purple-700/20 via-blue-700/10 to-pink-700/20 p-12 text-center border border-white/5">
        <h1 className="text-4xl md:text-5xl font-semibold">0Gents Marketplace</h1>
        <p className="text-sm text-gray-300 mt-3">Create, explore and trade INFT Agents on 0G</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/explore" className="px-5 py-2 rounded-md bg-white text-black text-sm">Explore</a>
          <a href="/create" className="px-5 py-2 rounded-md border border-white/20 text-sm">Create</a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Featured</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {mockAgents.map((a) => (
            <div key={a.id} className="snap-start">
              <AgentWideCard {...a} tag="Featured" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Trending</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockAgents.map((a) => (
            <AgentCard key={a.id} {...a} />
          ))}
        </div>
      </section>
    </div>
  );
}


