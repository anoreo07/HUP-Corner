import { metaObject } from '@/config/site.config';
import { getApprovedDocumentsPaginated } from '@/lib/supabase';
import DocumentListClient from '@/app/shared/document-list-client';
import Link from 'next/link';

export const metadata = {
  ...metaObject('Tất cả tài liệu'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TatCaPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const perPage = 12;

  const { data, totalPages } = await getApprovedDocumentsPaginated(undefined, page, perPage);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tất cả tài liệu</h1>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Chưa có tài liệu nào được chia sẻ.</p>
      ) : (
        <DocumentListClient documents={data} showMajor serverPaginated />
      )}

      <div className="flex items-center justify-center gap-3 mt-6">
        <Link
          href={`?page=${Math.max(1, page - 1)}`}
          className={`px-3 py-1 rounded-md bg-gray-100 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Prev
        </Link>

        <div className="text-sm text-gray-600">Trang {page} / {totalPages}</div>

        <Link
          href={`?page=${Math.min(totalPages, page + 1)}`}
          className={`px-3 py-1 rounded-md bg-gray-100 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
