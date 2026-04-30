import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { submitSiteReview } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headerList = headers();
    
    // Lấy IP của người dùng (X-Forwarded-For hoặc remoteAddress)
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const result = await submitSiteReview({
      ...body,
      ip_address: ip,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Feedback Error:', error);
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra khi gửi đánh giá' },
      { status: 400 }
    );
  }
}
