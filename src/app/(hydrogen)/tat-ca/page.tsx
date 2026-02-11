import { metaObject } from '@/config/site.config';
import { getApprovedDocuments } from '@/lib/supabase';
import DocumentListClient from '@/app/shared/document-list-client';

export const metadata = {
  ...metaObject('Tất cả tài liệu'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TatCaPage() {
  // Fetch all approved documents
  const documents = await getApprovedDocuments();

  // Log the fetched documents for debugging
  console.log('Fetched documents:', documents);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tất cả tài liệu</h1>
      {documents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Chưa có tài liệu nào được chia sẻ.
        </p>
      ) : (
        <DocumentListClient documents={documents} showMajor />
      )}
    </div>
  );
}
