import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CrewModel } from "@/models/crew";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { splitAddress: string } }
) {
  try {
    await connectToDatabase();
    const crew = await CrewModel.findOne({ splitAddress: params.splitAddress });

    if (!crew) {
      return NextResponse.json(
        { error: "Crew not found" },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    logger.info(`Crew fetched: ${crew?.name}`);

    return NextResponse.json(crew, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/crew/[splitAddress]:', error as Error );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch crew" },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}


// DELETE /api/crew/[id] - Delete a crew
export async function DELETE(
    request: Request,
    { params }: { params: { splitAddress: string } }
) {
  try {
    await connectToDatabase();
    const crew = await CrewModel.findOneAndDelete({ splitAddress: params.splitAddress });

    if (!crew) {
      return NextResponse.json(
        { error: "Crew not found" },
        { status: 404 }
      );
    }
    logger.info(`Crew deleted: ${crew?.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete crew" },
      { status: 500 }
    );
  }
}