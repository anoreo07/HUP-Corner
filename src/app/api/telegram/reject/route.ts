import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteMessageFromTelegram, parseTelegramFilePath } from '@/lib/telegram';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // 1. Get document to find Telegram message_id
    const supabaseAdmin = getSupabaseAdmin();

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // 2. Delete message from Telegram channel if it's stored there
    if (doc.storage_provider === 'telegram' && doc.file_path) {
      const { messageId } = parseTelegramFilePath(doc.file_path);
      if (messageId) {
        await deleteMessageFromTelegram(messageId);
      }
    }

    // 3. Delete document record from Supabase
    const { error: deleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Document rejected and deleted',
    });
  } catch (error: any) {
    console.error('Reject error:', error);
    return NextResponse.json(
      { error: error.message || 'Reject failed' },
      { status: 500 }
    );
  }
}
