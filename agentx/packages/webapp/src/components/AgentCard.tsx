"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Eye, Zap, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/lib/contracts";
import { parseEther } from "viem";
import { deactivateListing } from "@/lib/marketplaceListings";

export function AgentCard({ 
  id, 
  name, 
  owner, 
  image, 
  priceEth, 
  category, 
  listingId,
  tokenId 
}: {
  id: string; 
  name: string; 
  owner: string; 
  image: string; 
  priceEth: number; 
  category: string;
  listingId?: number;
  tokenId?: string;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { isConnected, address } = useAccount();
  const { writeContract: buyNFT, data: buyHash, error: buyError } = useWriteContract();
  const { isLoading: isBuyLoading, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!listingId || listingId <= 0) {
      console.error("❌ Invalid listingId:", listingId);
      alert("This NFT is not available for purchase (invalid listing ID)");
      return;
    }
    
    if (owner.toLowerCase() === address?.toLowerCase()) {
      alert("You cannot buy your own NFT");
      return;
    }
    
    setIsBuying(true);
    
    try {
      console.log("🛒 Buying NFT from marketplace...");
      console.log("🔍 DEBUG: listingId:", listingId, "type:", typeof listingId);
      console.log("🔍 DEBUG: priceEth:", priceEth, "type:", typeof priceEth);
      console.log("🔍 DEBUG: MARKETPLACE_ADDRESS:", MARKETPLACE_ADDRESS);
      
      // ✅ FIX: priceEth validation
      if (!priceEth || isNaN(priceEth)) {
        console.error("❌ Invalid priceEth:", priceEth);
        alert("Invalid price for this NFT");
        setIsBuying(false);
        return;
      }
      
      // ✅ FIX: Marketplace'de listing var mı kontrol et
      try {
        const listingResponse = await fetch('https://evmrpc-testnet.0g.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: MARKETPLACE_ADDRESS,
              data: '0x3f26479e' + (listingId || 0).toString(16).padStart(64, '0') // listings(uint256)
            }, 'latest'],
            id: 1
          })
        });
        
        const listingResult = await listingResponse.json();
        console.log("🔍 DEBUG: Marketplace listing check:", listingResult);
        
        if (!listingResult.result || listingResult.result === '0x') {
          throw new Error("Listing not found on marketplace");
        }
      } catch (validationError) {
        console.error("❌ Marketplace validation failed:", validationError);
        alert("This listing is not available on the marketplace. Please refresh the page.");
        setIsBuying(false);
        return;
      }
      
      buyNFT({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "buy",
        args: [BigInt(listingId)],
        value: parseEther(priceEth.toString() || "0"),
        gas: BigInt(500000), // 0G Network için yeterli gas
      });
    } catch (error: any) {
      console.error("Buy failed:", error);
      
      // Gelişmiş error handling
      let errorMessage = "Purchase failed. Please try again.";
      
      if (error?.message?.includes("out of gas") || error?.message?.includes("gas")) {
        errorMessage = "Transaction failed due to insufficient gas. The network may be congested. Please try again.";
      } else if (error?.message?.includes("NOT_ACTIVE")) {
        errorMessage = "This NFT is no longer available for purchase.";
      } else if (error?.message?.includes("BAD_PRICE")) {
        errorMessage = "Price mismatch. The NFT price may have changed.";
      } else if (error?.message?.includes("User rejected") || error?.code === 4001) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error?.message?.includes("network") || error?.message?.includes("timeout")) {
        errorMessage = "Network timeout. Please check your connection and try again.";
      } else if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet.";
      }
      
      alert(errorMessage);
      setIsBuying(false);
    }
  };
  
  // Handle buy success
  if (isBuySuccess && buyHash) {
    // Deactivate listing after successful purchase
    if (listingId) {
      deactivateListing(listingId).then(result => {
        if (result.success) {
          console.log(`✅ Listing ${listingId} deactivated after purchase`);
        } else {
          console.error(`❌ Failed to deactivate listing ${listingId}:`, result.error);
        }
      });
    }

    // 🚀 NEW: Mark agent as sold in database after successful purchase
    fetch('/api/agents', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: id,
        buyerAddress: address
      }),
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log('✅ Agent marked as sold in database');
        // Refresh the page after successful purchase and database update
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('❌ Failed to mark agent as sold:', result.error);
      }
    })
    .catch(error => {
      console.error('❌ Failed to update agent status:', error);
      // Don't fail the entire purchase for this
    });

    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group"
      >
        <Card className="overflow-hidden gradient-card border-green-400/30">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Purchase Successful!</h3>
            <p className="text-sm text-gray-400 mb-4">You now own {name}</p>
            <Badge variant="outline" className="border-green-400/50 text-green-300 bg-green-500/10">
              Owned by You
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Link href={`/agent/${id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group cursor-pointer"
      >
        <Card className="overflow-hidden gradient-card hover:glow-purple transition-all duration-300 border-white/10">
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" 
            />
            
            {/* Hover Actions */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 bg-black/50 backdrop-blur-sm hover:bg-purple-500/50 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 bg-black/50 backdrop-blur-sm hover:bg-purple-500/50 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white" />
              </Button>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-purple-500/80 text-white border-none text-xs">
                {category}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">{name}</h3>
                <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10">
                  {priceEth} 0G
                </Badge>
              </div>
              <p className="text-sm text-gray-400 truncate">by {owner}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/agent/${id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full border-purple-400/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
              
              {listingId && listingId > 0 && owner.toLowerCase() !== address?.toLowerCase() ? (
                <Button 
                  size="sm" 
                  className="flex-1 gradient-0g hover:opacity-90 text-white font-medium cursor-pointer"
                  onClick={handleBuyNow}
                  disabled={isBuying || isBuyLoading}
                >
                  {isBuying || isBuyLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                      Buying...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="flex-1 gradient-0g hover:opacity-90 text-white font-medium"
                  disabled
                >
                  {owner.toLowerCase() === address?.toLowerCase() ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Owned
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Not Listed
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </Link>
  );
}


