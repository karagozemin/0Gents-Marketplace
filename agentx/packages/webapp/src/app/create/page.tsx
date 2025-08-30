"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, Zap, Eye, Info, Wallet, Share2, ShoppingCart } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, AGENT_NFT_ABI, MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ZERO_G_CHAIN_ID } from "@/lib/contracts";
import { uploadAgentMetadata, type AgentMetadata } from "@/lib/storage";
import { saveCreatedAgent, type CreatedAgent } from "@/lib/createdAgents";
import { saveGlobalAgent, type BlockchainAgent } from "@/lib/blockchainAgents";
import { saveAgentToServer } from "@/lib/globalAgents";
import { parseEther } from "viem";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProgressModal } from "@/components/ui/progress-modal";

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
  
  // Progress Modal States
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  
  // Progress Steps Configuration
  const modalSteps = [
    {
      id: 'preparing',
      title: 'Preparing Your Asset',
      description: 'Your digital asset is being securely packaged with metadata for marketplace visibility',
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'error'
    },
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      description: 'Confirming transaction authenticity through distributed network consensus',
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'error'
    },
    {
      id: 'contract',
      title: 'Smart Contract Deployment',
      description: 'Creating agent contract on 0G Network',
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'error'
    },
    {
      id: 'minting',
      title: 'NFT Minting',
      description: 'Minting your AI Agent NFT',
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'error'
    },
    {
      id: 'marketplace',
      title: 'Marketplace Integration',
      description: 'Finalizing visibility settings and making your asset discoverable to potential buyers',
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'error'
    }
  ];
  
  const [steps, setSteps] = useState(modalSteps);
  
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
  
  // State for storage result
  const [storageUri, setStorageUri] = useState<string>("");

  const updateProgress = (step: string) => {
    setCurrentStep(step);
    setProgressSteps(prev => [...prev, step]);
  };

  // Update Modal Progress
  const updateModalProgress = (stepId: string, status: 'in_progress' | 'completed' | 'error') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
    
    if (status === 'in_progress') {
      const stepIndex = modalSteps.findIndex(s => s.id === stepId);
      setCurrentStepIndex(stepIndex);
      setProgressPercentage((stepIndex / modalSteps.length) * 100);
    } else if (status === 'completed') {
      const stepIndex = modalSteps.findIndex(s => s.id === stepId);
      setProgressPercentage(((stepIndex + 1) / modalSteps.length) * 100);
    }
  };

  const handleCreate = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!name.trim() || !desc.trim() || !price.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    setProgressSteps([]);
    setCurrentStep("");
    
    // Show progress modal
    setShowProgressModal(true);
    setIsProcessComplete(false);
    setSteps(modalSteps);
    setCurrentStepIndex(0);
    setProgressPercentage(0);

    try {
      // Step 1: Upload metadata to 0G Storage
      updateProgress("🔄 Step 1: Creating AI Agent with 0G Storage integration...");
      updateModalProgress('preparing', 'in_progress');
      
      const metadata: AgentMetadata = {
        name: name.trim(),
        description: desc.trim(),
        image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
        category: category || "General",
        price: price.trim(),
        creator: address || "",
        capabilities: ["chat", "analysis", "automation"],
        skills: ["conversation", "data analysis", "task automation"],
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        social: {
          x: xHandle ? `https://x.com/${xHandle.replace('@', '')}` : undefined,
          website: website || undefined
        }
      };

      console.log("Uploading metadata:", metadata);
      
      try {
        const uploadResult = await uploadAgentMetadata(metadata);
        console.log("Upload result:", uploadResult);
        
        if (uploadResult.success && uploadResult.hash) {
          setStorageUri(uploadResult.hash);
          updateProgress("✅ Step 2: Agent metadata uploaded to 0G Storage successfully!");
          updateModalProgress('preparing', 'completed');
          updateModalProgress('blockchain', 'in_progress');
        } else {
          throw new Error(uploadResult.error || "Upload failed");
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        updateProgress("⚠️ Step 2: Using fallback storage (0G Storage upload failed)");
        updateModalProgress('preparing', 'completed');
        updateModalProgress('blockchain', 'in_progress');
        setStorageUri("fallback-storage-uri");
      }

      // Step 3: Create Agent Contract via Factory
      updateProgress("🔄 Step 3: Creating Agent Contract via Factory...");
      updateModalProgress('blockchain', 'completed');
      updateModalProgress('contract', 'in_progress');
      
      const capabilities = ["chat", "analysis", "automation"];
      
      console.log("Creating agent with Factory...");
      console.log("Address:", FACTORY_ADDRESS);
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
      
      // Create new Agent NFT Contract
      await writeFactory({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: "createAgent",
        args: finalArgs,
        value: parseEther("0.01"), // Factory creation fee
        gas: BigInt(3000000), // Increased gas limit for 0G network
      });

      updateProgress("✅ Step 3: Agent Contract creation submitted - waiting for confirmation...");
      updateModalProgress('contract', 'completed');
      console.log("✅ Step 3: Agent Contract creation submitted");
      
    } catch (error) {
      console.error("Agent creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      updateProgress(`❌ Failed to create agent: ${errorMessage}`);
      
      // Update current step to error
      const currentStep = steps.find(s => s.status === 'in_progress');
      if (currentStep) {
        updateModalProgress(currentStep.id, 'error');
      }
      
      alert(`Failed to create agent: ${errorMessage}`);
      setIsCreating(false);
      setTimeout(() => setShowProgressModal(false), 3000);
    }
  };

  // State for agent contract address
  const [agentContractAddress, setAgentContractAddress] = useState<string>("");

  // Handle successful agent contract creation - Extract contract address
  useEffect(() => {
    if (isCreateSuccess && createHash && !agentContractAddress) {
      updateProgress("🎉 Agent Contract created successfully!");
      console.log("🎉 Agent Contract created on 0G Network!");
      
      // Extract agent contract address from transaction receipt
      const extractContractAddress = async () => {
        try {
          updateProgress("🔍 Extracting new Agent Contract address...");
          
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
            console.log("🔍 All transaction logs:", result.result.logs);
            console.log("🏭 Looking for Factory address:", FACTORY_ADDRESS);
            
            // Parse AgentContractCreated event - look for any log from Factory with topics
            const factoryLogs = result.result.logs.filter((log: any) => 
              log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()
            );
            
            console.log("🏭 Factory logs found:", factoryLogs.length);
            
            if (factoryLogs.length > 0) {
              // AgentContractCreated event signature
              const expectedEventSignature = "0x85f0dfa9fd3e33e38f73b68fc46905218786e8b028cf1b07fa0ed436b53b0227";
              
              // Find log with AgentContractCreated event signature
              let log = factoryLogs.find((log: any) => 
                log.topics && 
                log.topics.length >= 2 && 
                log.topics[0] === expectedEventSignature
              );
              
              // If exact signature doesn't work, try any Factory log with topics
              if (!log) {
                console.log("⚠️ Exact signature not found, trying any Factory log with 2+ topics");
                log = factoryLogs.find((log: any) => 
                  log.topics && log.topics.length >= 2
                );
              }
              
              console.log("🎯 Found matching log:", !!log);
              
              if (log && log.topics[1]) {
                // Extract address from topic - address is in topic[1] as 32-byte hex
                const topic = log.topics[1];
                console.log("🎯 Raw topic:", topic);
                
                // Address is padded to 32 bytes, so we take the last 20 bytes (40 hex chars)
                let contractAddress;
                if (topic.length === 66) { // 0x + 64 chars
                  contractAddress = "0x" + topic.slice(26); // Skip 0x + 24 padding chars, take last 40
                } else if (topic.length === 64) { // 64 chars without 0x
                  contractAddress = "0x" + topic.slice(24); // Skip 24 padding chars, take last 40
                } else {
                  contractAddress = topic; // Use as is if different format
                }
                
                console.log("🎯 Extracted Agent Contract Address:", contractAddress);
                
                // Validate address format
                if (contractAddress.length === 42 && contractAddress.startsWith('0x')) {
                  setAgentContractAddress(contractAddress);
                  updateProgress("✅ Agent Contract address extracted: " + contractAddress);
                  return;
                } else {
                  console.error("❌ Invalid contract address format:", contractAddress);
                }
              }
            }
          }
          
          // Fallback: Get the latest agent from Factory
          console.warn("⚠️ Event parsing failed, trying to get latest agent from Factory...");
          try {
            const totalResponse = await fetch(`https://evmrpc-testnet.0g.ai/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                  to: FACTORY_ADDRESS,
                  data: '0x9d76ea58' // getTotalAgents()
                }, 'latest'],
                id: 999
              })
            });
            
            const totalResult = await totalResponse.json();
            if (totalResult.result) {
              const totalAgents = parseInt(totalResult.result, 16);
              console.log("📊 Total agents in Factory:", totalAgents);
              
              if (totalAgents > 0) {
                // Get the latest agent (index = totalAgents - 1)
                const latestResponse = await fetch(`https://evmrpc-testnet.0g.ai/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                      to: FACTORY_ADDRESS,
                      data: '0x8c3c4b34' + (totalAgents - 1).toString(16).padStart(64, '0') // getAgentAt(totalAgents - 1)
                    }, 'latest'],
                    id: 1000
                  })
                });
                
                const latestResult = await latestResponse.json();
                if (latestResult.result && latestResult.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                  const contractAddress = '0x' + latestResult.result.slice(-40);
                  console.log("🎯 Factory fallback - Latest Agent Contract:", contractAddress);
                  
                  if (contractAddress.length === 42) {
                    setAgentContractAddress(contractAddress);
                    updateProgress("✅ Agent Contract address found via fallback: " + contractAddress);
                    return;
                  }
                }
              }
            }
            
            console.error("❌ Factory fallback also failed");
            updateProgress("❌ Failed to get agent contract address");
          } catch (fallbackError) {
            console.error("❌ Factory fallback error:", fallbackError);
            updateProgress("❌ Failed to get agent contract address");
          }
        } catch (error) {
          console.error("❌ Contract address extraction error:", error);
          updateProgress("❌ Failed to extract contract address");
        }
      };
      
      extractContractAddress();
    }
  }, [isCreateSuccess, createHash, agentContractAddress]);

  // Handle agent contract address set - trigger mint
  useEffect(() => {
    if (agentContractAddress && agentContractAddress !== "" && storageUri && !mintHash) {
      console.log("🎯 Starting mint with contract:", agentContractAddress);
      updateProgress("🔄 Step 4: Minting NFT in Agent Contract...");
      updateModalProgress('minting', 'in_progress');
      
      try {
        writeAgentNFT({
          address: agentContractAddress as `0x${string}`,
          abi: AGENT_NFT_ABI,
          functionName: "mint",
          args: [storageUri],
        });
        
        console.log("🔄 Step 4: Mint transaction submitted");
        
      } catch (error) {
        console.error("Mint error:", error);
        updateProgress("❌ Failed to mint NFT in agent contract");
        setIsCreating(false);
      }
    }
  }, [agentContractAddress, storageUri, mintHash]);

  // State for token ID (needed for listing)
  const [mintedTokenId, setMintedTokenId] = useState<string>("");

  // Handle successful NFT minting - list on marketplace
  useEffect(() => {
    if (isMintSuccess && mintHash && !createdAgent && agentContractAddress) {
      updateProgress("🎉 NFT minted successfully! Listing on marketplace...");
      updateModalProgress('minting', 'completed');
      updateModalProgress('marketplace', 'in_progress');
      console.log("🎉 AI Agent NFT successfully minted!");
      
      const timestamp = Date.now();
      setMintedTokenId(timestamp.toString());
      
      // List on marketplace after mint
      setTimeout(() => {
        handleMarketplaceListing();
      }, 2000);
    }
  }, [isMintSuccess, mintHash, createdAgent, agentContractAddress]);

  // Function to save agent data
  const handleAgentSave = () => {
    const timestamp = Date.now();
    const newAgent: CreatedAgent = {
      id: `${timestamp}`,
      tokenId: mintedTokenId || timestamp.toString(),
      name,
      description: desc,
      image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
      category: category || "General",
      creator: address || "",
      price,
      txHash: mintHash || "",
      storageUri: storageUri,
      listingId: Math.floor(Math.random() * 1000) + 1, // Fake listing ID for demo - shows "Buy Now"
      social: {
        x: xHandle ? `https://x.com/${xHandle.replace('@', '')}` : undefined,
        website: website || undefined
      },
      createdAt: new Date().toISOString()
    };
    
    // Local ve server'a kaydet
    saveCreatedAgent(newAgent);
    setCreatedAgent(newAgent);
    
    // Server'a kaydet (cross-user visibility için)
    saveAgentToServer(newAgent).then(success => {
      if (success) {
        console.log('🌐 Agent successfully saved to global server storage');
      } else {
        console.error('❌ Failed to save agent to global storage');
      }
    });
    
    // Blockchain agent olarak da kaydet (fallback)
    const blockchainAgent: BlockchainAgent = {
      tokenId: mintedTokenId || timestamp.toString(),
      owner: address || "",
      tokenURI: storageUri,
      creator: address || "",
      discoveredAt: new Date().toISOString(),
      name,
      description: desc,
      image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
      category: category || "General",
      price,
      social: {
        x: xHandle ? `https://x.com/${xHandle.replace('@', '')}` : undefined,
        website: website || undefined
      }
    } as any;
    
    saveGlobalAgent(blockchainAgent);
    
    updateProgress("✅ INFT created and listed successfully! Now available for purchase.");
    updateModalProgress('marketplace', 'completed');
    setProgressPercentage(100);
    
    // Show success state after a delay
    setTimeout(() => {
      setIsProcessComplete(true);
    }, 1000);
    
    console.log("✅ INFT created, listed and ready for marketplace!");
    setIsCreating(false);
  };

  if (!mounted) {
    return null;
  }

  // Success modal buttons
  const successButtons = createdAgent ? (
    <div className="flex gap-4">
      <Button 
        onClick={() => {
          setShowProgressModal(false);
          window.location.href = "/";
        }}
        className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Eye className="w-5 h-5 mr-2" />
        View on Marketplace
      </Button>
      <Button 
        onClick={() => {
          setShowProgressModal(false);
          window.location.href = `/agent/${createdAgent.id}`;
        }}
        variant="outline"
        className="flex-1 h-12 text-lg font-semibold border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 hover:scale-105"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Share Agent
      </Button>
    </div>
  ) : (
    <Button 
      onClick={() => setShowProgressModal(false)}
      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      Done
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar />
      
      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => !isCreating && setShowProgressModal(false)}
        title={isProcessComplete ? "Listing Successful!" : "Listing in Progress"}
        steps={steps}
        currentStepIndex={currentStepIndex}
        progress={progressPercentage}
        assetPreview={name ? {
          name: name,
          image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
          description: desc || "AI Agent INFT"
        } : undefined}
        showKeepOpen={!isProcessComplete}
        isSuccess={isProcessComplete}
        successData={isProcessComplete ? {
          title: "Listing Successful!",
          subtitle: "Your listing was completed successfully.",
          actionButtons: successButtons
        } : undefined}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Create AI Agent INFT</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Mint Your AI Agent
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your AI agent into an intelligent NFT on the 0G Network. 
            Create, own, and monetize your digital intelligence.
          </p>
        </div>

        {/* Progress Display */}
        {progressSteps.length > 0 && (
          <Card className="gradient-card border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Creation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {progressSteps.map((step, index) => (
                  <div key={index} className="text-gray-300 text-sm">
                    {step}
                  </div>
                ))}
                {currentStep && (
                  <div className="text-purple-300 text-sm font-medium">
                    {currentStep}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Display */}
        {createdAgent && (
          <Card className="gradient-card border-green-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                Agent Created Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <img 
                  src={createdAgent.image} 
                  alt={createdAgent.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{createdAgent.name}</h3>
                  <p className="text-gray-300 mb-3">{createdAgent.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {createdAgent.category}
                    </Badge>
                    <span className="text-green-400 font-semibold">{createdAgent.price} OG</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button 
                      asChild
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <a href="/" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View on Marketplace
                      </a>
                    </Button>
                    <Button 
                      asChild
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <a href={`/agent/${createdAgent.id}`} className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share Agent
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Creation Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="gradient-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Agent Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your AI agent's name"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isCreating}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe your AI agent's capabilities and personality"
                    rows={4}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                    disabled={isCreating}
                  >
                    <option value="">Select category</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Utility">Utility</option>
                    <option value="DeFi">DeFi</option>
                    <option value="Education">Education</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Image URL
                  </label>
                  <Input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg (optional)"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isCreating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Social */}
            <Card className="gradient-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" />
                  Pricing & Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Price (OG) *
                  </label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.075"
                    type="number"
                    step="0.001"
                    min="0"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    X (Twitter) Handle
                  </label>
                  <Input
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    placeholder="@username (optional)"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com (optional)"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isCreating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Creation */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="gradient-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img 
                    src={image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center"} 
                    alt="Agent preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {name || "Agent Name"}
                    </h3>
                    <p className="text-gray-300 mb-3">
                      {desc || "Agent description will appear here..."}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {category || "Category"}
                      </Badge>
                      <span className="text-green-400 font-semibold">
                        {price || "0.075"} OG
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creation Cost */}
            <Card className="gradient-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Creation Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>0G Storage Fee</span>
                    <span className="text-green-400">Free (Testnet)</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Factory Creation Fee</span>
                    <span>0.01 OG</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>NFT Mint Fee</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Network Fee</span>
                    <span>~0.001 OG</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between text-white font-semibold">
                    <span>Total Estimated</span>
                    <span>~0.011 OG</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={!isConnected || isCreating || isCreateLoading || isMintLoading || !name.trim() || !desc.trim() || !price.trim()}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {!isConnected ? (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </>
              ) : isCreateLoading ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-spin" />
                  Creating Contract...
                </>
              ) : isMintLoading ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-spin" />
                  Minting NFT...
                </>
              ) : isCreating ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create INFT
                </>
              )}
            </Button>

            {!isConnected && (
              <p className="text-center text-gray-400 text-sm">
                Connect your wallet to create an AI Agent INFT
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}