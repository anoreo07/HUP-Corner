import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/utils/rate-limiter';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Endpoint to download and merge chunked files from Telegram
 * GET /api/telegram/merge-chunks?chunks=file_id1,file_id2,file_id3&fileName=original.pdf
 * 
 * This downloads all chunks sequentially and returns merged file
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chunksParam = searchParams.get('chunks');
    const fileName = searchParams.get('fileName') || 'file';

    if (!chunksParam) {
      return NextResponse.json({ error: 'No chunks provided' }, { status: 400 });
    }

    // Parse chunks
    const chunks: string[] = [];
    try {
      const parsed = JSON.parse(chunksParam);
      if (Array.isArray(parsed)) {
        chunks.push(...parsed);
      } else {
        chunks.push(...chunksParam.split(','));
      }
    } catch {
      chunks.push(...chunksParam.split(','));
    }

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Invalid chunks format' }, { status: 400 });
    }

    // Download and merge all chunks
    const buffers: Uint8Array[] = [];

    for (const fileId of chunks) {
      try {
        // Get file info from Telegram
        const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
        const infoResponse = await fetch(infoUrl);
        const infoData = await infoResponse.json();

        if (!infoData.ok || !infoData.result?.file_path) {
          throw new Error(`Cannot get file info for ${fileId}`);
        }

        // Download file from Telegram
        const filePath = infoData.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
        const fileResponse = await fetch(downloadUrl);

        if (!fileResponse.ok) {
          throw new Error(`Failed to download chunk: ${fileResponse.statusText}`);
        }

        const buffer = await fileResponse.arrayBuffer();
        buffers.push(new Uint8Array(buffer));
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to merge chunks: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Merge all buffers
    const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;

    for (const buffer of buffers) {
      merged.set(buffer, offset);
      offset += buffer.length;
    }

    // Return merged file
    return new NextResponse(merged as any, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': merged.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Merge failed' },
      { status: 500 }
    );
  }
}
