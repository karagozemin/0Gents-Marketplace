import type { ChatMessage } from "./compute";
import { ZERO_G_STORAGE_FLOW } from "./contracts";

export type ChatLog = {
  agentId: string;
  createdAt: string;
  messages: ChatMessage[];
};

export type AgentMetadata = {
  name: string;
  description: string;
  image?: string;
  category: string;
  creator: string;
  price: string;
  capabilities: string[];
  model?: {
    type: string;
    version: string;
    parameters?: Record<string, any>;
  };
  skills: string[];
  created: string;
  updated: string;
};

export type StorageResult = {
  success: boolean;
  hash?: string;
  uri?: string;
  error?: string;
};

/**
 * Upload agent metadata to 0G Storage
 * Returns storage URI that can be used in INFT
 */
export async function uploadAgentMetadata(metadata: AgentMetadata): Promise<StorageResult> {
  try {
    // For now, we'll simulate 0G Storage upload
    // In production, this would use 0G Storage SDK
    console.log("Uploading to 0G Storage:", metadata);
    
    // Generate a mock storage hash
    const hash = `0g_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uri = `0g://storage/${hash}`;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage for demo purposes (replace with real 0G Storage)
    localStorage.setItem(`0g_metadata_${hash}`, JSON.stringify(metadata));
    
    return {
      success: true,
      hash,
      uri
    };
  } catch (error) {
    console.error("Failed to upload to 0G Storage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    };
  }
}

/**
 * Retrieve agent metadata from 0G Storage
 */
export async function getAgentMetadata(uri: string): Promise<AgentMetadata | null> {
  try {
    // Extract hash from URI
    const hash = uri.replace('0g://storage/', '');
    
    // For demo, retrieve from localStorage (replace with real 0G Storage)
    const stored = localStorage.getItem(`0g_metadata_${hash}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If not found locally, return null
    return null;
  } catch (error) {
    console.error("Failed to retrieve from 0G Storage:", error);
    return null;
  }
}

/**
 * Upload file to 0G Storage (for images, models, etc.)
 */
export async function uploadFile(file: File): Promise<StorageResult> {
  try {
    console.log("Uploading file to 0G Storage:", file.name);
    
    // Generate mock hash for file
    const hash = `0g_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uri = `0g://storage/files/${hash}`;
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      hash,
      uri
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "File upload failed"
    };
  }
}

export async function persistChatLog(log: ChatLog): Promise<void> {
  try {
    console.log("Persisting chat log to 0G Storage:", log.agentId);
    
    // Create storage entry for chat log
    const logData = {
      ...log,
      type: "chat_log",
      timestamp: new Date().toISOString()
    };
    
    // Upload to 0G Storage
    const result = await uploadAgentMetadata(logData as any);
    
    if (result.success) {
      console.log("Chat log persisted:", result.uri);
    } else {
      console.error("Failed to persist chat log:", result.error);
    }
  } catch (error) {
    console.error("Error persisting chat log:", error);
  }
}

/**
 * Get storage statistics and info
 */
export async function getStorageInfo() {
  return {
    network: "0G Galileo Testnet",
    flowContract: ZERO_G_STORAGE_FLOW,
    status: "connected",
    totalUploads: localStorage.length || 0
  };
}


