import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

export const publicClientMainnet = createPublicClient({
    chain: mainnet,
    transport: http(),
});

export async function getEthereumAddress(
    address: string,
) {
    let ethereumAddress: string;
    if (address.endsWith(".eth")) {
        const ensAddress = await publicClientMainnet
            .getEnsAddress({
                name: normalize(address),
            });
        ethereumAddress = ensAddress as string;
    } else {
        ethereumAddress = address;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(ethereumAddress)) {
        throw new Error(
            `Invalid address: ${ethereumAddress}`
        );
    }
    return ethereumAddress;
}

export const getEnsName = async (address: string) => {
    const ensName = await publicClientMainnet.getEnsName({
        address: address as `0x${string}`,
    });

    if (!ensName) {
        return address;
    }
    return ensName;
};

export const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}....${address.slice(-4)}`;
};