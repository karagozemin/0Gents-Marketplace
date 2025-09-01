"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  Zap, 
  User, 
  Calendar, 
  Activity,
  Send,
  Bot,
  TrendingUp,
  Eye,
  ExternalLink
} from "lucide-react";
import { mockAgents } from "@/lib/mock";
import { getCreatedAgents, transformToMockAgent } from "@/lib/createdAgents";
import { getGlobalAgents, transformBlockchainAgent } from "@/lib/blockchainAgents";
import { getAgentsFromServer, transformGlobalAgent } from "@/lib/globalAgents";
import { getUnifiedAgentById, clearUnifiedAgentsCache } from "@/lib/unifiedAgents";
import { callCompute, type ChatMessage, type ComputeRequest } from "@/lib/compute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Confetti from "react-confetti";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const [agent, setAgent] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [computeStats, setComputeStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Buy functionality
  const { writeContract, data: buyHash, error: buyError } = useWriteContract();
  const { isLoading: isBuyLoading, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  useEffect(() => {
    setMounted(true);
    
    // 🎯 UNIFIED AGENT SEARCH - Tek merkezi sistem
    const findAgent = async () => {
      // Decode URL-encoded ID
      const decodedId = decodeURIComponent(id);
      console.log("🔍 Looking for agent ID:", id, "→ decoded:", decodedId);
      const searchId = decodedId;
      
      // 🚀 ÖNCELİK 1: Unified System'den ara
      console.log("🎯 Checking unified system...");
      try {
        const unifiedResult = await getUnifiedAgentById(searchId);
        console.log("📋 Unified system result:", unifiedResult);
        
        if (unifiedResult.success && unifiedResult.agent) {
          console.log("✅ Found in unified system:", unifiedResult.agent.name);
          
          // Transform unified agent to component format
          const foundAgent = {
            id: unifiedResult.agent.id,
            name: unifiedResult.agent.name,
            description: unifiedResult.agent.description,
            image: unifiedResult.agent.image,
            category: unifiedResult.agent.category,
            price: unifiedResult.agent.price,
            creator: unifiedResult.agent.creator,
            likes: unifiedResult.agent.likes || 0,
            views: unifiedResult.agent.views || 0,
            trending: unifiedResult.agent.trending || false,
            listingId: unifiedResult.agent.listingId,
            agentContractAddress: unifiedResult.agent.agentContractAddress,
            tokenId: unifiedResult.agent.tokenId,
            txHash: unifiedResult.agent.txHash,
            social: unifiedResult.agent.social,
            capabilities: unifiedResult.agent.capabilities || ["chat", "analysis"],
            computeModel: unifiedResult.agent.computeModel || "gpt-4"
          };
          
          setAgent(foundAgent);
          return;
        }
      } catch (error) {
        console.error("❌ Failed to load from unified system:", error);
      }
      
      // 🔄 FALLBACK: Eski sistemlerden ara (backward compatibility)
      console.log("🔄 Falling back to legacy systems...");
      
      // First check mock agents
      let foundAgent = mockAgents.find(a => a.id === searchId);
      console.log("🎯 Found in mock agents:", !!foundAgent);
      
      // Check server agents
      if (!foundAgent) {
        console.log("🔍 Checking server agents...");
        try {
          const serverAgents = await getAgentsFromServer();
          console.log("📋 Server agents:", serverAgents.map(a => a.id));
          const serverAgent = serverAgents.find(a => a.id === searchId);
          console.log("🎯 Found in server agents:", !!serverAgent);
          if (serverAgent) {
            foundAgent = transformGlobalAgent(serverAgent);
          }
        } catch (error) {
          console.error("❌ Failed to load server agents:", error);
        }
      }
      
      if (!foundAgent) {
        console.log("🔍 Checking created agents...");
        const createdAgents = getCreatedAgents();
        console.log("📋 Created agents:", createdAgents.map(a => a.id));
        const createdAgent = createdAgents.find(a => a.id === searchId);
        console.log("🎯 Found in created agents:", !!createdAgent);
        if (createdAgent) {
          foundAgent = transformToMockAgent(createdAgent);
        }
      }
      
      if (!foundAgent) {
        // Finally check global blockchain agents
        console.log("🔍 Checking global agents...");
        const globalAgents = getGlobalAgents();
        console.log("📋 Global agents:", globalAgents.map(a => ({ id: a.tokenId, name: (a as any).name || 'unnamed' })));
        
        // Try to find by blockchain ID format
        let globalAgent = globalAgents.find(a => `blockchain-${a.tokenId}` === searchId);
        console.log("🎯 Found by blockchain ID format:", !!globalAgent);
        
        // Also try to find by direct timestamp ID (for cross-browser compatibility)
        if (!globalAgent) {
          globalAgent = globalAgents.find(a => a.tokenId === searchId);
          console.log("🎯 Found by direct timestamp ID:", !!globalAgent);
        }
        
        // Also try to find by created ID format (legacy)
        if (!globalAgent && searchId.startsWith('created-')) {
          const createdId = searchId.replace('created-', '');
          globalAgent = globalAgents.find(a => a.tokenId === createdId);
          console.log("🎯 Found by created ID format:", !!globalAgent);
        }
        
        if (globalAgent) {
          foundAgent = transformBlockchainAgent(globalAgent);
          console.log("✅ Final agent found:", foundAgent?.name);
        } else {
          console.log("❌ No agent found anywhere");
        }
      }
      
      setAgent(foundAgent);
    };
    
    findAgent();
  }, [id]);

  const handleBuyNow = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!agent || !MARKETPLACE_ADDRESS) {
      alert("Agent or marketplace not found");
      return;
    }

    // ✅ ONLY ALLOW REAL LISTINGS
    if (!agent.listingId || agent.listingId <= 0) {
      alert(`❌ This agent is not properly listed on the marketplace.

Only agents created through the proper creation process can be purchased.

Please:
1. Create a new agent using the /create page
2. Wait for the marketplace listing to complete
3. Then try purchasing

This ensures real blockchain transactions only.`);
      return;
    }

    setIsBuying(true);
    try {
      console.log("💰 Purchasing NFT with REAL blockchain listing...");
      console.log(`🎯 Listing ID: ${agent.listingId}`);
      console.log(`🎯 Price: ${agent.price || agent.priceEth} 0G`);
      console.log(`🔍 MARKETPLACE_ADDRESS (buy): ${MARKETPLACE_ADDRESS}`);
      
      // ✅ VALIDATE LISTING EXISTS ON BLOCKCHAIN - AYNI RPC KULLAN!
      const OG_RPC_URL = 'https://evmrpc-testnet.0g.ai'; // Create ile aynı RPC zorla
      console.log(`🔍 RPC URL (buy): ${OG_RPC_URL}`);
      console.log(`🚨 ZORLA AYNI RPC KULLANILIYOR: evmrpc-testnet.0g.ai`);
      console.log(`🔍 Calling listings(${agent.listingId}) on marketplace...`);
      
      const response = await fetch(OG_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: MARKETPLACE_ADDRESS,
            data: '0x3f26479e' + agent.listingId.toString(16).padStart(64, '0') // listings(uint256)
          }, 'latest'],
          id: 1
        })
      });
      
      const result = await response.json();
      console.log("🔍 Blockchain validation result:", result);
      
      // ✅ BASIT ÇÖZÜM: Error varsa direkt buy işlemini dene
      if (result.error) {
        console.log("🚨 RPC ERROR - Direkt buy işlemini deniyoruz:", result.error);
        console.log("🎯 Listing ID mevcut olabilir, validation bypass ediliyor");
        // Validation bypass - direkt buy işlemine geç
      } else if (!result.result || result.result === '0x' || result.result === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        alert(`❌ This listing does not exist on the blockchain.

Listing ID ${agent.listingId} was not found.

This means:
• The agent was not properly listed during creation
• The listing may have been cancelled or sold
• There was an error in the listing process

Please create a new agent or contact support.`);
        setIsBuying(false);
        return;
      }

      // ✅ VALIDATE PRICE
      const priceValue = agent.price || agent.priceEth;
      if (!priceValue || isNaN(parseFloat(priceValue.toString()))) {
        alert(`❌ Invalid price data for this agent.

Price: ${priceValue}

Please refresh the page or create a new agent.`);
        setIsBuying(false);
        return;
      }

      const price = parseEther(priceValue.toString());
      
      console.log(`🛒 Executing REAL purchase transaction...`);
      console.log(`📋 Listing ID: ${agent.listingId}`);
      console.log(`💰 Price: ${priceValue} 0G (${price.toString()} wei)`);
      
      // ✅ EXECUTE REAL BLOCKCHAIN TRANSACTION
      await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "buy",
        args: [BigInt(agent.listingId)],
        value: price,
        gas: BigInt(500000),
      });

      console.log("✅ REAL purchase transaction submitted to blockchain");
      
    } catch (error: any) {
      console.error("❌ Purchase failed:", error);
      
      let errorMessage = "Purchase failed.";
      
      if (error?.message?.includes("User rejected") || error?.code === 4001) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds. Please add more 0G tokens to your wallet.";
      } else if (error?.message?.includes("NOT_ACTIVE")) {
        errorMessage = "This listing is no longer active. It may have been sold or cancelled.";
      } else if (error?.message?.includes("BAD_PRICE")) {
        errorMessage = "Price mismatch. The listing price may have changed.";
      } else if (error?.message?.includes("execution reverted")) {
        errorMessage = `Transaction failed. The listing may not exist or may be invalid.

Listing ID: ${agent.listingId}
This could mean the listing was never properly created on the blockchain.`;
      } else {
        errorMessage = `Transaction failed: ${error.message}`;
      }
      
      alert(`❌ ${errorMessage}

💡 If the problem persists:
• Refresh the page and try again
• Check your wallet connection
• Ensure you have enough 0G tokens`);
      setIsBuying(false);
    }
  };

  // Handle successful purchase
  React.useEffect(() => {
    if (isBuySuccess && buyHash) {
      console.log("🎉 NFT purchased successfully!");
      
      // ✅ ÇÖZÜM: Agent'ı marketplace'ten kaldır (inactive yap)
      markAgentAsSold();
      
      // ✅ Kutlama başlat
      setShowCelebration(true);
      setShowSuccessModal(true);
      setIsBuying(false);
      
      // 5 saniye sonra confetti'yi durdur
      setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
    }
  }, [isBuySuccess, buyHash]);

  // Mark agent as sold (inactive) after successful purchase
  const markAgentAsSold = async () => {
    try {
      console.log("🔄 Marking agent as sold in unified system...");
      
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: agent.id,
          updates: { 
            active: false,
            currentOwner: address // Update owner to buyer
          },
          userAddress: agent.creator || agent.owner // Use creator for permission check
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        console.log("✅ Agent marked as sold successfully");
        // ✅ Cache'i temizle ki refresh'te gözükmesin
        clearUnifiedAgentsCache();
        console.log("🧹 Cache cleared after purchase");
        // Update local state
        setAgent((prev: any) => ({ ...prev, active: false, currentOwner: address }));
      } else {
        console.error("❌ Failed to mark agent as sold:", result.error);
      }
    } catch (error) {
      console.error("❌ Error marking agent as sold:", error);
    }
  };

  // Handle purchase errors
  React.useEffect(() => {
    if (buyError) {
      console.error("Buy error:", buyError);
      alert("Purchase failed: " + buyError.message);
      setIsBuying(false);
    }
  }, [buyError]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !agent) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const request: ComputeRequest = {
        agentId: agent.id,
        messages: [...chatMessages, userMessage],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: `You are ${agent.name}, a ${agent.category} AI agent. ${agent.description}`
      };

      const response = await callCompute(request);

      if (response.success && response.response) {
        const agentMessage: ChatMessage = {
          role: "agent",
          content: response.response,
          timestamp: new Date().toISOString()
        };

        setChatMessages(prev => [...prev, agentMessage]);
        setComputeStats(response);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "agent",
        content: "Sorry, I'm having trouble processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Agent not found</p>
            <p className="text-sm text-gray-500 mt-2">This agent may not exist or has been removed.</p>
            <Button 
              className="mt-4 gradient-0g" 
              onClick={() => window.location.href = '/'}
            >
              Back to Marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Agent Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="gradient-card border-white/10 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className="bg-red-500/20 text-red-300 border border-red-400/50 hover:bg-red-500/30 hover:text-red-200 cursor-pointer backdrop-blur-sm"
                    >
                      <Heart className={`w-5 h-5 mr-2 ${mounted && isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {mounted && isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button size="sm" className="bg-blue-500/20 text-blue-300 border border-blue-400/50 hover:bg-blue-500/30 hover:text-blue-200 cursor-pointer backdrop-blur-sm">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Price</span>
                      <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10">
                        {agent.priceEth} 0G
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Category</span>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {agent.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button 
                      size="lg" 
                      className="w-full gradient-0g hover:opacity-90 text-white font-semibold cursor-pointer"
                      onClick={handleBuyNow}
                      disabled={isBuying || isBuyLoading || !isConnected}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {isBuying || isBuyLoading ? "Purchasing..." : "Buy Now"}
                    </Button>
                    <Button size="lg" className="w-full bg-black/80 text-white border border-purple-400/50 hover:bg-black/90 hover:border-purple-400/70 transition-all cursor-pointer backdrop-blur-sm">
                      <Eye className="w-5 h-5 mr-2" />
                      Try Agent
                    </Button>
                  </div>
                  
                  {/* Social Links - Show for created agents */}
                  {(() => {
                    const createdAgents = typeof window !== 'undefined' ? getCreatedAgents() : [];
                    const createdAgent = createdAgents.find(a => a.id === id);
                    if (createdAgent?.social && (createdAgent.social.x || createdAgent.social.website)) {
                      return (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-sm font-medium text-gray-300 mb-3">Social Links</p>
                          <div className="flex gap-2">
                            {createdAgent.social.x && (
                              <Button 
                                size="sm" 
                                className="bg-blue-500/20 text-blue-300 border border-blue-400/50 hover:bg-blue-500/30 cursor-pointer backdrop-blur-sm"
                                onClick={() => window.open(createdAgent.social!.x!, '_blank')}
                              >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                X
                              </Button>
                            )}
                            {createdAgent.social.website && (
                              <Button 
                                size="sm" 
                                className="bg-green-500/20 text-green-300 border border-green-400/50 hover:bg-green-500/30 cursor-pointer backdrop-blur-sm"
                                onClick={() => window.open(createdAgent.social!.website!, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Website
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Agent Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Info */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
                <div className="flex items-center gap-4 text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>by {agent.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created Dec 2024</span>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{agent.description}</p>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-xl border border-purple-500/30 p-1 rounded-2xl">
                  <TabsTrigger 
                    value="chat" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 cursor-pointer rounded-xl font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 cursor-pointer rounded-xl font-medium"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 cursor-pointer rounded-xl font-medium"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 cursor-pointer rounded-xl font-medium"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Stats
                  </TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="mt-6">
                  <Card className="gradient-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-400" />
                        Chat with {agent.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Chat Messages */}
                      <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-black/20 rounded-lg">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-gray-500 mt-20">
                            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Start a conversation with {agent.name}</p>
                          </div>
                        ) : (
                          chatMessages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-100'
                                }`}
                              >
                                <p>{message.content}</p>
                                {message.timestamp && (
                                  <p className="text-xs opacity-70 mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-700 px-4 py-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                                <span className="text-gray-300">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder={`Message ${agent.name}...`}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white"
                          disabled={!isConnected}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={isLoading || !inputMessage.trim() || !isConnected}
                          className="gradient-0g cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>

                      {!isConnected && (
                        <p className="text-center text-yellow-400 text-sm mt-2">
                          Connect your wallet to chat with this agent
                        </p>
                      )}

                      {computeStats && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                          <p className="text-xs text-green-300">
                            ⚡ Computed by 0G Network • Node: {computeStats.nodeId} • 
                            Time: {computeStats.computeTime}ms • 
                            Tokens: {computeStats.usage?.totalTokens}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="mt-6">
                  <Card className="gradient-card border-white/10">
                    <CardHeader>
                      <CardTitle>Agent Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Owner</label>
                          <p className="text-white">{agent.owner}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Category</label>
                          <p className="text-white">{agent.category}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Price</label>
                          <p className="text-white">{agent.priceEth} 0G</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Storage</label>
                          <p className="text-white">0G Storage</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Description</label>
                        <p className="text-white mt-1">{agent.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-6">
                  <Card className="gradient-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Activity History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {agent.history && agent.history.length > 0 ? (
                          agent.history.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <p className="text-white font-medium">{item.activity}</p>
                                <p className="text-gray-400 text-sm">{item.date}</p>
                              </div>
                              {item.priceEth && (
                                <Badge variant="outline" className="border-green-400/50 text-green-300">
                                  {item.priceEth} 0G
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Henüz aktivite geçmişi yok</p>
                            <p className="text-sm mt-2">Agent kullanıldıkça aktiviteler burada görünecek</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats" className="mt-6">
                  <Card className="gradient-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Performance Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-purple-400">1.2K</p>
                          <p className="text-gray-400 text-sm">Total Interactions</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-blue-400">4.8</p>
                          <p className="text-gray-400 text-sm">Average Rating</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-green-400">95%</p>
                          <p className="text-gray-400 text-sm">Success Rate</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-400">2.1s</p>
                          <p className="text-gray-400 text-sm">Avg Response</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* ✅ Confetti Animation */}
      {showCelebration && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 300}
          height={typeof window !== 'undefined' ? window.innerHeight : 200}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-3xl p-8 max-w-md mx-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Purchase Successful! 🎉</h2>
            <p className="text-gray-300 mb-6">
              Congratulations! You now own <span className="text-purple-400 font-semibold">{agent?.name}</span>.
              The NFT has been transferred to your wallet.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full gradient-0g hover:opacity-90 text-white font-semibold"
              >
                Awesome! 🚀
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.open(`https://scan-testnet.0g.ai/tx/${buyHash}`, '_blank')}
                className="w-full text-purple-400 hover:text-purple-300"
              >
                View Transaction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}