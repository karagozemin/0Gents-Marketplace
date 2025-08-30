// API route for individual listing operations
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (production would use database)
const LISTINGS_STORAGE_KEY = 'marketplace_listings';

function getListings() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LISTINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load marketplace listings:', error);
      return [];
    }
  }
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;
    const listings = getListings();
    
    const listing = listings.find((l: any) => 
      l.listingId.toString() === listingId || l.id === listingId
    );
    
    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      listing
    });

  } catch (error) {
    console.error('❌ Failed to get listing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;
    let listings = getListings();
    
    const listingIndex = listings.findIndex((l: any) => 
      l.listingId.toString() === listingId || l.id === listingId
    );
    
    if (listingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Mark as inactive instead of deleting
    listings[listingIndex].active = false;
    
    // Save back
    if (typeof window !== 'undefined') {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    }

    return NextResponse.json({
      success: true,
      message: 'Listing deactivated'
    });

  } catch (error) {
    console.error('❌ Failed to deactivate listing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
