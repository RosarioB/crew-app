import { SplitsClient } from '@0xsplits/splits-sdk';
import { base, baseSepolia } from 'viem/chains';
import { account, publicClient, walletClient } from './viem';
import { Recipient } from '@/models/crew';
import { zeroAddress, formatEther } from 'viem';


if (!process.env.NEXT_PUBLIC_SPLITS_API_KEY) {
    throw new Error('Invalid/Missing environment variable: "SPLITS_API_KEY"');
}

const splitsClient = new SplitsClient({
    chainId: baseSepolia.id, // TESTING
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


export async function getSplitBalance(address: string) {
    const args = {
        splitAddress: address,
        token: zeroAddress, // ETH
    }

    const response = await splitsClient.getSplitBalance(args);
    const balance = response.balance;
    const formattedBalance = formatEther(balance);
    return formattedBalance;
}

export async function distributeAndWithdrawForAll(address: string) {
    const args = {
        splitAddress: address,
        tokens: [
            zeroAddress, // ETH
        ],
        distributorAddress: account.address,
    }
    const response = await splitsClient.batchDistributeAndWithdrawForAll(args)
    console.log("Response batchDistributeAndWithdrawForAll:", response);
    return response;
}