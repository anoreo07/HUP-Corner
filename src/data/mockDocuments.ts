// Mock document types
export type DocumentType = 'EXAM' | 'SLIDE' | 'TEXTBOOK';

export type MajorId = 'HOA_DUOC' | 'CONG_NGHE_SINH_HOC' | 'HOA_HOC' | 'DUOC_HOC';

export interface MockDocument {
  id: string;
  title: string;
  documentType: DocumentType;
  subjectId: string;
  majorId: MajorId;
  uploadDate: string;
  fileType: 'pdf' | 'pptx' | 'docx';
  fileSize: string;
  viewCount: number;
  downloadCount: number;
}

// Major ID mapping to route slugs
export const majorRouteMap: Record<MajorId, string> = {
  HOA_DUOC: 'hoa-duoc',
  CONG_NGHE_SINH_HOC: 'cong-nghe-sinh-hoc',
  HOA_HOC: 'hoa-hoc',
  DUOC_HOC: 'duoc-hoc',
};

export const majorNameMap: Record<MajorId, string> = {
  HOA_DUOC: 'Hoá dược',
  CONG_NGHE_SINH_HOC: 'Công nghệ sinh học',
  HOA_HOC: 'Hoá học',
  DUOC_HOC: 'Dược học',
};

// Document type labels in Vietnamese
export const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
};

