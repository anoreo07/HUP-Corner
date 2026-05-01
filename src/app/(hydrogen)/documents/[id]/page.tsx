import React from 'react';
import { getDocumentById, getRelatedDocuments } from '@/lib/supabase';
import DocumentPreviewClient from './document-preview-client';
import { notFound } from 'next/navigation';
import { metaObject } from '@/config/site.config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const document = await getDocumentById(params.id);
  if (!document) return metaObject('Tài liệu không tồn tại');
  return metaObject(document.title);
}

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const document = await getDocumentById(params.id);

  if (!document) {
    notFound();
  }

  const relatedDocuments = await getRelatedDocuments(document);

  return (
    <div className="w-full">
      <DocumentPreviewClient 
        document={document} 
        relatedDocuments={relatedDocuments} 
      />
    </div>
  );
}
