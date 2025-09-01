"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { defineChain } from "viem";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// 0G Galileo Testnet (id: 16601)
const ogRpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL;
const ogGalileo = defineChain({
  id: 16601,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: ogRpcUrl
    ? {
        default: { http: [ogRpcUrl] },
        public: { http: [ogRpcUrl] },
      }
    : {
        default: { http: [] },
        public: { http: [] },
      },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

const wagmiConfig = getDefaultConfig({
  appName: "AgentX",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo-project-id",
  chains: [ogGalileo] as const,
  transports: {
    [ogGalileo.id]: http("https://evmrpc-testnet.0g.ai"), // ZORLA AYNI RPC
  },
});

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} initialChain={ogGalileo}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


