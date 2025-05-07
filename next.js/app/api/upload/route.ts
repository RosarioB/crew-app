import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { logger } from "@/lib/logger";
if(!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || !process.env.NEXT_PUBLIC_CLOUDINARY_SECRET || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  throw new Error('Cloudinary credentials are not set');
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    
    const result: UploadApiResponse | undefined = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
    });
    logger.info(`Uploaded image to Cloudinary at URL: ${result?.secure_url}`);
    return NextResponse.json({ url: result?.secure_url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 