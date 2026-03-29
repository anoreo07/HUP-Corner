import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/utils/rate-limiter';

// ⚠️ MUST be in .env.local (NEVER .env.local.example)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

// Optional: Add rate limiting, authentication, etc.
const validateRequest = (req: NextRequest): { valid: boolean; message?: string } => {
  // 1. Check if token is configured
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    return {
      valid: false,
      message: 'Server not configured for Telegram uploads',
    };
  }

  return { valid: true };
};

export async function POST(request: NextRequest) {
  try {
    // 1. Check rate limit
    const clientIp = getClientIp(
      Object.fromEntries(request.headers.entries())
    );
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMITS.UPLOAD);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 2. Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message || 'Validation failed' },
        { status: 403 }
      );
    }

    // 3. Get FormData from client
    const formData = await request.formData();
    const document = formData.get('document') as Blob | null;
    const chatId = formData.get('chat_id') as string;
    const caption = formData.get('caption') as string;

    // 4. Validate inputs
    if (!document) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'No chat_id provided' },
        { status: 400 }
      );
    }

    // 5. Create new FormData for Telegram API (server-side)
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', chatId);
    telegramFormData.append('document', document);
    if (caption) {
      telegramFormData.append('caption', caption);
    }

    // 6. Send to Telegram Bot API
    // ✅ Token is added here on SERVER-SIDE, not exposed to client
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
      {
        method: 'POST',
        body: telegramFormData,
      }
    );

    // 7. Handle Telegram response
    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramData);
      return NextResponse.json(
        { error: telegramData.description || 'Telegram API error' },
        { status: telegramResponse.status }
      );
    }

    // 8. Extract file info from Telegram response
    const fileInfo = telegramData.result?.document;
    if (!fileInfo) {
      return NextResponse.json(
        { error: 'Invalid Telegram response' },
        { status: 500 }
      );
    }

    // 9. Return file info to client
    // ⚠️ Never return the bot token
    return NextResponse.json({
      success: true,
      file_id: fileInfo.file_id,
      file_unique_id: fileInfo.file_unique_id,
      file_name: fileInfo.file_name,
      file_size: fileInfo.file_size,
      message_id: telegramData.result.message_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
