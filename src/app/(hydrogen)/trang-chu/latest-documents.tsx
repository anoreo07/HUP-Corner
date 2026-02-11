'use client';

import { useState } from 'react';
import {
  PiFileTextDuotone,
  PiCalendarDuotone,
  PiArrowRightBold,
} from 'react-icons/pi';
import DocumentDetailModal from '@/app/shared/document-detail-modal';
import { DocumentWithMajor, DocumentType } from '@/types/database';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

export default function LatestDocuments({
  documents,
}: {
  documents: DocumentWithMajor[];
}) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMajor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (doc: DocumentWithMajor) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  if (documents.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Chưa có tài liệu nào được đăng tải.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleView(doc)}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <PiFileTextDuotone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{doc.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {documentTypeLabels[doc.document_type]}
                  </span>
                  {doc.majors?.name && <span>{doc.majors.name}</span>}
                  <span className="flex items-center gap-1">
                    <PiCalendarDuotone className="h-4 w-4" />
                    {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
            <PiArrowRightBold className="h-5 w-5 text-gray-400 shrink-0" />
          </div>
        ))}
      </div>

      <DocumentDetailModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
