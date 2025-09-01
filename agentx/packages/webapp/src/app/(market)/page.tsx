"use client";
import { AgentCard } from "@/components/AgentCard";
import { AgentWideCard } from "@/components/AgentWideCard";
import { mockAgents } from "@/lib/mock";
import { getAllUnifiedAgents } from "@/lib/unifiedAgents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Zap, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { INFT_ADDRESS, INFT_ABI, FACTORY_ADDRESS, FACTORY_ABI, AGENT_NFT_ABI } from "@/lib/contracts";

// Helper function to get agent details from individual contract
async function getAgentDetails(agentAddress: string) {
  try {
    const calls = [
      { data: '0x06fdde03', name: 'name' }, // name()
      { data: '0x7284e416', name: 'description' }, // agentDescription()  
      { data: '0x2d06177a', name: 'category' }, // agentCategory()
      { data: '0xa035b1fe', name: 'price' }, // price()
      { data: '0x02d05d3f', name: 'creator' }, // creator()
    ];
    
    const results = await Promise.all(calls.map(async (call) => {
      const response = await fetch(`https://evmrpc-testnet.0g.ai/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: agentAddress, data: call.data }, 'latest'],
          id: 1
        })
      });
      const result = await response.json();
      return { name: call.name, result: result.result };
    }));
    
    // Parse results
    const details: any = {};
    results.forEach(({ name, result }) => {
      if (result && result !== '0x') {
        if (name === 'price') {
          details[name] = (parseInt(result, 16) / 1e18).toString(); // Convert wei to ETH
        } else if (name === 'creator') {
          details[name] = '0x' + result.slice(-40); // Extract address
        } else {
          // Decode string (skip first 64 chars for offset, then length, then data)
          try {
            const hex = result.slice(130); // Skip 0x + offset + length
            details[name] = Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
          } catch {
            details[name] = '';
          }
        }
      }
    });
    
    return details;
  } catch (error) {
    console.error(`Failed to get details for agent ${agentAddress}:`, error);
    return null;
  }
}

export default function HomePage() {
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [blockchainAgents, setBlockchainAgents] = useState<any[]>([]);

  // Get total agents from Factory contract
  const { data: totalAgents } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getTotalAgents',
  });

  // 🎯 UNIFIED AGENT LOADING - Tek merkezi sistem
  useEffect(() => {
    async function loadAllAgents() {
      console.log('🔄 Loading agents from unified system...');
      const agents: any[] = [];
      
      // 🚀 ÖNCELİK 1: Unified System'den yükle
      try {
        const unifiedResult = await getAllUnifiedAgents({ active: true });
        if (unifiedResult.success && unifiedResult.agents) {
          const unifiedAgents = unifiedResult.agents.map(agent => {
            console.log('🔍 DEBUG: Agent from unified system:', {
              name: agent.name,
              listingId: agent.listingId,
              listingIdType: typeof agent.listingId,
              price: agent.price,
              priceType: typeof agent.price
            });
            return {
              id: agent.id,
              name: agent.name,
              description: agent.description,
              image: agent.image,
              category: agent.category,
              owner: `${agent.creator?.slice(0, 6)}...${agent.creator?.slice(-4)}`,
              priceEth: parseFloat(agent.price || "0"),
              listingId: agent.listingId, // ✅ Gerçek marketplace listing ID
              tokenId: agent.tokenId,
              agentContractAddress: agent.agentContractAddress,
              creator: agent.creator,
              trending: agent.trending,
              likes: agent.likes || 0,
              views: agent.views || 0,
              history: [
                {
                  activity: "Created on 0G Network",
                  date: agent.createdAt,
                  priceEth: parseFloat(agent.price || "0")
                }
              ]
            };
          });
          agents.push(...unifiedAgents);
          console.log(`🎯 Loaded ${unifiedAgents.length} agents from unified system`);
        }
      } catch (error) {
        console.error('❌ Failed to load from unified system:', error);
      }
      
      // ✅ Sadece unified system kullan
      if (agents.length === 0) {
        console.log('⚠️ No agents found in unified system');
      }
      
      // 2. ✅ LOCAL AGENTS DEVRE DIŞI - Sadece server/unified system kullan
      // Local agents artık gösterilmiyor, duplicate önlemek için
      console.log('📱 Local agents disabled - only showing unified system agents');
      
      // 3. Load from Factory contract (slow, blockchain creations)
      try {
        if (totalAgents && totalAgents > BigInt(0)) {
          console.log(`🔗 Loading ${totalAgents.toString()} agents from Factory contract...`);
          
          for (let i = 0; i < Number(totalAgents); i++) {
            const agentResponse = await fetch(`https://evmrpc-testnet.0g.ai/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                  to: FACTORY_ADDRESS,
                  data: '0x8c3c4b34' + i.toString(16).padStart(64, '0') // getAgentAt(uint256)
                }, 'latest'],
                id: i + 1
              })
            });
            
            const result = await agentResponse.json();
            if (result.result && result.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              const agentAddress = '0x' + result.result.slice(-40);
              console.log(`📝 Found agent contract ${i}: ${agentAddress}`);
              
              // Get agent details from the individual contract
              const agentDetails = await getAgentDetails(agentAddress);
              if (agentDetails) {
                // Check if this agent already exists in localStorage (avoid duplicates)
                const isDuplicate = agents.some(agent => 
                  agent.name === agentDetails.name && 
                  agent.owner.toLowerCase().includes(agentDetails.creator?.toLowerCase().slice(2, 8))
                );
                
                if (!isDuplicate) {
                  agents.push({
                    id: `blockchain-${i}`,
                    name: agentDetails.name || `Agent #${i}`,
                    owner: `${agentDetails.creator?.slice(0, 6)}...${agentDetails.creator?.slice(-4)}` || '0x...',
                    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
                    priceEth: parseFloat(agentDetails.price || '0.01'),
                    description: agentDetails.description || 'Blockchain AI Agent',
                    category: agentDetails.category || 'General',
                    history: [
                      { activity: "Created", date: new Date().toISOString().split('T')[0] }
                    ],
                  });
                }
              }
            }
          }
          console.log(`🔗 Loaded ${Number(totalAgents)} blockchain agents`);
        }
      } catch (error) {
        console.error('❌ Failed to load blockchain agents:', error);
      }
      
      setBlockchainAgents(agents);
      console.log(`✅ Total loaded: ${agents.length} unique agents`);
    }
    
    if (mounted) {
      loadAllAgents();
    }
  }, [totalAgents, mounted]);

  // Combine all agents
  useEffect(() => {
    setMounted(true);
    
          // ✅ Featured: Sadece gerçek agents, Trending: Mock agents de dahil
      setAllAgents(blockchainAgents);
      console.log(`🌐 Featured agents: ${blockchainAgents.length} real agents (no mock in featured)`);
  }, [blockchainAgents]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

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
            <Button size="lg" className="bg-black/80 text-white border border-purple-400/50 hover:bg-black/90 hover:border-purple-400/70 px-8 py-3 cursor-pointer backdrop-blur-sm" asChild>
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
      <section id="featured-section" className="space-y-6 scroll-mt-24">
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
          {allAgents.slice(0, 6).map((agent) => {
            console.log('🔍 Featured agent:', { id: agent.id, name: agent.name });
            return (
              <div key={agent.id} className="snap-start">
                <AgentWideCard {...agent} tag="Featured" />
              </div>
            );
          })}
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
          {/* ✅ Trending: Gerçek agents + mock agents */}
          {[...allAgents, ...mockAgents].map((agent) => (
            <AgentCard key={agent.id} {...agent} />
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


