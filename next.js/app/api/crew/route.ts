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

// POST /api/crew - Create a new crew
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const members = JSON.parse(formData.get('members') as string);
    const splitAddress = formData.get('splitAddress') as string;
    const image = formData.get('image') as File | null;

    // Create crew object
    const crew = new CrewModel({
      name,
      description,
      image: image ? {
        data: Buffer.from(await image.arrayBuffer()),
        contentType: image.type
      } : null,
      members,
      splitAddress,
    });

    // Save to MongoDB
    await crew.save();

    return NextResponse.json(crew, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/crew:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create crew" },
      { status: 500 }
    );
  }
}
 