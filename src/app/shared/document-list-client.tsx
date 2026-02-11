'use client';

import { useState } from 'react';
import { PiCalendarDuotone, PiArrowRightBold, PiFileTextDuotone } from 'react-icons/pi';
import DocumentDetailModal from '@/app/shared/document-detail-modal';
import { DocumentWithMajor, DocumentType } from '@/types/database';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

interface DocumentListClientProps {
  documents: DocumentWithMajor[];
  showMajor?: boolean;
  serverPaginated?: boolean;
}

export default function DocumentListClient({
  documents,
  showMajor = false,
  serverPaginated = false,
}: DocumentListClientProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMajor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // client-side pagination (disabled when serverPaginated = true)
  const [page, setPage] = useState(1);
  const perPage = 12; // items per page for the grid

  const totalPages = Math.max(1, Math.ceil(documents.length / perPage));

  const paginated = serverPaginated ? documents : documents.slice((page - 1) * perPage, page * perPage);

  const handleViewDetail = (doc: DocumentWithMajor) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chưa có tài liệu nào được chia sẻ.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paginated.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
          >
            {/* Card Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div>
                    {showMajor && doc.majors?.name && (
                      <div className="text-sm text-gray-500">{doc.majors.name}</div>
                    )}
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-medium">
                      {documentTypeLabels[doc.document_type]}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 line-clamp-3">
                      {doc.title}
                    </h3>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                    <PiFileTextDuotone className="h-6 w-6 text-[#4338CA]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <PiCalendarDuotone className="h-4 w-4" />
                <span>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            {/* View Button */}
            <button
              onClick={() => handleViewDetail(doc)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-shadow shadow-sm hover:shadow focus:outline-none"
            >
              XEM CHI TIẾT
              <PiArrowRightBold className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Client-side Pagination controls (only when not server-paginated) */}
      {!serverPaginated && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>

          <div className="text-sm text-gray-600">Trang {page} / {totalPages}</div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Document Detail Modal */}
      <DocumentDetailModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
