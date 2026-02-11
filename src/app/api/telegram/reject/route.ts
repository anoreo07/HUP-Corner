import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deleteMessageFromTelegram, parseTelegramFilePath } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // 1. Get document to find Telegram message_id
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // 2. Delete message from Telegram channel if it's stored there
    if (doc.storage_provider === 'telegram' && doc.file_path) {
      const { messageId } = parseTelegramFilePath(doc.file_path);
      if (messageId) {
        await deleteMessageFromTelegram(messageId);
      }
    }

    // 3. Delete document record from Supabase
    const { error: deleteError } = await supabase
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
