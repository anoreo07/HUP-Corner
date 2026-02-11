import { metaObject } from '@/config/site.config';
import { getApprovedDocuments } from '@/lib/supabase';
import DocumentListClient from '@/app/shared/document-list-client';

export const metadata = {
  ...metaObject('Hoá học'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HoaHocPage() {
  const documents = await getApprovedDocuments('HOA_HOC');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Hoá học</h1>
      <DocumentListClient documents={documents} />
    </div>
  );
}
