import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // File đã được lưu trên Telegram từ lúc upload
    // Chỉ cần cập nhật status thành APPROVED
    const { data, error } = await supabase
      .from('documents')
      .update({ status: 'APPROVED' } as any)
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Document approved',
      document: data,
    });
  } catch (error: any) {
    console.error('Approve error:', error);
    return NextResponse.json(
      { error: error.message || 'Approval failed' },
      { status: 500 }
    );
  }
}
