import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from 'viem/accounts';
import { base } from "viem/chains";
import { logger } from "./logger";

if (!process.env.NEXT_PUBLIC_PRIVATE_KEY) {
    throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_PRIVATE_KEY"');
}
if (!process.env.NEXT_PUBLIC_RPC_URL) {
    throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_RPC_URL"');
}

export const account = privateKeyToAccount(process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`);
logger.info(`My account is ${account.address}`);

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export const walletClient = createWalletClient({
  account: account,
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});