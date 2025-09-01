// API route for creating marketplace listings
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '@/lib/contracts';

export interface MarketplaceListing {
  id: string;
  listingId: number; // Real marketplace listing ID
  agentContractAddress: string;
  tokenId: string;
  seller: string;
  price: string;
  priceWei: string;
  name: string;
  description: string;
  image: string;
  category: string;
  active: boolean;
  createdAt: string;
  txHash: string;
  blockNumber?: number;
}

// In-memory storage for demo (production would use database)
const LISTINGS_STORAGE_KEY = 'marketplace_listings';
let marketplaceListings: MarketplaceListing[] = [];

// Load from localStorage if available (server-side simulation)
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (stored) {
      marketplaceListings = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load marketplace listings:', error);
  }
}

function saveListings() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(marketplaceListings));
    } catch (error) {
      console.error('Failed to save marketplace listings:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const listingData = await request.json();
    
    console.log('📋 Creating marketplace listing:', listingData);
    
    // Validate required fields
    if (!listingData.agentContractAddress || !listingData.seller || !listingData.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get real listing ID from blockchain
    let realListingId = 0;
    try {
      // Connect to 0G Network
      const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
      const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS!, MARKETPLACE_ABI, provider);
      
      // Get next listing ID (this will be the ID of our listing)
      const nextListingId = await marketplaceContract.nextListingId();
      realListingId = Number(nextListingId); // ✅ FIX: nextListingId is the ID that will be assigned to our listing
      
      console.log(`🔍 Real marketplace listing ID: ${realListingId}`);
      
    } catch (blockchainError) {
      console.error('❌ Failed to get real listing ID:', blockchainError);
      // Use fallback ID
      realListingId = marketplaceListings.length + 1;
    }

    // Create listing object
    const newListing: MarketplaceListing = {
      id: `listing-${Date.now()}`,
      listingId: realListingId,
      agentContractAddress: listingData.agentContractAddress,
      tokenId: listingData.tokenId || "1",
      seller: listingData.seller,
      price: listingData.price,
      priceWei: ethers.parseEther(listingData.price).toString(),
      name: listingData.name || "AI Agent",
      description: listingData.description || "AI Agent NFT",
      image: listingData.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
      category: listingData.category || "General",
      active: true,
      createdAt: new Date().toISOString(),
      txHash: listingData.txHash || "",
      blockNumber: listingData.blockNumber
    };

    // Add to storage
    marketplaceListings.push(newListing);
    saveListings();

    console.log(`✅ Marketplace listing created: ID ${realListingId}`);

    return NextResponse.json({
      success: true,
      listing: newListing,
      listingId: realListingId
    });

  } catch (error) {
    console.error('❌ Failed to create marketplace listing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return all active listings
    const activeListings = marketplaceListings.filter(listing => listing.active);
    
    return NextResponse.json({
      success: true,
      listings: activeListings,
      total: activeListings.length
    });

  } catch (error) {
    console.error('❌ Failed to get marketplace listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
