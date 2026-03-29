import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const FEEDBACK_EMAIL = 'anoreo.dev@gmail.com';

// Telegram config (reuse existing setup)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';

async function sendTelegram(subject: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) return false;

  const text = [
    '*GÓP Ý MỚI*',
    '',
    `*Chủ đề:* ${subject}`,
    '',
    `*Nội dung:*`,
    message,
    '',
    `_Gửi lúc: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}_`,
  ].join('\n');

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function sendEmail(subject: string, message: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM_EMAIL;

  if (!host || !user || !pass) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    // Gmail requires FROM to match the authenticated user.
    // Use display name "HUP Corner" with the authenticated email.
    const fromAddress = `"HUP Corner" <${user}>`;

    await transporter.sendMail({
      from: fromAddress,
      replyTo: from || user,
      to: FEEDBACK_EMAIL,
      subject: `[HUP Corner Góp Ý] ${subject}`,
      text: message,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">📝 Góp Ý Mới từ HUP Corner</h2>
          <p><strong>Chủ đề:</strong> ${subject}</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">
            Gửi lúc: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            <br/>Đây là góp ý ẩn danh từ HUP Corner.
          </p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Nội dung góp ý không được để trống' },
        { status: 400 }
      );
    }

    const cleanSubject = (subject || 'Góp ý từ người dùng').slice(0, 200);
    const cleanMessage = message.trim().slice(0, 5000);

    // Try both channels - at least one must succeed
    const [telegramOk, emailOk] = await Promise.all([
      sendTelegram(cleanSubject, cleanMessage),
      sendEmail(cleanSubject, cleanMessage),
    ]);

    if (!telegramOk && !emailOk) {
      return NextResponse.json(
        { error: 'Không thể gửi góp ý. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
