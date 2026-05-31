import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/utils/rate-limiter';
import { getTelegramBotToken, getConfiguredBotIndexes } from '@/lib/telegram';

// Validation of active bots
const validateRequest = (): { valid: boolean; message?: string } => {
  const activeBots = getConfiguredBotIndexes();
  if (activeBots.length === 0) {
    return {
      valid: false,
      message: 'Server not configured for Telegram uploads',
    };
  }
  return { valid: true };
};

/**
 * GET /api/telegram/upload-proxy
 * Returns a randomly picked active bot index and the list of active bot indexes.
 * This is used by the client to keep chunk uploads pinned to the same bot index.
 */
export async function GET() {
  try {
    const validation = validateRequest();
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 403 });
    }

    const activeBots = getConfiguredBotIndexes();
    const randomIndex = Math.floor(Math.random() * activeBots.length);
    const chosenBotIndex = activeBots[randomIndex];

    return NextResponse.json({
      success: true,
      bot_index: chosenBotIndex,
      available_bots: activeBots,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve active bots' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/telegram/upload-proxy
 * Proxies upload calls to Telegram Bot API.
 */
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
    const validation = validateRequest();
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
    const clientBotIndexStr = formData.get('bot_index') as string | null;

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

    // 5. Select bot token
    const activeBots = getConfiguredBotIndexes();
    let botIndex = 1;
    if (clientBotIndexStr) {
      const idx = parseInt(clientBotIndexStr, 10);
      if (activeBots.includes(idx)) {
        botIndex = idx;
      } else {
        botIndex = activeBots[0];
      }
    } else {
      // Pick random bot if client did not supply one
      const randomIndex = Math.floor(Math.random() * activeBots.length);
      botIndex = activeBots[randomIndex];
    }

    const botToken = getTelegramBotToken(botIndex);

    // 6. Create new FormData for Telegram API (server-side)
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', chatId);
    telegramFormData.append('document', document);
    if (caption) {
      telegramFormData.append('caption', caption);
    }

    // 7. Send to Telegram Bot API
    // Token is safely resolved on the server side
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: 'POST',
        body: telegramFormData,
      }
    );

    // 8. Handle Telegram response
    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      return NextResponse.json(
        { error: telegramData.description || 'Telegram API error' },
        { status: telegramResponse.status }
      );
    }

    // 9. Extract file info from Telegram response
    const fileInfo = telegramData.result?.document;
    if (!fileInfo) {
      return NextResponse.json(
        { error: 'Invalid Telegram response' },
        { status: 500 }
      );
    }

    // 10. Return file info and the used bot_index to client
    return NextResponse.json({
      success: true,
      file_id: fileInfo.file_id,
      file_unique_id: fileInfo.file_unique_id,
      file_name: fileInfo.file_name,
      file_size: fileInfo.file_size,
      message_id: telegramData.result.message_id,
      telegram_bot_index: botIndex,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
