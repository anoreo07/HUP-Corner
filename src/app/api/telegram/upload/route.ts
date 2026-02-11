import { NextRequest, NextResponse } from 'next/server';
import { uploadFileChunked } from '@/lib/telegram';

export const runtime = 'nodejs';

// Allow up to 50MB
export const maxDuration = 120;

// Note: Next.js Route files must not export a `middleware` function.
// The project previously attempted to run the Express-style `rateLimiter`
// here which is not a valid Route export. Implement a small in-route
// rate limiter to preserve similar behavior without exporting `middleware`.

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100;
const _rateMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const entry = _rateMap.get(ip);
  if (!entry || now > entry.reset) {
    _rateMap.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.reset - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request);
    if (rl) return rl;
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

    // Upload to Telegram — auto-chunks if > 19MB
    const result = await uploadFileChunked(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      caption || undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        file_id: result.file_path,
        file_unique_id: result.file_path,
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
