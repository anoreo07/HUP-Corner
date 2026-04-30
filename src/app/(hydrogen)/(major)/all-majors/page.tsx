import React from 'react';
import DocumentExplorer from '@/app/shared/document-explorer';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Tất cả tài liệu'),
};

export default function AllMajorsPage() {
  return (
    <div className="w-full">
      <DocumentExplorer />
    </div>
  );
}
