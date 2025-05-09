import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { CrewModel, Recipient } from "@/models/crew";
import { logger } from "@/lib/logger";

// GET /api/crew - Get all crews
export async function GET() {
  try {
    await connectToDatabase();
    const crews = await CrewModel.find().sort({ createdAt: -1 });
    logger.info(`Crews fetched: ${crews?.length}`);
    return NextResponse.json(crews);
  } catch (error) {
    logger.error('Error in GET /api/crew:', error as Error);
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

    let name: string;
    let description: string;
    let members: Recipient[];
    let splitAddress: string;
    let image: string | null = null;

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      members = JSON.parse(formData.get('members') as string);
      splitAddress = formData.get('splitAddress') as string;
      image = formData.get('image') as string | null;
    } else {
      const body = await request.json();
      name = body.name;
      description = body.description;
      members = body.members;
      splitAddress = body.splitAddress;
      image = body.image;
    }

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
    logger.info(`Crew created: ${crew?.name} with splitAddress ${crew?.splitAddress}`);

    return NextResponse.json(crew, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/crew:', error as Error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create crew" },
      { status: 500 }
    );
  }
}
