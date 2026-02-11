import { NextRequest, NextResponse } from 'next/server';
import { downloadFileFromTelegram, parseTelegramFilePath } from '@/lib/telegram';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Serve file with correct Content-Type for inline preview (PDF, images).
 * For Office files (docx, pptx), the client uses Microsoft Office Online viewer.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const mimeType = searchParams.get('mimeType') || 'application/octet-stream';

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    const { fileId: actualFileId } = parseTelegramFilePath(fileId);
    const { buffer } = await downloadFileFromTelegram(actualFileId);

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', buffer.length.toString());
    // Inline display, not download
    headers.set('Content-Disposition', 'inline');
    // Cache for 1 hour
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error: any) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: error.message || 'Preview failed' },
      { status: 500 }
    );
  }
}
