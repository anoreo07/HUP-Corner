'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActionIcon,
  Empty,
  SearchNotFoundIcon,
  Button,
  Title,
  Input,
  Badge,
} from 'rizzui';
import {
  PiFileTextDuotone,
  PiMagnifyingGlassBold,
  PiXBold,
  PiFilePdf,
  PiFileDoc,
  PiPresentation,
  PiImage,
} from 'react-icons/pi';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import { supabase } from '@/lib/supabase';
import DocumentDetailModal from '@/app/shared/document-detail-modal';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <PiFileTextDuotone className="h-5 w-5" />;
  
  if (mimeType.includes('pdf')) return <PiFilePdf className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('presentation') || mimeType.includes('pptx'))
    return <PiPresentation className="h-5 w-5 text-orange-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <PiFileDoc className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes('image'))
    return <PiImage className="h-5 w-5 text-green-500" />;
  
  return <PiFileTextDuotone className="h-5 w-5" />;
};

const getDocumentTypeBadgeColor = (type: DocumentType) => {
  switch (type) {
    case 'EXAM':
      return 'danger';
    case 'SLIDE':
      return 'warning';
    case 'TEXTBOOK':
      return 'success';
    default:
      return 'primary';
  }
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function SearchList({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMajor | null>(null);
  const [documents, setDocuments] = useState<DocumentWithMajor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchDocuments = useCallback(async (query: string) => {
    if (query.trim().length === 0) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, majors(*)')
        .eq('status', 'APPROVED')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDocuments(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, searchDocuments]);

  const handleDocumentClick = (doc: DocumentWithMajor) => {
    setSelectedDocument(doc);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim().length > 0) {
      onClose?.();
      router.push(`/tat-ca?search=${encodeURIComponent(searchText.trim())}`);
    }
  };

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <div className="flex items-center px-5 py-4">
        <Input
          variant="flat"
          value={searchText}
          ref={inputRef}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm tài liệu theo tên..."
          className="flex-1"
          prefix={
            <PiMagnifyingGlassBold className="h-[18px] w-[18px] text-gray-600" />
          }
          suffix={
            searchText && (
              <Button
                size="sm"
                variant="text"
                className="h-auto w-auto px-0"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchText('');
                }}
              >
                Xóa
              </Button>
            )
          }
        />
        <ActionIcon
          variant="text"
          size="sm"
          className="ms-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <PiXBold className="h-5 w-5" />
        </ActionIcon>
      </div>

      <div className="custom-scrollbar h-[50vh] overflow-y-auto border-t border-gray-300 px-2 py-4">
        {searchText.length === 0 ? (
          <div className="px-3 py-6 text-center text-gray-500">
            Nhập tên tài liệu bạn muốn tìm kiếm
          </div>
        ) : isLoading ? (
          <div className="px-3 py-6 text-center text-gray-500">
            Đang tìm kiếm...
          </div>
        ) : documents.length === 0 ? (
          <Empty
            className="scale-75"
            image={<SearchNotFoundIcon />}
            text="Không tìm thấy tài liệu"
            textClassName="text-xl"
          />
        ) : (
          <>
            <Title
              as="h6"
              className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500"
            >
              Kết quả tìm kiếm ({documents.length})
            </Title>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                className="relative my-0.5 flex items-center rounded-lg px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 dark:hover:bg-gray-50/50 dark:hover:backdrop-blur-lg w-full text-left"
              >
                <span className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-500">
                  {getFileIcon(doc.mime_type)}
                </span>

                <span className="ms-3 grid flex-1 gap-0.5">
                  <span className="font-medium text-gray-900 dark:text-gray-700">
                    {doc.title}
                  </span>
                  <span className="flex items-center gap-2 text-gray-500 text-xs">
                    <Badge
                      size="sm"
                      color={getDocumentTypeBadgeColor(doc.document_type) as any}
                      className="px-1.5 py-0.5 text-[10px]"
                    >
                      {documentTypeLabels[doc.document_type]}
                    </Badge>
                    <span>{doc.majors?.name || 'Chưa phân loại'}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </span>
                </span>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
}
