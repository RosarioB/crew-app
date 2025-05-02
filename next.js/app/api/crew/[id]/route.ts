import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CrewModel } from "@/models/Crew";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const crew = await CrewModel.findById(params.id);
    
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
    console.error('Error in GET /api/crew/[id]:', error);
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