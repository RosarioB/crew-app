export interface CreateCoinData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  uri: string;
  owner: string;
  payoutRecipient: string;
  platformReferrer: string;
  currency?: string;
  pool?: string;
  version?: string;
  zoraCoinUrl: string;
  address: string;
  txHash: string;
}

export async function saveCoin(coinData: CreateCoinData) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append("name", coinData.name);
    formData.append("symbol", coinData.symbol);
    formData.append("description", coinData.description);
    if (coinData.image) {
      formData.append("image", coinData.image);
    }
    formData.append("uri", coinData.uri);
    formData.append("owner", coinData.owner);
    formData.append("payoutRecipient", coinData.payoutRecipient);
    formData.append("platformReferrer", coinData.platformReferrer);
    if (coinData.currency) formData.append("currency", coinData.currency);
    if (coinData.pool) formData.append("pool", coinData.pool);
    if (coinData.version) formData.append("version", coinData.version);
    formData.append("zoraCoinUrl", coinData.zoraCoinUrl);
    formData.append("address", coinData.address);
    formData.append("txHash", coinData.txHash);

    // Log FormData contents
    console.log("Coin Name:", coinData.name);
    console.log("Symbol:", coinData.symbol);
    console.log("Description:", coinData.description);
    console.log("URI:", coinData.uri);
    console.log("Owner:", coinData.owner);
    console.log("Payout Recipient:", coinData.payoutRecipient);
    console.log("Platform Referrer:", coinData.platformReferrer);
    console.log("Address:", coinData.address);
    console.log("Transaction Hash:", coinData.txHash);
    console.log("Image URL:", coinData.image);

    // Save to API
    const response = await fetch("/api/coin", {
      method: "POST",
      body: formData,
    });

    if(response.ok) {
      console.log(`Coin ${coinData.name} created successfully at ${coinData.address}`);
    } else {
      console.error("Failed to create the coin");
    }

    return response;
  } catch (error) {
    console.error("Error creating coin:", error);
    throw error;
  }
} 