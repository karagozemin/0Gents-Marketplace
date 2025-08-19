"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, Zap, Eye, Info, Wallet } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { INFT_ADDRESS, INFT_ABI, MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ZERO_G_CHAIN_ID } from "@/lib/contracts";
import { uploadAgentMetadata, type AgentMetadata } from "@/lib/storage";
import { parseEther } from "viem";

export default function CreatePage() {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { address, isConnected } = useAccount();
  
  const { writeContract: writeINFT, data: mintHash, error: mintError } = useWriteContract();
  const { writeContract: writeMarketplace, data: listHash, error: listError } = useWriteContract();
  
  const { isLoading: isMintLoading, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  });
  
  const { isLoading: isListLoading, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  const handleCreate = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!name || !desc || !price) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    
    try {
      // Step 1: Create metadata object for 0G Storage
      const metadata: AgentMetadata = {
        name,
        description: desc,
        image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
        category: category || "General",
        creator: address || "",
        price,
        capabilities: [
          "Natural Language Processing",
          "Task Automation",
          category || "General Purpose"
        ],
        model: {
          type: "GPT-based",
          version: "1.0",
          parameters: {
            temperature: 0.7,
            max_tokens: 2048
          }
        },
        skills: category ? [category.toLowerCase()] : ["general"],
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      console.log("Creating agent with 0G Storage integration:", metadata);

      // Step 2: Upload metadata to 0G Storage
      const storageResult = await uploadAgentMetadata(metadata);
      
      if (!storageResult.success) {
        throw new Error(`0G Storage upload failed: ${storageResult.error}`);
      }

      console.log("Metadata uploaded to 0G Storage:", storageResult.uri);

      // Step 3: Mint the INFT with 0G Storage URI
      writeINFT({
        address: INFT_ADDRESS as `0x${string}`,
        abi: INFT_ABI,
        functionName: "mint",
        args: [storageResult.uri!], // Use 0G Storage URI instead of base64
      });

      console.log("INFT minting initiated with 0G Storage URI");
      
    } catch (error) {
      console.error("Error creating agent:", error);
      alert(`Failed to create agent: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsCreating(false);
    }
  };

  // Handle successful mint
  React.useEffect(() => {
    if (isMintSuccess) {
      alert("Agent NFT minted successfully!");
      // Reset form
      setName("");
      setDesc("");
      setPrice("");
      setImage("");
      setCategory("");
      setIsCreating(false);
    }
  }, [isMintSuccess]);

  // Handle errors
  React.useEffect(() => {
    if (mintError) {
      console.error("Mint error:", mintError);
      alert("Failed to mint NFT: " + mintError.message);
      setIsCreating(false);
    }
  }, [mintError]);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-gradient">Create AI Agent</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mint your intelligent NFT agent on the 0G Network and join the future of AI-powered digital assets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Creation Form */}
          <div className="space-y-8">
            <Card className="gradient-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Upload className="w-5 h-5 text-purple-400" />
                  Agent Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Agent Name *</label>
                  <Input 
                    placeholder="e.g., Trading Assistant Pro" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Description *</label>
                  <Textarea 
                    placeholder="Describe what your AI agent can do, its capabilities, and unique features..."
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500 min-h-[120px]"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:border-purple-400/50 text-white"
                  >
                    <option value="">Select a category</option>
                    <option value="Trading">Trading</option>
                    <option value="Research">Research</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Art">Art</option>
                    <option value="Development">Development</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Music">Music</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="DeFi">DeFi</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Price (ETH) *</label>
                  <Input 
                    type="number" 
                    step="0.001"
                    placeholder="0.05" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Image URL</label>
                  <Input 
                    placeholder="https://example.com/image.png" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500">Optional: Provide an image URL for your agent</p>
                </div>
              </CardContent>
            </Card>

            {/* 0G Storage Integration Info */}
            <Card className="gradient-card border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">0G Integration</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Storage Network</span>
                    <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                      0G Galileo
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Chain ID</span>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                      {ZERO_G_CHAIN_ID}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Storage Type</span>
                    <Badge variant="outline" className="border-green-400/50 text-green-300">
                      Decentralized
                    </Badge>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="text-xs text-gray-400">
                      • Metadata stored on 0G Storage
                      <br />
                      • INFT minted on 0G Chain
                      <br />
                      • Verifiable & decentralized
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creation Cost Info */}
            <Card className="gradient-card border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Creation Cost</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">0G Storage Fee</span>
                    <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                      Free (Testnet)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Minting Fee</span>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                      0.001 OG
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Network Fee</span>
                    <Badge variant="outline" className="border-green-400/50 text-green-300">
                      ~0.0005 OG
                    </Badge>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total Estimated</span>
                      <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                        ~0.0015 OG
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <div className="space-y-4">
              {!isConnected ? (
                <div className="text-center p-6 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
                  <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-300 font-medium">Connect your wallet to create an agent</p>
                </div>
              ) : (
                <Button 
                  onClick={handleCreate}
                  disabled={isCreating || isMintLoading || !name || !desc || !price}
                  size="lg"
                  className="w-full gradient-0g hover:opacity-90 text-white font-semibold py-4 text-lg"
                >
                  {isCreating || isMintLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isMintLoading ? "Minting Agent..." : "Creating Agent..."}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Create AI Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-8">
            <Card className="gradient-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Preview Card */}
                  <div className="gradient-card rounded-2xl overflow-hidden border-white/10">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 flex items-center justify-center">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={image} 
                          alt={name || "Agent Preview"} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No image provided</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">
                          {name || "Agent Name"}
                        </h3>
                        <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10">
                          {price ? `${price} ETH` : "0.00 ETH"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        by {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0x0000...0000"}
                      </p>
                      {category && (
                        <Badge variant="secondary" className="bg-purple-500/80 text-white text-xs">
                          {category}
                        </Badge>
                      )}
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {desc || "Agent description will appear here..."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="gradient-card border-white/10">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-4">💡 Creation Tips</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Use a clear, descriptive name for your agent</li>
                  <li>• Explain the agent's capabilities and use cases</li>
                  <li>• Choose an appropriate category for better discoverability</li>
                  <li>• Set a competitive price based on similar agents</li>
                  <li>• Use high-quality images (400x300px recommended)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


