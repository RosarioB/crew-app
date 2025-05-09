import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CoinModel } from "@/models/coin";
import { logger } from "@/lib/logger";

// GET coin by address
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    await connectToDatabase();
    const coin = await CoinModel.findOne({ address: params.address });

    if (!coin) {
      return NextResponse.json(
        { error: "Coin not found" },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return NextResponse.json(coin, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/coin/[address]:', error as Error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch coin" },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// DELETE coin by address
export async function DELETE(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    await connectToDatabase();
    const result = await CoinModel.deleteOne({ address: params.address });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coin deleted successfully" });
  } catch (error) {
    console.error("Error deleting coin:", error);
    return NextResponse.json({ error: "Failed to delete coin" }, { status: 500 });
  }
} 