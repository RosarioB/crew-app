import { createCoin, CreateCoinArgs } from "@zoralabs/coins-sdk";
import { walletClient, publicClient } from "./viem";

export async function createCoinWithRetry(
    coinParams: CreateCoinArgs,
    jsonHash: string
){

    try {
        const result = await createCoin(coinParams, walletClient, publicClient);
        console.log(
            `Successfully minted Zora Coin of name ${coinParams.name} and and address ${result.address}.`
        );
        return result;
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("Metadata fetch failed")) {
            console.error("Metadata fetch failed. Retrying with HTTPS URI");
            const httpsURI = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${jsonHash}`;
            
            // Update the URI in the existing coinParams object
            coinParams.uri = httpsURI;
            console.info(`Updated coin params: ${JSON.stringify(coinParams)}`);
            const result = await createCoin(coinParams, walletClient, publicClient);
            console.log(
                `Successfully minted Zora Coin of name ${coinParams.name} and and address ${result.address}.`
            );
            return result;
        } else {
            throw error;
        }
    }
} 