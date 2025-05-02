// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';

export const config = createConfig({
    chains: [base], // Pass your required chains as an array
    transports: {
        [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL!),
        // For each of your required chains, add an entry to `transports` with
        // a key of the chain's `id` and a value of `http()`
    },
});