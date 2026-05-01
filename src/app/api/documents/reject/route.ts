import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteMessageFromTelegram, parseTelegramFilePath } from '@/lib/telegram';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, admin_note } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Get document to check storage provider and file path
    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // 2. Delete from Telegram if needed
    if (doc.storage_provider === 'telegram' && doc.file_path) {
      const { chunks } = parseTelegramFilePath(doc.file_path);
      for (const chunk of chunks) {
        if (chunk.messageId) {
          await deleteMessageFromTelegram(chunk.messageId);
        }
      }
    }

    // 3. Update status or delete record
    // Usually "Reject" means we want to keep the record but marked as rejected,
    // but the telegram logic was deleting it. I'll stick to updating status to keep history.
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'REJECTED',
        admin_note: admin_note || null,
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document rejected and cleaned up',
      document: data
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}