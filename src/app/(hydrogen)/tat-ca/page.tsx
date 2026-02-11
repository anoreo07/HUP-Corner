import { metaObject } from '@/config/site.config';
import { getApprovedDocuments, searchDocuments } from '@/lib/supabase';
import DocumentListClient from '@/app/shared/document-list-client';

export const metadata = {
  ...metaObject('Tất cả tài liệu'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TatCaPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const searchQuery = searchParams.search || '';

  // Fetch documents from Supabase
  const documents = searchQuery
    ? await searchDocuments(searchQuery)
    : await getApprovedDocuments();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {searchQuery ? `Kết quả tìm kiếm: "${searchParams.search}"` : 'Tất cả tài liệu'}
      </h1>
      {searchQuery && documents.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy tài liệu nào phù hợp.</p>
      ) : (
        <DocumentListClient documents={documents} showMajor />
      )}
    </div>
  );
}
