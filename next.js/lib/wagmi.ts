import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';

export const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL!),
    },
});