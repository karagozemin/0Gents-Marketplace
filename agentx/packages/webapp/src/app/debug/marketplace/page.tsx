"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateListingExists, getNextListingId } from '@/lib/realMarketplace';
import { MARKETPLACE_ADDRESS } from '@/lib/contracts';

export default function MarketplaceDebugPage() {
  const [listingId, setListingId] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [nextId, setNextId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidateListing = async () => {
    if (!listingId) return;
    
    setIsLoading(true);
    try {
      const result = await validateListingExists(parseInt(listingId));
      setValidationResult(result);
      console.log("Validation result:", result);
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetNextId = async () => {
    setIsLoading(true);
    try {
      const id = await getNextListingId();
      setNextId(id);
      console.log("Next listing ID:", id);
    } catch (error) {
      console.error("Get next ID error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load next ID on mount
    handleGetNextId();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Marketplace Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marketplace Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Marketplace Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Contract Address</label>
                <p className="text-white font-mono text-sm break-all">{MARKETPLACE_ADDRESS}</p>
              </div>
              <div>
                <label className="text-gray-300 text-sm">Next Listing ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-white text-lg">{nextId !== null ? nextId : 'Loading...'}</p>
                  <Button onClick={handleGetNextId} disabled={isLoading} size="sm">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listing Validator */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Validate Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter listing ID"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button onClick={handleValidateListing} disabled={isLoading || !listingId}>
                  {isLoading ? 'Checking...' : 'Validate'}
                </Button>
              </div>
              
              {validationResult && (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <pre className="text-white text-sm overflow-x-auto">
                    {JSON.stringify(validationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Test Buttons */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Quick Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5].map(id => (
                <Button
                  key={id}
                  onClick={() => {
                    setListingId(id.toString());
                    setTimeout(() => handleValidateListing(), 100);
                  }}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Test ID {id}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Debug Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-2">
              <p>1. Check the "Next Listing ID" to see what ID will be assigned to new listings</p>
              <p>2. Test existing listing IDs to see if they exist on the blockchain</p>
              <p>3. If a listing shows exists=false, it means the buy transaction will fail</p>
              <p>4. Only listings with exists=true and active=true can be purchased</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
