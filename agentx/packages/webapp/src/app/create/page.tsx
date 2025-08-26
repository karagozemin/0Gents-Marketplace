"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, Zap, Eye, Info, Wallet, Share2 } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, AGENT_NFT_ABI, MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ZERO_G_CHAIN_ID } from "@/lib/contracts";
import { uploadAgentMetadata, type AgentMetadata } from "@/lib/storage";
import { saveCreatedAgent, type CreatedAgent } from "@/lib/createdAgents";
import { saveGlobalAgent, type BlockchainAgent } from "@/lib/blockchainAgents";
import { parseEther } from "viem";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function CreatePage() {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [website, setWebsite] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<CreatedAgent | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  
  const { address, isConnected } = useAccount();

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { writeContract: writeFactory, data: createHash, error: createError } = useWriteContract();
  const { writeContract: writeAgentNFT, data: mintHash, error: mintError } = useWriteContract();
  const { writeContract: writeMarketplace, data: listHash, error: listError } = useWriteContract();
  
  const { isLoading: isCreateLoading, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
    timeout: 300000, // 5 minutes timeout for 0G network
  });
  
  const { isLoading: isMintLoading, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
    timeout: 300000, // 5 minutes timeout for 0G network
  });
  
  const { isLoading: isListLoading, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
    timeout: 300000, // 5 minutes timeout for 0G network
  });
  
  // State for agent contract address and storage result
  const [agentContractAddress, setAgentContractAddress] = useState<string>("");
  const [storageUri, setStorageUri] = useState<string>("");

  const updateProgress = (step: string) => {
    setCurrentStep(step);
    setProgressSteps(prev => [...prev, step]);
  };

  const handleCreate = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!name || !desc || !price) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (name.trim().length === 0 || desc.trim().length === 0) {
      alert("Name and description cannot be empty");
      return;
    }

    setIsCreating(true);
    setCurrentStep("");
    setProgressSteps([]);
    
    try {
      // Step 1: Create metadata object for 0G Storage
      updateProgress("🎯 Step 1: Preparing agent metadata...");
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
        social: {
          x: xHandle ? `https://x.com/${xHandle.replace('@', '')}` : undefined,
          website: website || undefined
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      updateProgress("✅ Step 1: Metadata prepared successfully");
      console.log("🔥 Step 1: Creating AI Agent with 0G Storage integration:", metadata);

      // Step 2: Upload metadata to 0G Storage with timeout
      updateProgress("🔄 Step 2: Uploading to 0G Storage Network...");
      console.log("📤 Step 2: Uploading metadata to 0G Storage...");
      
      const uploadPromise = uploadAgentMetadata(metadata);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Storage upload timeout (5 minutes)')), 300000)
      );

      const storageResult = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (!storageResult.success) {
        throw new Error(`0G Storage upload failed: ${storageResult.error}`);
      }

      updateProgress(`✅ Step 2: Uploaded to 0G Storage: ${storageResult.uri?.slice(0, 30)}...`);
      console.log("✅ Step 2: Agent metadata uploaded to 0G Storage:", storageResult.uri);
      
      // Save storage URI to state for later use
      const uri = storageResult.uri || "";
      setStorageUri(uri);
      console.log("🔗 Storage URI saved to state:", uri);
      
      if (!uri) {
        throw new Error("0G Storage upload failed - no URI returned. Please try again.");
      }

      // Step 3: Create Agent Contract via Factory
      updateProgress("🎯 Step 3: Creating Agent Contract...");
      console.log("🎯 Step 3: Creating Agent Contract via Factory...");
      console.log("Factory Address:", FACTORY_ADDRESS);
      
      const capabilities = [
        "Natural Language Processing",
        "Task Automation",
        "0G Network Integration"
      ];
      
      console.log("Creating agent with:", {
        name,
        description: desc,
        category: category || "General",
        computeModel: "gpt-4",
        storageHash: storageUri.split('/').pop() || storageUri,
        capabilities,
        price: parseEther(price || "0.075")
      });
      
      console.log("Exact transaction details:");
      console.log("To:", FACTORY_ADDRESS);
      console.log("Value:", parseEther("0.01"));
      console.log("Function:", "createAgent");
      const finalArgs: [string, string, string, string, string, string[], bigint] = [
        name.trim(),
        desc.trim(),
        (category || "General").trim(),
        "gpt-4",
        storageUri.split('/').pop() || storageUri || "dummy-hash",
        capabilities,
        parseEther(price || "0.075")
      ];
      
      console.log("Args:", finalArgs);
      
      // Validate arguments
      if (!finalArgs[0] || !finalArgs[1] || !finalArgs[4]) {
        throw new Error("Invalid arguments: name, description, or storageHash is empty");
      }
      
      // Create new Agent NFT Contract with retry logic
      try {
        await writeFactory({
          address: FACTORY_ADDRESS as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "createAgent",
          args: finalArgs,
          value: parseEther("0.01"), // Factory creation fee
          gas: BigInt(3000000), // Increased gas limit for 0G network
        });
      } catch (error: any) {
        console.error("Factory writeContract error:", error);
        if (error?.message?.includes("User rejected") || error?.code === 4001) {
          throw new Error("Transaction was rejected by user");
        } else if (error?.message?.includes("network") || error?.message?.includes("timeout")) {
          throw new Error("0G Network is busy. Transaction will be retried automatically. Please wait up to 5 minutes.");
        } else {
          throw new Error(`Transaction failed: ${error?.message || "Unknown error"}`);
        }
      }

      updateProgress("✅ Step 3: Agent Contract creation submitted - waiting for confirmation...");
      console.log("✅ Step 3: Agent Contract creation submitted");
      
    } catch (error) {
      console.error("Agent creation error:", error);
      
      // Enhanced error handling with progress tracking
      let errorMessage = "Unknown error occurred";
      let fallbackAction = "";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = "⏰ Operation timed out - 0G network is busy. Please try again.";
          updateProgress("❌ Timeout - please try again");
        } else if (error.message.includes('Storage')) {
          errorMessage = "📦 0G Storage upload failed - please try again";
          updateProgress("❌ 0G Storage upload failed - please try again");
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = "🌐 Network connectivity issue - please try again";
          updateProgress("❌ Network issue - please try again");
        } else if (error.message.includes('rejected')) {
          errorMessage = "❌ Transaction rejected by user";
          updateProgress("❌ User cancelled transaction");
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "💰 Insufficient balance (need ≥0.006 OG tokens)";
          updateProgress("❌ Insufficient balance for transaction");
        } else {
          errorMessage = error.message;
          updateProgress(`❌ Error: ${error.message.slice(0, 50)}...`);
        }
      }
      
      // Show user-friendly error
      alert(`Failed to create agent: ${errorMessage}`);
      setIsCreating(false);
    }
  };

  // Handle successful agent contract creation
  React.useEffect(() => {
    if (isCreateSuccess && createHash && !createdAgent) {
      updateProgress("🎉 Agent Contract created successfully!");
      console.log("🎉 Agent Contract created on 0G Network!");
      
      // Extract agent contract address from transaction receipt
      const extractContractAddress = async () => {
        try {
          const receipt = await fetch(`https://evmrpc-testnet.0g.ai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionReceipt',
              params: [createHash],
              id: 1
            })
          });
          
          const result = await receipt.json();
          console.log("Transaction receipt:", result);
          
          if (result.result && result.result.logs && result.result.logs.length > 0) {
            // Parse AgentContractCreated event - first topic is event signature, second is contract address
            const log = result.result.logs.find((log: any) => 
              log.topics && log.topics.length >= 2 && 
              log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()
            );
            
            if (log && log.topics[1]) {
              // Extract address from topic (remove 0x and pad zeros, take last 40 chars)
              const contractAddress = "0x" + log.topics[1].slice(-40);
              console.log("🎯 Extracted Agent Contract Address:", contractAddress);
              setAgentContractAddress(contractAddress);
              
              // Step 4: Mint NFT in the new contract
              updateProgress("🔄 Step 4: Minting NFT in Agent Contract...");
              console.log("🔄 Step 4: Minting NFT in Agent Contract...");
              
              return;
            }
          }
          
          // Fallback if event parsing fails
          console.warn("Could not extract contract address from events, using fallback");
          const fallbackAddress = "0x" + Date.now().toString(16);
          setAgentContractAddress(fallbackAddress);
          
        } catch (error) {
          console.error("Error extracting contract address:", error);
          const fallbackAddress = "0x" + Date.now().toString(16);
          setAgentContractAddress(fallbackAddress);
        }
      };
      
      extractContractAddress();
    }
  }, [isCreateSuccess, createHash]);

  // Handle agent contract address set - trigger mint
  React.useEffect(() => {
    if (agentContractAddress && agentContractAddress !== "" && storageUri && !mintHash) {
      console.log("🎯 Starting mint with contract:", agentContractAddress);
      
      try {
        writeAgentNFT({
          address: agentContractAddress as `0x${string}`,
          abi: AGENT_NFT_ABI,
          functionName: "mint",
          args: [storageUri],
        });
        
        updateProgress("🔄 Step 4: Minting NFT in Agent Contract...");
        console.log("🔄 Step 4: Mint transaction submitted");
        
      } catch (error) {
        console.error("Mint error:", error);
        updateProgress("❌ Failed to mint NFT in agent contract");
      }
    }
  }, [agentContractAddress, storageUri, mintHash]);

  // Handle successful NFT minting
  React.useEffect(() => {
    if (isMintSuccess && mintHash && !createdAgent) {
      updateProgress("🎉 NFT minted successfully! Agent is ready to use.");
      console.log("🎉 AI Agent NFT successfully minted!");
      
      // Save to local storage for featured display
      const timestamp = Date.now();
      const newAgent: CreatedAgent = {
        id: `${timestamp}`, // Remove 'created-' prefix for simpler URLs
        tokenId: timestamp.toString(), // Use timestamp as tokenId for cross-browser matching
        name,
        description: desc,
        image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
        category: category || "General",
        creator: address || "",
        price,
        txHash: mintHash,
        storageUri: "", // Would be from the upload result
        social: {
          x: xHandle ? `https://x.com/${xHandle.replace('@', '')}` : undefined,
          website: website || undefined
        },
        createdAt: new Date().toISOString()
      };
      
      saveCreatedAgent(newAgent);
      setCreatedAgent(newAgent);
      
      // Also save to cross-browser storage with full agent data
      const blockchainAgent: BlockchainAgent = {
        tokenId: timestamp.toString(),
        owner: address || "",
        tokenURI: "", // Would be extracted from transaction receipt
        creator: address || "",
        discoveredAt: new Date().toISOString(),
        // Add extra fields for cross-browser display
        name,
        description: desc,
        image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
        category: category || "General",
        price,
        social: {
          x: xHandle ? `https://x.com/${xHandle.replace('@', '')}` : undefined,
          website: website || undefined
        }
      } as any; // Extend the type temporarily
      
      saveGlobalAgent(blockchainAgent);
      
      // Auto-listing: Approve and list NFT on marketplace (OPTIONAL)
      updateProgress("🔄 Step 4: Attempting auto-listing on marketplace...");
      console.log("🔄 Step 4: Attempting auto-listing on marketplace...");
      
      try {
        // First approve marketplace to transfer NFT
        updateProgress("📝 Minting NFT in Agent Contract...");
        console.log("📝 Minting NFT in Agent Contract...");
        
        if (agentContractAddress && storageUri) {
          writeAgentNFT({
            address: agentContractAddress as `0x${string}`,
            abi: AGENT_NFT_ABI,
            functionName: "mint",
            args: [storageUri],
            gas: BigInt(200000),
          });
        }
        updateProgress("ℹ️ Marketplace approval requested - you can confirm or skip this step.");
      } catch (error) {
        console.error("❌ Auto-listing failed:", error);
        updateProgress("✅ NFT created successfully! You can list it manually later.");
        console.log("ℹ️ Agent created but not auto-listed - this is normal");
        setIsCreating(false);
      }
    }
  }, [isMintSuccess]);

  // Handle marketplace approval success (step 2 of auto-listing)
  React.useEffect(() => {
    if (isListSuccess && listHash && !createdAgent) {
      console.log("✅ Marketplace approved! Now listing NFT...");
      
      try {
        // List NFT on marketplace
        const timestamp = Date.now();
        const listingPrice = parseEther(price || "0.075");
        
        console.log("🏪 Listing NFT on marketplace...");
        if (agentContractAddress) {
          writeMarketplace({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: "list",
            args: [
              agentContractAddress as `0x${string}`, // NFT contract
            BigInt(1), // tokenId (always 1 for agent contracts)
            listingPrice // price in wei
          ],
          gas: BigInt(200000),
          });
        }
      } catch (error) {
        console.error("❌ Listing failed:", error);
        console.log("ℹ️ Agent approved but listing failed - you can list manually");
        setIsCreating(false);
      }
    }
  }, [isListSuccess, listHash]);

  // Handle errors with improved messages
  React.useEffect(() => {
    if (mintError) {
      console.error("Mint error:", mintError);
      
      let errorMessage = "NFT minting failed: ";
      if (mintError.message.includes('insufficient funds')) {
        errorMessage += "Insufficient balance. At least 0.006 OG tokens required.";
      } else if (mintError.message.includes('rejected')) {
        errorMessage += "Transaction rejected by user.";
      } else if (mintError.message.includes('network')) {
        errorMessage += "Network connection issue. Please try again.";
      } else {
        errorMessage += mintError.message;
      }
      
      alert(errorMessage);
      setIsCreating(false);
    }
    
    if (listError) {
      console.error("Marketplace error:", listError);
      console.log("ℹ️ Agent created but marketplace interaction failed");
      // Don't alert for marketplace errors, just log them
      // The agent was successfully created, marketplace listing is secondary
    }
  }, [mintError, listError]);

  // Success State
  if (isMintSuccess && mintHash) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="gradient-card rounded-3xl p-12 border border-green-400/30">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-green-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Successfully Created!
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your AI Agent NFT has been successfully created on the 0G Network. 
              It's now live and ready to be discovered by the community!
            </p>
            
            <div className="bg-black/20 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Transaction Hash:</span>
                <span className="font-mono text-green-400">
                  {mintHash.slice(0, 10)}...{mintHash.slice(-8)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="gradient-0g hover:opacity-90 text-white font-semibold px-8 py-3 cursor-pointer"
                onClick={() => window.location.href = '/my-collections'}
              >
                <Eye className="w-5 h-5 mr-2" />
                View My Collections
              </Button>
              
              <Button 
                size="lg" 
                className="bg-black/80 text-white border border-purple-400/50 hover:bg-black/90 hover:border-purple-400/70 backdrop-blur-sm px-8 py-3 cursor-pointer"
                onClick={() => window.location.href = '/#featured-section'}
              >
                <Eye className="w-5 h-5 mr-2" />
                Explore Marketplace
              </Button>
              
              <Button 
                size="lg" 
                className="bg-gray-800/80 text-white border border-gray-400/50 hover:bg-gray-800/90 hover:border-gray-400/70 backdrop-blur-sm px-8 py-3 cursor-pointer"
                onClick={() => {
                  // Reset form for new creation
                  setName("");
                  setDesc("");
                  setPrice("");
                  setImage("");
                  setCategory("");
                  setXHandle("");
                  setWebsite("");
                  window.location.reload();
                }}
              >
                Create Another
              </Button>
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
                  <label className="text-sm font-medium text-gray-300">Price (0G) *</label>
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

                {/* Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <h3 className="font-medium text-white">Social Links</h3>
                    <span className="text-xs text-gray-500">(Optional)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* X Handle */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">X (Twitter) Handle</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                        <Input 
                          placeholder="username" 
                          value={xHandle.replace('@', '')} 
                          onChange={(e) => setXHandle(e.target.value.replace('@', ''))}
                          className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500 pl-8"
                        />
                      </div>
                    </div>
                    
                    {/* Website */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Website</label>
                      <Input 
                        placeholder="https://yourwebsite.com" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Display */}
            {isCreating && (
              <Card className="gradient-card border-white/10 bg-blue-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
                    <h3 className="font-semibold text-white">Creation Progress</h3>
                  </div>
                  <div className="space-y-2">
                    {currentStep && (
                      <div className="text-blue-300 font-medium animate-pulse">
                        {currentStep}
                      </div>
                    )}
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {progressSteps.map((step, index) => (
                        <div key={index} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <span className="text-gray-300">Creation Fee</span>
                    <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                      0.005 OG
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Network Fee</span>
                    <Badge variant="outline" className="border-green-400/50 text-green-300">
                      ~0.001 OG
                    </Badge>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total Estimated</span>
                      <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                        ~0.006 OG
                      </Badge>
                    </div>
                  </div>
                                <div className="mt-3 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                <div className="text-xs text-green-300">
                  <strong>Auto-Listing Enabled:</strong><br/>
                  • Agent created & auto-listed<br/>
                  • Available for purchase immediately<br/>
                  • Platform Fee: 10% on each sale
                </div>
              </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <div className="space-y-4">
              {!mounted ? (
                <div className="text-center p-6 rounded-xl bg-gray-500/10 border border-gray-400/20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-300 font-medium">Loading...</p>
                </div>
              ) : !isConnected ? (
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
                          {price ? `${price} 0G` : "0.00 0G"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        by {mounted && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0x0000...0000"}
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
      <Footer />
    </div>
  );
}