// Mock documents data
export const mockDocuments: MockDocument[] = [
  // ========== HOA_DUOC (12 documents) ==========
  {
    id: 'hd-001',
    title: 'Đề thi Hoá Dược 1 - Học kỳ 1 năm 2024',
    documentType: 'EXAM',
    subjectId: 'HD101',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-12-15',
    fileType: 'pdf',
    fileSize: '2.5 MB',
    viewCount: 342,
    downloadCount: 128,
  },
  {
    id: 'hd-002',
    title: 'Slide Tổng hợp thuốc kháng sinh',
    documentType: 'SLIDE',
    subjectId: 'HD201',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-11-20',
    fileType: 'pptx',
    fileSize: '15.3 MB',
    viewCount: 567,
    downloadCount: 234,
  },
  {
    id: 'hd-003',
    title: 'Giáo trình Hoá Dược Đại Cương',
    documentType: 'TEXTBOOK',
    subjectId: 'HD100',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-09-01',
    fileType: 'pdf',
    fileSize: '45.8 MB',
    viewCount: 1203,
    downloadCount: 567,
  },
  {
    id: 'hd-004',
    title: 'Đề thi Dược lý học - Cuối kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'HD102',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-12-20',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    viewCount: 289,
    downloadCount: 95,
  },
  {
    id: 'hd-005',
    title: 'Slide Cấu trúc và hoạt tính thuốc',
    documentType: 'SLIDE',
    subjectId: 'HD203',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-10-15',
    fileType: 'pptx',
    fileSize: '22.1 MB',
    viewCount: 445,
    downloadCount: 178,
  },
  {
    id: 'hd-006',
    title: 'Giáo trình Hoá học hữu cơ Dược',
    documentType: 'TEXTBOOK',
    subjectId: 'HD105',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-08-15',
    fileType: 'pdf',
    fileSize: '38.2 MB',
    viewCount: 876,
    downloadCount: 432,
  },
  {
    id: 'hd-007',
    title: 'Đề thi Hoá Dược 2 - Giữa kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'HD201',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-10-25',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    viewCount: 198,
    downloadCount: 76,
  },
  {
    id: 'hd-008',
    title: 'Slide Thuốc điều trị tim mạch',
    documentType: 'SLIDE',
    subjectId: 'HD204',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-11-05',
    fileType: 'pptx',
    fileSize: '18.7 MB',
    viewCount: 356,
    downloadCount: 145,
  },
  {
    id: 'hd-009',
    title: 'Giáo trình Phân tích thuốc',
    documentType: 'TEXTBOOK',
    subjectId: 'HD301',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-09-10',
    fileType: 'pdf',
    fileSize: '52.4 MB',
    viewCount: 654,
    downloadCount: 298,
  },
  {
    id: 'hd-010',
    title: 'Đề thi Bào chế thuốc - 2023',
    documentType: 'EXAM',
    subjectId: 'HD302',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-01-10',
    fileType: 'pdf',
    fileSize: '3.2 MB',
    viewCount: 534,
    downloadCount: 267,
  },
  {
    id: 'hd-011',
    title: 'Slide Thuốc kháng viêm không steroid',
    documentType: 'SLIDE',
    subjectId: 'HD205',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-11-28',
    fileType: 'pptx',
    fileSize: '14.5 MB',
    viewCount: 223,
    downloadCount: 89,
  },
  {
    id: 'hd-012',
    title: 'Giáo trình Dược lý lâm sàng',
    documentType: 'TEXTBOOK',
    subjectId: 'HD303',
    majorId: 'HOA_DUOC',
    uploadDate: '2024-08-01',
    fileType: 'pdf',
    fileSize: '67.3 MB',
    viewCount: 987,
    downloadCount: 456,
  },

  // ========== CONG_NGHE_SINH_HOC (12 documents) ==========
  {
    id: 'cnsh-001',
    title: 'Đề thi Sinh học phân tử - Cuối kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'CNSH101',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-12-18',
    fileType: 'pdf',
    fileSize: '2.8 MB',
    viewCount: 412,
    downloadCount: 167,
  },
  {
    id: 'cnsh-002',
    title: 'Slide Kỹ thuật PCR và ứng dụng',
    documentType: 'SLIDE',
    subjectId: 'CNSH201',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-11-10',
    fileType: 'pptx',
    fileSize: '28.5 MB',
    viewCount: 678,
    downloadCount: 312,
  },
  {
    id: 'cnsh-003',
    title: 'Giáo trình Công nghệ gen',
    documentType: 'TEXTBOOK',
    subjectId: 'CNSH102',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-09-05',
    fileType: 'pdf',
    fileSize: '48.9 MB',
    viewCount: 1456,
    downloadCount: 678,
  },
  {
    id: 'cnsh-004',
    title: 'Đề thi Vi sinh học - Giữa kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'CNSH103',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-10-20',
    fileType: 'pdf',
    fileSize: '1.9 MB',
    viewCount: 234,
    downloadCount: 98,
  },
  {
    id: 'cnsh-005',
    title: 'Slide Nuôi cấy tế bào động vật',
    documentType: 'SLIDE',
    subjectId: 'CNSH202',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-10-28',
    fileType: 'pptx',
    fileSize: '32.1 MB',
    viewCount: 389,
    downloadCount: 156,
  },
  {
    id: 'cnsh-006',
    title: 'Giáo trình Enzyme học',
    documentType: 'TEXTBOOK',
    subjectId: 'CNSH104',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-08-20',
    fileType: 'pdf',
    fileSize: '35.6 MB',
    viewCount: 723,
    downloadCount: 345,
  },
  {
    id: 'cnsh-007',
    title: 'Đề thi Hoá sinh học - 2023',
    documentType: 'EXAM',
    subjectId: 'CNSH105',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-02-15',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    viewCount: 567,
    downloadCount: 234,
  },
  {
    id: 'cnsh-008',
    title: 'Slide CRISPR-Cas9 và chỉnh sửa gen',
    documentType: 'SLIDE',
    subjectId: 'CNSH301',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-11-25',
    fileType: 'pptx',
    fileSize: '25.8 MB',
    viewCount: 456,
    downloadCount: 189,
  },
  {
    id: 'cnsh-009',
    title: 'Giáo trình Công nghệ lên men',
    documentType: 'TEXTBOOK',
    subjectId: 'CNSH203',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-09-15',
    fileType: 'pdf',
    fileSize: '41.2 MB',
    viewCount: 534,
    downloadCount: 267,
  },
  {
    id: 'cnsh-010',
    title: 'Đề thi Tin sinh học - Cuối kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'CNSH302',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-12-22',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    viewCount: 178,
    downloadCount: 67,
  },
  {
    id: 'cnsh-011',
    title: 'Slide Protein tái tổ hợp',
    documentType: 'SLIDE',
    subjectId: 'CNSH303',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-10-05',
    fileType: 'pptx',
    fileSize: '19.4 MB',
    viewCount: 312,
    downloadCount: 134,
  },
  {
    id: 'cnsh-012',
    title: 'Giáo trình Miễn dịch học',
    documentType: 'TEXTBOOK',
    subjectId: 'CNSH204',
    majorId: 'CONG_NGHE_SINH_HOC',
    uploadDate: '2024-08-10',
    fileType: 'pdf',
    fileSize: '55.7 MB',
    viewCount: 845,
    downloadCount: 398,
  },

  // ========== HOA_HOC (12 documents) ==========
  {
    id: 'hh-001',
    title: 'Đề thi Hoá Đại Cương - Cuối kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'HH101',
    majorId: 'HOA_HOC',
    uploadDate: '2024-12-16',
    fileType: 'pdf',
    fileSize: '2.2 MB',
    viewCount: 523,
    downloadCount: 234,
  },
  {
    id: 'hh-002',
    title: 'Slide Phản ứng Oxi hoá - Khử',
    documentType: 'SLIDE',
    subjectId: 'HH201',
    majorId: 'HOA_HOC',
    uploadDate: '2024-11-08',
    fileType: 'pptx',
    fileSize: '16.7 MB',
    viewCount: 445,
    downloadCount: 187,
  },
  {
    id: 'hh-003',
    title: 'Giáo trình Hoá học Vô cơ',
    documentType: 'TEXTBOOK',
    subjectId: 'HH102',
    majorId: 'HOA_HOC',
    uploadDate: '2024-09-01',
    fileType: 'pdf',
    fileSize: '42.3 MB',
    viewCount: 1123,
    downloadCount: 534,
  },
  {
    id: 'hh-004',
    title: 'Đề thi Hoá Hữu Cơ 1 - 2024',
    documentType: 'EXAM',
    subjectId: 'HH103',
    majorId: 'HOA_HOC',
    uploadDate: '2024-12-10',
    fileType: 'pdf',
    fileSize: '2.6 MB',
    viewCount: 387,
    downloadCount: 156,
  },
  {
    id: 'hh-005',
    title: 'Slide Cơ chế phản ứng hữu cơ',
    documentType: 'SLIDE',
    subjectId: 'HH202',
    majorId: 'HOA_HOC',
    uploadDate: '2024-10-22',
    fileType: 'pptx',
    fileSize: '24.5 MB',
    viewCount: 512,
    downloadCount: 223,
  },
  {
    id: 'hh-006',
    title: 'Giáo trình Hoá Phân Tích',
    documentType: 'TEXTBOOK',
    subjectId: 'HH104',
    majorId: 'HOA_HOC',
    uploadDate: '2024-08-25',
    fileType: 'pdf',
    fileSize: '38.9 MB',
    viewCount: 678,
    downloadCount: 312,
  },
  {
    id: 'hh-007',
    title: 'Đề thi Hoá Lý - Giữa kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'HH105',
    majorId: 'HOA_HOC',
    uploadDate: '2024-10-18',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    viewCount: 267,
    downloadCount: 98,
  },
  {
    id: 'hh-008',
    title: 'Slide Nhiệt động học hoá học',
    documentType: 'SLIDE',
    subjectId: 'HH203',
    majorId: 'HOA_HOC',
    uploadDate: '2024-11-15',
    fileType: 'pptx',
    fileSize: '21.3 MB',
    viewCount: 334,
    downloadCount: 145,
  },
  {
    id: 'hh-009',
    title: 'Giáo trình Hoá học Polymer',
    documentType: 'TEXTBOOK',
    subjectId: 'HH301',
    majorId: 'HOA_HOC',
    uploadDate: '2024-09-20',
    fileType: 'pdf',
    fileSize: '47.8 MB',
    viewCount: 423,
    downloadCount: 189,
  },
  {
    id: 'hh-010',
    title: 'Đề thi Hoá Hữu Cơ 2 - 2023',
    documentType: 'EXAM',
    subjectId: 'HH203',
    majorId: 'HOA_HOC',
    uploadDate: '2024-01-25',
    fileType: 'pdf',
    fileSize: '2.9 MB',
    viewCount: 612,
    downloadCount: 287,
  },
  {
    id: 'hh-011',
    title: 'Slide Phổ học trong Hoá học',
    documentType: 'SLIDE',
    subjectId: 'HH302',
    majorId: 'HOA_HOC',
    uploadDate: '2024-11-02',
    fileType: 'pptx',
    fileSize: '29.6 MB',
    viewCount: 289,
    downloadCount: 112,
  },
  {
    id: 'hh-012',
    title: 'Giáo trình Hoá học môi trường',
    documentType: 'TEXTBOOK',
    subjectId: 'HH303',
    majorId: 'HOA_HOC',
    uploadDate: '2024-08-05',
    fileType: 'pdf',
    fileSize: '33.4 MB',
    viewCount: 534,
    downloadCount: 245,
  },

  // ========== DUOC_HOC (12 documents) ==========
  {
    id: 'dh-001',
    title: 'Đề thi Dược liệu học - Cuối kỳ 2024',
    documentType: 'EXAM',
    subjectId: 'DH101',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-12-19',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    viewCount: 456,
    downloadCount: 198,
  },
  {
    id: 'dh-002',
    title: 'Slide Bào chế thuốc viên nén',
    documentType: 'SLIDE',
    subjectId: 'DH201',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-11-12',
    fileType: 'pptx',
    fileSize: '26.4 MB',
    viewCount: 623,
    downloadCount: 278,
  },
  {
    id: 'dh-003',
    title: 'Giáo trình Dược động học',
    documentType: 'TEXTBOOK',
    subjectId: 'DH102',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-09-08',
    fileType: 'pdf',
    fileSize: '51.2 MB',
    viewCount: 1345,
    downloadCount: 623,
  },
  {
    id: 'dh-004',
    title: 'Đề thi Dược học lâm sàng - 2024',
    documentType: 'EXAM',
    subjectId: 'DH103',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-12-08',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    viewCount: 378,
    downloadCount: 167,
  },
  {
    id: 'dh-005',
    title: 'Slide Tương tác thuốc',
    documentType: 'SLIDE',
    subjectId: 'DH202',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-10-30',
    fileType: 'pptx',
    fileSize: '18.9 MB',
    viewCount: 534,
    downloadCount: 234,
  },
  {
    id: 'dh-006',
    title: 'Giáo trình Dược điển Việt Nam',
    documentType: 'TEXTBOOK',
    subjectId: 'DH104',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-08-18',
    fileType: 'pdf',
    fileSize: '78.5 MB',
    viewCount: 912,
    downloadCount: 445,
  },
  {
    id: 'dh-007',
    title: 'Đề thi Kiểm nghiệm thuốc - Giữa kỳ',
    documentType: 'EXAM',
    subjectId: 'DH105',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-10-15',
    fileType: 'pdf',
    fileSize: '2.7 MB',
    viewCount: 289,
    downloadCount: 123,
  },
  {
    id: 'dh-008',
    title: 'Slide Thuốc điều trị ung thư',
    documentType: 'SLIDE',
    subjectId: 'DH301',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-11-22',
    fileType: 'pptx',
    fileSize: '31.2 MB',
    viewCount: 412,
    downloadCount: 178,
  },
  {
    id: 'dh-009',
    title: 'Giáo trình Quản lý Dược',
    documentType: 'TEXTBOOK',
    subjectId: 'DH203',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-09-12',
    fileType: 'pdf',
    fileSize: '29.8 MB',
    viewCount: 567,
    downloadCount: 256,
  },
  {
    id: 'dh-010',
    title: 'Đề thi Công nghệ Dược phẩm - 2023',
    documentType: 'EXAM',
    subjectId: 'DH302',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-02-20',
    fileType: 'pdf',
    fileSize: '3.5 MB',
    viewCount: 645,
    downloadCount: 298,
  },
  {
    id: 'dh-011',
    title: 'Slide Vaccine và Sinh phẩm',
    documentType: 'SLIDE',
    subjectId: 'DH303',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-10-08',
    fileType: 'pptx',
    fileSize: '22.7 MB',
    viewCount: 356,
    downloadCount: 145,
  },
  {
    id: 'dh-012',
    title: 'Giáo trình Thực hành Nhà thuốc',
    documentType: 'TEXTBOOK',
    subjectId: 'DH304',
    majorId: 'DUOC_HOC',
    uploadDate: '2024-08-28',
    fileType: 'pdf',
    fileSize: '24.3 MB',
    viewCount: 734,
    downloadCount: 334,
  },
];

