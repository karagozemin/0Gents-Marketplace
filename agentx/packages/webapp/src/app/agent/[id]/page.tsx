"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
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
  Eye
} from "lucide-react";
import { mockAgents } from "@/lib/mock";
import { callCompute, type ChatMessage, type ComputeRequest } from "@/lib/compute";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const [agent, setAgent] = useState(mockAgents.find(a => a.id === id));
  const [isLiked, setIsLiked] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [computeStats, setComputeStats] = useState<any>(null);

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

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading agent from 0G Storage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
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
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Price</span>
                      <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10">
                        {agent.priceEth} ETH
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
                    <Button size="lg" className="w-full gradient-0g hover:opacity-90 text-white font-semibold">
                      <Zap className="w-5 h-5 mr-2" />
                      Buy Now
                    </Button>
                    <Button size="lg" variant="outline" className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-400/10">
                      <Eye className="w-5 h-5 mr-2" />
                      Try Agent
                    </Button>
                  </div>
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
                <TabsList className="grid w-full grid-cols-4 bg-white/5">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
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
                          className="gradient-0g"
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
                          <p className="text-white">{agent.priceEth} ETH</p>
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
                        {agent.history.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{item.activity}</p>
                              <p className="text-gray-400 text-sm">{item.date}</p>
                            </div>
                            {item.priceEth && (
                              <Badge variant="outline" className="border-green-400/50 text-green-300">
                                {item.priceEth} ETH
                              </Badge>
                            )}
                          </div>
                        ))}
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
    </div>
  );
}