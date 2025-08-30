// Marketplace listings management
// Server-side storage for cross-user visibility

export interface ListingData {
  agentContractAddress: string;
  tokenId: string;
  seller: string;
  price: string;
  name: string;
  description: string;
  image: string;
  category: string;
  txHash: string;
  blockNumber?: number;
}

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

/**
 * Save listing to server for cross-user visibility
 */
export async function saveListingToServer(listingData: ListingData): Promise<{
  success: boolean;
  listingId?: number;
  error?: string;
}> {
  try {
    console.log('🏪 Saving marketplace listing to server...');
    
    const response = await fetch('/api/listings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Marketplace listing saved with ID: ${result.listingId}`);
      return {
        success: true,
        listingId: result.listingId
      };
    } else {
      console.error('❌ Server rejected listing:', result.error);
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to save listing to server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Get all marketplace listings from server
 */
export async function getMarketplaceListings(): Promise<{
  success: boolean;
  listings?: MarketplaceListing[];
  error?: string;
}> {
  try {
    console.log('📋 Fetching marketplace listings from server...');
    
    const response = await fetch('/api/listings/create');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Fetched ${result.listings.length} marketplace listings`);
      return {
        success: true,
        listings: result.listings
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to fetch listings from server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Get specific listing by ID
 */
export async function getListingById(listingId: string | number): Promise<{
  success: boolean;
  listing?: MarketplaceListing;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/listings/${listingId}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        listing: result.listing
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to fetch listing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Deactivate listing after purchase
 */
export async function deactivateListing(listingId: string | number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/listings/${listingId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    return result;

  } catch (error) {
    console.error('❌ Failed to deactivate listing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}
