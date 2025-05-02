import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CrewModel } from "@/models/Crew";

// GET /api/crew - Get all crews
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const crews = await CrewModel.find().sort({ createdAt: -1 });
    return NextResponse.json(crews);
  } catch (error) {
    console.error('Error in GET /api/crew:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch crews" },
      { status: 500 }
    );
  }
}

// GET /api/crew/[id] - Get a specific crew by id
export async function GET_ID(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const crew = await CrewModel.findById(params.id);
    
    if (!crew) {
      return NextResponse.json(
        { error: "Crew not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(crew);
  } catch (error) {
    console.error('Error in GET /api/crew/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch crew" },
      { status: 500 }
    );
  }
}

// POST /api/crew - Create a new crew
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, description, image, members, splitAddress } = body;

    // Create crew object
    const crew = new CrewModel({
      name,
      description,
      image,
      members,
      splitAddress,
    });

    // Save to MongoDB
    await crew.save();

    return NextResponse.json(crew, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/crew:', error);
    if (error instanceof Error && error.message === 'Member percentages must sum to 100') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create crew" },
      { status: 500 }
    );
  }
}

// DELETE /api/crew - Delete a crew
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Crew ID is required" },
        { status: 400 }
      );
    }

    const crew = await CrewModel.findByIdAndDelete(id);

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