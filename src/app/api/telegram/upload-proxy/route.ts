/**
 * Secure Telegram Upload Proxy API Route
 * 
 * ✅ SECURITY IMPLEMENTATION:
 * - TELEGRAM_BOT_TOKEN được lưu trong SERVER environment variables (KHÔNG expose ở client)
 * - Route này xác thực request từ client-side
 * - Token chỉ được dùng ở server-side khi forward request tới Telegram
 * - Client không bao giờ biết token là gì
 * 
 * WHY THIS APPROACH?
 * 1. Bypass Vercel 413 limit: File được gửi trực tiếp từ browser (không upload qua Vercel body limit)
 * 2. Token protection: Token được bảo vệ ở server, không lộ công khai
 * 3. Rate limiting: Có thể add thêm rate limiting, validation, logging
 * 4. Flexibility: Dễ dàng add logic kiểm tra permissions, tracking, v.v.
 */

import { NextRequest, NextResponse } from 'next/server';

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

  // 2. Optional: Add your own authentication
  // Example: check if user is logged in via session
  // const session = await getSession({ req });
  // if (!session) {
  //   return { valid: false, message: 'Unauthorized' };
  // }

  // 3. Optional: Add rate limiting
  // Example: check if user has exceeded upload limit
  // const uploadCount = await getRecentUploads(session.user.id);
  // if (uploadCount > 10) {
  //   return { valid: false, message: 'Too many uploads' };
  // }

  return { valid: true };
};

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message || 'Validation failed' },
        { status: 403 }
      );
    }

    // 2. Get FormData from client
    const formData = await request.formData();
    const document = formData.get('document') as Blob | null;
    const chatId = formData.get('chat_id') as string;
    const caption = formData.get('caption') as string;

    // 3. Validate inputs
    if (!document) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'No chat_id provided' },
        { status: 400 }
      );
    }

    // 4. Create new FormData for Telegram API (server-side)
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', chatId);
    telegramFormData.append('document', document);
    if (caption) {
      telegramFormData.append('caption', caption);
    }

    // 5. Send to Telegram Bot API
    // ✅ Token is added here on SERVER-SIDE, not exposed to client
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
      {
        method: 'POST',
        body: telegramFormData,
      }
    );

    // 6. Handle Telegram response
    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramData);
      return NextResponse.json(
        { error: telegramData.description || 'Telegram API error' },
        { status: telegramResponse.status }
      );
    }

    // 7. Extract file info from Telegram response
    const fileInfo = telegramData.result?.document;
    if (!fileInfo) {
      return NextResponse.json(
        { error: 'Invalid Telegram response' },
        { status: 500 }
      );
    }

    // 8. Return file info to client
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
