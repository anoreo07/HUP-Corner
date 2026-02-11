"use client";

import { useMemo, useState } from 'react';
import { PiFileTextDuotone, PiCalendarDuotone, PiArrowRightBold } from 'react-icons/pi';
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

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.max(1, Math.ceil(documents.length / perPage));

  const paginated = useMemo(() => {
    // sort by created_at desc (newest first)
    const sorted = [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [documents, page]);

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
        {paginated.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleView(doc)}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <PiFileTextDuotone className="h-6 w-6 text-[#4338CA]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1 text-lg line-clamp-2">{doc.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-medium">
                    {documentTypeLabels[doc.document_type]}
                  </span>
                  {doc.majors?.name && <span className="text-gray-600">{doc.majors.name}</span>}
                  <span className="flex items-center gap-1 text-gray-500">
                    <PiCalendarDuotone className="h-4 w-4" />
                    {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(doc);
              }}
              aria-label="Xem chi tiết"
              className="h-10 w-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
            >
              <PiArrowRightBold className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>

        <div className="text-sm text-gray-600">
          Trang {page} / {totalPages}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <DocumentDetailModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
