"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '@/lib/contracts';

export default function TestBuyPage() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  const [listingId, setListingId] = useState('1');
  const [price, setPrice] = useState('0.001');
  const [isBuying, setIsBuying] = useState(false);

  const handleDirectBuy = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsBuying(true);
    try {
      console.log("🛒 Direct buy test...");
      console.log("Parameters:", { listingId, price, marketplace: MARKETPLACE_ADDRESS });

      await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "buy",
        args: [BigInt(listingId)],
        value: parseEther(price),
        gas: BigInt(600000),
      });

      console.log("✅ Buy transaction submitted");
      alert("✅ MetaMask should have opened! Check the transaction.");

    } catch (error: any) {
      console.error("❌ Buy failed:", error);
      alert(`❌ Buy failed: ${error.message}`);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🚀 Direct Buy Test</h1>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test MetaMask Buy Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="p-4 rounded-lg bg-gray-700">
              <p className="text-white">
                Wallet: {isConnected ? `✅ Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` : '❌ Not connected'}
              </p>
              <p className="text-white">
                Marketplace: {MARKETPLACE_ADDRESS}
              </p>
            </div>

            {/* Test Parameters */}
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm block mb-2">Listing ID</label>
                <Input
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm block mb-2">Price (0G)</label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Buy Button */}
            <Button
              onClick={handleDirectBuy}
              disabled={!isConnected || isBuying}
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
            >
              {isBuying ? 'Testing Buy...' : '🚀 TEST BUY NOW (Should Open MetaMask)'}
            </Button>

            {/* Quick Test Buttons */}
            <div className="border-t border-gray-600 pt-4">
              <p className="text-white text-sm mb-2">Quick Tests:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 1, price: '0.001' },
                  { id: 2, price: '0.01' },
                  { id: 3, price: '0.1' }
                ].map(test => (
                  <Button
                    key={test.id}
                    onClick={() => {
                      setListingId(test.id.toString());
                      setPrice(test.price);
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    ID {test.id} - {test.price} 0G
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-gray-300 text-sm space-y-1">
              <p>🎯 This page bypasses all validation</p>
              <p>🔥 Should always open MetaMask if wallet is connected</p>
              <p>⚡ Transaction may fail if listing doesn't exist, but MetaMask should still open</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
