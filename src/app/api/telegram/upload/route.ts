import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToTelegram } from '@/lib/telegram';

export const runtime = 'nodejs';

// Allow up to 50MB
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (50MB max for Telegram bots)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Telegram channel
    const result = await uploadFileToTelegram(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      caption || undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        file_id: `${result.file_id}|${result.message_id}`,
        file_unique_id: result.file_unique_id,
        file_name: result.file_name,
        file_size: result.file_size,
        mime_type: result.mime_type,
      },
    });
  } catch (error: any) {
    console.error('Telegram upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
