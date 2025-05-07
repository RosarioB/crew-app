import { PinataSDK } from "pinata";

if(!process.env.NEXT_PUBLIC_PINATA_JWT || !process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL) {
    throw new Error("NEXT_PUBLIC_PINATA_JWT and NEXT_PUBLIC_PINATA_GATEWAY_URL must be set");
}

export const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL,
});

export const uploadImageToPinata = async (file: File) => {
    const { cid: imageHash } = await pinata.upload.public.file(file);
    console.log(`Successfully uploaded image to Pinata with hash: ${imageHash}`);
    return imageHash;
};

export const uploadJsonToPinata = async (
    name: string,
    description: string,
    imageHash: string
) => {
    const jsonName = `${name
        .slice(0, 20)
        .replace(/\s/g, "_")}_${Date.now()}.json`;
    const { cid: jsonHash } = await pinata.upload.public.json(
        {
            name: name,
            description: description,
            image: `ipfs://${imageHash}`,
        },
        {
            metadata: {
                name: jsonName,
            },
        }
    );

    console.log(
        `Successfully uploaded JSON ${jsonName} to Pinata with hash: ${jsonHash}`
    );
    return jsonHash;
};
