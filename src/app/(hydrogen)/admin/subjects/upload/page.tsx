import React from 'react';
import { metaObject } from '@/config/site.config';
import SubjectDocumentUploadForm from '@/app/shared/admin/subject-upload-form';

export const metadata = {
  ...metaObject('Đăng tài liệu môn học - Admin'),
};

export default function AdminSubjectUploadPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <SubjectDocumentUploadForm />
    </div>
  );
}