// ========== Helper Functions ==========

/**
 * Get all mock documents
 */
export function getMockDocuments(): MockDocument[] {
  return mockDocuments;
}

/**
 * Get documents filtered by major ID
 */
export function getMockDocumentsByMajor(majorId: MajorId): MockDocument[] {
  return mockDocuments.filter((doc) => doc.majorId === majorId);
}

/**
 * Get documents filtered by document type
 */
export function getMockDocumentsByType(type: DocumentType): MockDocument[] {
  return mockDocuments.filter((doc) => doc.documentType === type);
}

/**
 * Get a single document by ID
 */
export function getMockDocumentById(id: string): MockDocument | undefined {
  return mockDocuments.find((doc) => doc.id === id);
}

/**
 * Get document count by major
 */
export function getDocumentCountByMajor(majorId: MajorId): number {
  return mockDocuments.filter((doc) => doc.majorId === majorId).length;
}

/**
 * Get route slug from major ID
 */
export function getRouteFromMajorId(majorId: MajorId): string {
  return majorRouteMap[majorId];
}

/**
 * Get major ID from route slug
 */
export function getMajorIdFromRoute(route: string): MajorId | undefined {
  const entry = Object.entries(majorRouteMap).find(([, slug]) => slug === route);
  return entry ? (entry[0] as MajorId) : undefined;
}
