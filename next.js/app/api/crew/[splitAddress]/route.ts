import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CrewModel } from "@/models/crew";

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

    return NextResponse.json(crew, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error in GET /api/crew/[splitAddress]:', error);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete crew" },
      { status: 500 }
    );
  }
}