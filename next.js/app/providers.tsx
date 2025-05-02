"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { PrivyProvider } from "@privy-io/react-auth";
import {WagmiProvider} from '@privy-io/wagmi';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { config } from "@/lib/wagmi";

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
       config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
      }} 
    >
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
        config={{
          loginMethods: ["wallet","farcaster", "email"],
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          defaultChain: base,
          supportedChains: [base],
          appearance: {
            walletList: ["metamask", "coinbase_wallet"],
            walletChainType: "ethereum-only",
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
        {props.children}
        </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </MiniKitProvider>
  );
}
