"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit3, 
  Save, 
  X, 
  Eye, 
  Trash2, 
  Plus,
  Wallet,
  Calendar,
  Hash,
  ExternalLink
} from "lucide-react";
import { getCreatedAgents, saveCreatedAgent, type CreatedAgent } from "@/lib/createdAgents";
import { Navbar } from "@/components/Navbar";

export default function MyCollectionsPage() {
  const { address, isConnected } = useAccount();
  const [myAgents, setMyAgents] = useState<CreatedAgent[]>([]);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreatedAgent>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadMyAgents();
  }, [address]);

  const loadMyAgents = () => {
    if (!address) return;
    
    const allCreated = getCreatedAgents();
    // Filter agents created by current user
    const userAgents = allCreated.filter(agent => 
      agent.creator.toLowerCase() === address.toLowerCase()
    );
    setMyAgents(userAgents);
  };

  const startEditing = (agent: CreatedAgent) => {
    setEditingAgent(agent.id);
    setEditForm({
      name: agent.name,
      description: agent.description,
      price: agent.price,
      category: agent.category,
      image: agent.image
    });
  };

  const cancelEditing = () => {
    setEditingAgent(null);
    setEditForm({});
  };

  const saveChanges = (agentId: string) => {
    const agent = myAgents.find(a => a.id === agentId);
    if (!agent) return;

    const updatedAgent: CreatedAgent = {
      ...agent,
      ...editForm,
      // Keep original creation data
      id: agent.id,
      tokenId: agent.tokenId,
      creator: agent.creator,
      txHash: agent.txHash,
      storageUri: agent.storageUri,
      createdAt: agent.createdAt
    };

    // Save to storage
    saveCreatedAgent(updatedAgent);
    
    // Update local state
    setMyAgents(prev => prev.map(a => a.id === agentId ? updatedAgent : a));
    
    // Exit edit mode
    setEditingAgent(null);
    setEditForm({});
    
    console.log("✅ Agent updated successfully:", updatedAgent.name);
  };

  const deleteAgent = (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      return;
    }

    // Remove from local storage
    const allAgents = getCreatedAgents();
    const filteredAgents = allAgents.filter(a => a.id !== agentId);
    localStorage.setItem('agentx_created_agents', JSON.stringify(filteredAgents));
    
    // Update local state
    setMyAgents(prev => prev.filter(a => a.id !== agentId));
    
    console.log("🗑️ Agent deleted successfully");
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Navbar />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="gradient-card rounded-3xl p-12">
              <Wallet className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-gray-300 mb-8">
                Please connect your wallet to view and manage your AI Agent collections.
              </p>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar />
      <div className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">My Collections</h1>
            <p className="text-gray-300">
              Manage your AI Agent NFTs created on the 0G Network
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
              {myAgents.length} Agent{myAgents.length !== 1 ? 's' : ''}
            </Badge>
            <Button 
              className="gradient-0g cursor-pointer"
              onClick={() => window.location.href = '/create'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Agent
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card className="gradient-card border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connected Wallet</p>
                  <p className="font-mono text-purple-300">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-400">Network</p>
                <p className="text-green-400">0G Galileo Testnet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections Grid */}
        {myAgents.length === 0 ? (
          <Card className="gradient-card border-white/10">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Plus className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Agents Created Yet</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Start building your AI Agent collection on the 0G Network. 
                Create your first intelligent NFT today!
              </p>
              <Button 
                className="gradient-0g px-8 py-3 cursor-pointer"
                onClick={() => window.location.href = '/create'}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAgents.map((agent) => (
              <Card key={agent.id} className="gradient-card border-white/10 group hover:glow-purple transition-all duration-300">
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img 
                      src={agent.image} 
                      alt={agent.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {editingAgent === agent.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-white/5 border-white/10 text-white"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Price (0G)</label>
                          <Input
                            type="number"
                            step="0.001"
                            value={editForm.price || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                          <Input
                            value={editForm.category || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="gradient-0g flex-1 cursor-pointer"
                          onClick={() => saveChanges(agent.id)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 cursor-pointer"
                          onClick={cancelEditing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{agent.name}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2">{agent.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Price</p>
                          <p className="font-semibold text-purple-300">{agent.price} 0G</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                          {agent.category}
                        </Badge>
                      </div>
                      
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <Calendar className="w-3 h-3" />
                          Created: {new Date(agent.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{agent.txHash.slice(0, 10)}...{agent.txHash.slice(-8)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-purple-400/50 text-purple-300 hover:bg-purple-400/10 cursor-pointer"
                            onClick={() => window.location.href = `/agent/${agent.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="gradient-0g flex-1 cursor-pointer"
                            onClick={() => startEditing(agent)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-400/50 text-red-300 hover:bg-red-400/10 cursor-pointer"
                            onClick={() => deleteAgent(agent.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
