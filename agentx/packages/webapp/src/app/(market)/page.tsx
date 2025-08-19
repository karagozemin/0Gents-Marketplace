"use client";
import { AgentCard } from "@/components/AgentCard";
import { AgentWideCard } from "@/components/AgentWideCard";
import { mockAgents } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Zap, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl gradient-0g-subtle border border-purple-500/20 p-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">0Gents</span>
            <br />
            <span className="text-white">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create, explore and trade intelligent NFT Agents on the 0G Network. 
            The future of AI-powered digital assets.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="gradient-0g hover:opacity-90 text-white font-semibold px-8 py-3 cursor-pointer"
              onClick={() => {
                document.getElementById('trending-section')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              Explore Agents
            </Button>
            <Button size="lg" variant="outline" className="border-purple-400/50 text-purple-300 hover:bg-purple-400/10 px-8 py-3 cursor-pointer" asChild>
              <a href="/create">Create Agent</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Agents", value: "1,247", icon: Users, color: "text-purple-400" },
          { label: "Total Volume", value: "142.7 0G", icon: TrendingUp, color: "text-blue-400" },
          { label: "Active Traders", value: "8,329", icon: Star, color: "text-pink-400" },
          { label: "Floor Price", value: "0.012 0G", icon: Zap, color: "text-green-400" }
        ].map((stat, index) => (
          <div key={index} className="gradient-card rounded-2xl p-6 text-center group hover:glow-purple transition-all duration-300">
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Featured Agents</h2>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
              Hot
            </Badge>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
          {mockAgents.map((agent) => (
            <div key={agent.id} className="snap-start">
              <AgentWideCard {...agent} tag="Featured" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section id="trending-section" className="space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
              24h
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Price: Low to High
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Recently Listed
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockAgents.concat(mockAgents).map((agent, index) => (
            <AgentCard key={`${agent.id}-${index}`} {...agent} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 border border-purple-500/30 p-12 text-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Create Your AI Agent?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators building the next generation of intelligent digital assets on 0G Network.
          </p>
          <Button size="lg" className="gradient-0g hover:opacity-90 text-white font-semibold px-8 py-3" asChild>
            <a href="/create">
              <Zap className="w-5 h-5 mr-2" />
              Start Creating
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}


