import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CoinModel } from "@/models/coin";

// GET all coins for a specific owner
export async function GET(
  request: Request,
  { params }: { params: { owner: string } }
) {
  try {
    await connectToDatabase();
    const coins = await CoinModel.find({ owner: params.owner }).sort({ createdAt: -1 });

    return NextResponse.json(coins);
  } catch (error) {
    console.error("Error fetching coins for owner:", error);
    return NextResponse.json(
      { error: "Failed to fetch coins for owner" },
      { status: 500 }
    );
  }
} 