"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { defineChain } from "viem";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// 0G Galileo Testnet (id: 16602) - Official Network Configuration
const ogRpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
const ogGalileo = defineChain({
  id: 16602,
  name: "0G-Testnet-Galileo",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: [ogRpcUrl] },
    public: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

// 0G Aristotle Mainnet - Official Configuration
const ogMainnet = defineChain({
  id: 16661, // 0G Mainnet Official Chain ID
  name: "0G-Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc.0g.ai"] },
    public: { http: ["https://evmrpc.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan.0g.ai" },
  },
  testnet: false,
});

// Use testnet for now, but ready to switch to mainnet
const isMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true";
const activeChain = isMainnet ? ogMainnet : ogGalileo;

const wagmiConfig = getDefaultConfig({
  appName: "AgentX",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo-project-id",
  chains: [activeChain] as const,
  transports: {
    [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
  },
});

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} initialChain={activeChain}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


