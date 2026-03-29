import { NextRequest, NextResponse } from 'next/server';
import { downloadFileAuto, TelegramFileTooLargeError } from '@/lib/telegram';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const fileName = searchParams.get('fileName') || 'download';

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Download file — auto-reassembles chunks if needed
    const { buffer } = await downloadFileAuto(fileId);

    // Return file as download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Length', buffer.length.toString());

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error instanceof TelegramFileTooLargeError) {
      return NextResponse.json(
        { error: error.message, code: 'TELEGRAM_FILE_TOO_LARGE' },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    );
  }
}
