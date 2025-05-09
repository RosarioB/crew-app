import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CoinModel } from "@/models/coin";
import { logger } from "@/lib/logger";

// GET all coins
export async function GET() {
  try {
    await connectToDatabase();
    const coins = await CoinModel.find().sort({ createdAt: -1 });
    logger.info(`Coins fetched: ${coins?.length}`);
    return NextResponse.json(coins);
  } catch (error) {
    logger.error("Error fetching coins:", error as Error);
    return NextResponse.json({ error: "Failed to fetch coins" }, { status: 500 });
  }
}

// POST new coin
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    let name: string;
    let symbol: string;
    let description: string;
    let image: string;
    let uri: string;
    let owner: string;
    let payoutRecipient: string;
    let platformReferrer: string;
    let currency: string;
    let pool: string;
    let version: string;
    let zoraCoinUrl: string;
    let address: string;
    let txHash: string;

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      symbol = formData.get('symbol') as string;
      description = formData.get('description') as string;
      image = formData.get('image') as string;
      uri = formData.get('uri') as string;
      owner = formData.get('owner') as string;
      payoutRecipient = formData.get('payoutRecipient') as string;
      platformReferrer = formData.get('platformReferrer') as string;
      currency = formData.get('currency') as string;
      pool = formData.get('pool') as string;
      version = formData.get('version') as string;
      zoraCoinUrl = formData.get('zoraCoinUrl') as string;
      address = formData.get('address') as string;
      txHash = formData.get('txHash') as string;
    } else {
      const body = await request.json();
      name = body.name;
      symbol = body.symbol;
      description = body.description;
      image = body.image;
      uri = body.uri;
      owner = body.owner;
      payoutRecipient = body.payoutRecipient;
      platformReferrer = body.platformReferrer;
      currency = body.currency;
      pool = body.pool;
      version = body.version;
      zoraCoinUrl = body.zoraCoinUrl;
      address = body.address;
      txHash = body.txHash;
    }

    // Create crew object
    const coin = new CoinModel({
      name,
      symbol,
      description,
      image,
      uri,
      owner,
      payoutRecipient,
      platformReferrer,
      currency,
      pool,
      version,
      zoraCoinUrl,
      address,
      txHash,
    });

    // Save to MongoDB
    await coin.save();
    logger.info(`Coin created: ${coin.name} with address ${coin.address}`);
    return NextResponse.json(coin, { status: 201 });
  } catch (error) {
    logger.error("Error creating coin:", error as Error);
    return NextResponse.json({ error: "Failed to create coin" }, { status: 500 });
  }
} 