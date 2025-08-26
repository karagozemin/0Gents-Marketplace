// Debug API route to check environment variables
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    PRIVATE_KEY: !!process.env.PRIVATE_KEY,
    PRIVATE_KEY_LENGTH: process.env.PRIVATE_KEY?.length || 0,
    NEXT_PUBLIC_0G_PRIVATE_KEY: !!process.env.NEXT_PUBLIC_0G_PRIVATE_KEY,
    NEXT_PUBLIC_0G_PRIVATE_KEY_LENGTH: process.env.NEXT_PUBLIC_0G_PRIVATE_KEY?.length || 0,
    NEXT_PUBLIC_0G_RPC_URL: process.env.NEXT_PUBLIC_0G_RPC_URL,
    NEXT_PUBLIC_0G_INDEXER_URL: process.env.NEXT_PUBLIC_0G_INDEXER_URL,
    NODE_ENV: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('0G') || key.includes('PRIVATE')).sort()
  });
}
