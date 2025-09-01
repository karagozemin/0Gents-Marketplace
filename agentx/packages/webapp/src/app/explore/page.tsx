"use client";
import React, { useMemo, useState, useEffect } from "react";
import { AgentCard } from "@/components/AgentCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockAgents, type AgentItem } from "@/lib/mock";
import { getCreatedAgents, transformToMockAgent } from "@/lib/createdAgents";
import { getAgentsFromServer, transformGlobalAgent } from "@/lib/globalAgents";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "@/lib/contracts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  TrendingUp, 
  Filter,
  ArrowUpDown,
  Sparkles,
  Users,
  Activity
} from "lucide-react";

type SortOption = "price_low" | "price_high" | "newest" | "popular" | "trending";
type ViewMode = "grid" | "list";

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

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1]);
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [allAgents, setAllAgents] = useState<AgentItem[]>([]);
  const [blockchainAgents, setBlockchainAgents] = useState<AgentItem[]>([]);

  // Get total agents from Factory contract
  const { data: totalAgents } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getTotalAgents',
  });

  // Load agents from both localStorage and blockchain
  useEffect(() => {
    async function loadAllAgents() {
      console.log('🔄 Loading agents from all sources...');
      const agents: any[] = [];
      
      // 1. ✅ ÇÖZÜM: Server'dan global agent'ları yükle (tüm kullanıcılar)
      try {
        const serverAgents = await getAgentsFromServer();
        const globalAgents = serverAgents.map(transformGlobalAgent);
        agents.push(...globalAgents);
        console.log(`🌐 Loaded ${globalAgents.length} agents from global server`);
      } catch (error) {
        console.error('❌ Failed to load server agents:', error);
      }
      
      // 2. ✅ LOCAL AGENTS DEVRE DIŞI - Sadece server/unified system kullan
      // Local agents artık gösterilmiyor, duplicate önlemek için
      console.log('📱 Local agents disabled - only showing server agents');
      
      // 2. Load from Factory contract (slow, all creations) - Skip if Factory fails
      try {
        if (totalAgents && totalAgents > 0n) {
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
          console.log(`🔗 Loaded blockchain agents successfully`);
        }
      } catch (error) {
        console.error('❌ Factory loading failed, using localStorage only:', error.message);
      }
      
      setBlockchainAgents(agents);
      console.log(`✅ Total loaded: ${agents.length} unique agents`);
    }
    
    loadAllAgents();
  }, [totalAgents]);

  // Initialize with mock agents and combine with blockchain agents
  useEffect(() => {
    const combined = [...blockchainAgents, ...mockAgents];
    setAllAgents(combined);
    console.log(`🌐 Total agents: ${blockchainAgents.length} blockchain + ${mockAgents.length} mock = ${combined.length}`);
  }, [blockchainAgents]);

  // Handle URL search parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allAgents.map(agent => agent.category)));
    return ["all", ...cats];
  }, [allAgents]);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let filtered = allAgents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
      const matchesPrice = agent.priceEth >= priceRange[0] && agent.priceEth <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort agents
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.priceEth - b.priceEth);
        break;
      case "price_high":
        filtered.sort((a, b) => b.priceEth - a.priceEth);
        break;
      case "newest":
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "popular":
        // Mock popularity based on ID (lower ID = more popular)
        filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
      case "trending":
      default:
        // Mock trending based on random factor
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, priceRange, sortBy, allAgents]);

  const stats = useMemo(() => ({
    totalAgents: allAgents.length,
    totalVolume: allAgents.reduce((sum, agent) => sum + agent.priceEth, 0),
    avgPrice: allAgents.length > 0 ? allAgents.reduce((sum, agent) => sum + agent.priceEth, 0) / allAgents.length : 0,
    activeTraders: 1247
  }), [allAgents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-gradient">Explore AI Agents</h1>
          </div>
          <p className="text-xl text-gray-300">
            Discover and interact with intelligent NFT agents on the 0G Network
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="gradient-card border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalAgents}</p>
              <p className="text-gray-400 text-sm">Total Agents</p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-white/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalVolume.toFixed(1)} 0G</p>
              <p className="text-gray-400 text-sm">Total Volume</p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-white/10">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.avgPrice.toFixed(3)} 0G</p>
              <p className="text-gray-400 text-sm">Floor Price</p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.activeTraders}</p>
              <p className="text-gray-400 text-sm">Active Traders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <Card className="gradient-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Filter className="w-5 h-5 text-purple-400" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 focus:border-purple-400/50 text-white"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "ghost"}
                        size="sm"
                        className={`w-full justify-start text-left ${
                          selectedCategory === category 
                            ? "gradient-0g text-white" 
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === "all" ? "All Categories" : category}
                        <Badge variant="secondary" className="ml-auto" suppressHydrationWarning>
                          {category === "all" 
                            ? allAgents.length 
                            : allAgents.filter(a => a.category === category).length
                          }
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Price Range (0G)</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Quick Filters</label>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => setPriceRange([0, 0.05])}
                    >
                      Under 0.05 0G
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => setSelectedCategory("Trading")}
                    >
                      Trading Agents
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => setSortBy("newest")}
                    >
                      Recently Created
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">{filteredAgents.length}</span> agents found
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-white text-sm focus:border-purple-400/50"
                  >
                    <option value="trending">Trending</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center bg-white/5 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    className={viewMode === "grid" ? "gradient-0g" : "hover:bg-white/10"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className={viewMode === "list" ? "gradient-0g" : "hover:bg-white/10"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            {filteredAgents.length === 0 ? (
              <Card className="gradient-card border-white/10">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setPriceRange([0, 1]);
                    }}
                    variant="outline"
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-400/10"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} {...agent} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


