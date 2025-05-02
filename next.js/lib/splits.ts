import { SplitsClient } from '@0xsplits/splits-sdk';
import { base } from 'viem/chains';
import { publicClient, walletClient } from './viem';
import { Recipient } from '@/models/Crew';

if (!process.env.NEXT_PUBLIC_SPLITS_API_KEY) {
    throw new Error('Invalid/Missing environment variable: "SPLITS_API_KEY"');
}

const splitsClient = new SplitsClient({
    chainId: base.id,
    publicClient,
    walletClient,
    includeEnsNames: false,
    apiConfig: {
        apiKey: process.env.NEXT_PUBLIC_SPLITS_API_KEY,
    },
}).splitV1


export async function createSplitContract(recipients: Recipient[], distributorFeePercent: number, controller: string) {
    const args = {
        recipients: [
            ...recipients.map(recipient => ({
                address: recipient.address,
                percentAllocation: recipient.percentage
            }))
        ],
        distributorFeePercent,
        controller,
    }

    const response = await splitsClient.createSplit(args);
    console.log("Split contract created at:", response.splitAddress);
    return response;
}