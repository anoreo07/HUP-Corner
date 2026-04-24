'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button, Badge, Title, Empty, ActionIcon } from 'rizzui';
import { toast } from 'react-hot-toast';
import {
  PiEyeBold,
  PiDownloadSimpleBold,
  PiPencilBold,
  PiCheckBold,
  PiXBold,
  PiTrashBold,
} from 'react-icons/pi';
import { EditDocumentModal } from '@/app/(hydrogen)/admin/edit-document-modal';
import { DocumentPreviewModal } from '@/app/(hydrogen)/admin/document-preview-modal';
import {
  getAllDocumentsForAdmin,
  approveDocument,
  rejectDocument,
  deleteDocument,
  supabase,
  getMajors,
} from '@/lib/supabase';
import { DocumentWithMajor, DocumentType, DocumentStatus } from '@/types/database';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <span className="text-xs font-semibold text-gray-600">FILE</span>;
  
  if (mimeType.includes('pdf')) return <span className="text-xs font-semibold text-red-600">PDF</span>;
  if (mimeType.includes('presentation') || mimeType.includes('pptx')) 
    return <span className="text-xs font-semibold text-orange-600">PPT</span>;
  if (mimeType.includes('word') || mimeType.includes('document') || 
      mimeType.includes('wordprocessingml') || mimeType.includes('msword')) 
    return <span className="text-xs font-semibold text-blue-600">DOC</span>;
  if (mimeType.includes('image')) 
    return <span className="text-xs font-semibold text-green-600">IMG</span>;
  
  return <span className="text-xs font-semibold text-gray-600">FILE</span>;
};

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case 'PENDING':
      return <Badge color="warning">Chờ duyệt</Badge>;
    case 'APPROVED':
      return <Badge color="success">Đã duyệt</Badge>;
    case 'REJECTED':
      return <Badge color="danger">Từ chối</Badge>;
    default:
      return null;
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<DocumentWithMajor[]>([]);
  const [majors, setMajors] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [approving, setApproving] = useState<string | null>(null);
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMajor | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentWithMajor | null>(null);

  // Reload documents whenever filter changes
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadMajors();
    loadDocuments();
  }, [filter, status, session, router]);

  const loadMajors = async () => {
    try {
      const data = await getMajors();
      setMajors(data || []);
    } catch (err) {
      // Error loading majors
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    // load both counts and list when admin session present
    loadCounts();
    loadDocuments();
  }, [router, status, session]);

  // Listen for cross-tab document updates (upload/approve) and reload.
  // Use both BroadcastChannel and storage event; also add polling fallback.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMessage = (e: MessageEvent) => {
      try {
        const msg = (e as any).data ?? e;
        if (msg?.type === 'uploaded' || msg?.type === 'updated') {
          // reload both counts and list for current filter
          loadCounts();
          loadDocuments();
        }
      } catch (err) {
        // ignore
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('documents');
        // support older and newer browsers
        if (typeof bc.addEventListener === 'function') {
          bc.addEventListener('message', onMessage as EventListener);
        } else {
          // fallback
          (bc as any).onmessage = onMessage;
        }
      }
    } catch (err) {
      bc = null;
    }

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'documents-updated') {
        loadCounts();
        loadDocuments();
      }
    };
    window.addEventListener('storage', onStorage);

    // Polling fallback: every 8s while admin page is open
    const interval = setInterval(() => {
      loadCounts();
      loadDocuments();
    }, 8000);

    return () => {
      try {
        if (bc) {
          if (typeof bc.removeEventListener === 'function') {
            bc.removeEventListener('message', onMessage as EventListener);
          } else {
            (bc as any).onmessage = null;
          }
          bc.close();
        }
      } catch (err) {}
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      let data: DocumentWithMajor[] = [];
      try {
        const res = await fetch('/api/admin/documents/all', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch documents');
        data = await res.json();
      } catch (err) {
        data = [];
      }
      setDocuments(data || []);
    } catch (err) {
      // Error loading documents
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const res = await fetch('/api/admin/documents/all', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const all = await res.json();
      const total = (all || []).length;
      const pending = (all || []).filter((d: any) => d.status === 'PENDING').length;
      const approved = (all || []).filter((d: any) => d.status === 'APPROVED').length;
      const rejected = (all || []).filter((d: any) => d.status === 'REJECTED').length;
      setCounts({ total, pending, approved, rejected });
    } catch (err) {
      // Error loading counts
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setApproving(id);
      const res = await fetch('/api/telegram/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Duyệt thất bại');
      }
      toast.success('Đã duyệt và lưu vào Telegram!');
      await loadCounts();
      await loadDocuments();
      setFilter('PENDING');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi duyệt tài liệu');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Từ chối tài liệu này? File sẽ bị xoá khỏi Telegram.')) return;
    try {
      const res = await fetch('/api/telegram/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Từ chối thất bại');
      }
      toast.success('Đã từ chối và xoá file!');
      await loadCounts();
      await loadDocuments();
      setFilter('PENDING');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi từ chối tài liệu');
    }
  };

  const handleEdit = (document: DocumentWithMajor) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (
    documentId: string,
    data: { title: string; subject_name: string; academic_year: string }
  ) => {
    try {
      const res = await fetch('/api/admin/documents/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          ...data,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Cập nhật thất bại');
      }
      toast.success('Cập nhật thành công!');
      await loadCounts();
      await loadDocuments();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này? File sẽ bị xoá khỏi Telegram.')) return;
    try {
      const res = await fetch('/api/telegram/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Xoá thất bại');
      }
      toast.success('Đã xoá tài liệu!');
      await loadCounts();
      await loadDocuments();
      setFilter('PENDING');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi xoá tài liệu');
    }
  };

  const handleDownload = async (doc: DocumentWithMajor) => {
    if (doc.storage_provider === 'telegram') {
      try {
        const response = await fetch(
          `/api/telegram/download?fileId=${encodeURIComponent(doc.file_path)}&fileName=${encodeURIComponent(doc.file_name || doc.title)}`
        );
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.file_name || doc.title;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } catch (err) {
        toast.error('Lỗi khi tải file');
      }
    } else {
      const { data } = supabase.storage.from('documents').getPublicUrl(doc.file_path);
      window.open(data.publicUrl, '_blank');
    }
  };

  const handlePreview = async (doc: DocumentWithMajor) => {
    let previewUrl = '';
    
    if (doc.storage_provider === 'telegram') {
      // Get preview URL from Telegram
      previewUrl = `/api/telegram/download?fileId=${encodeURIComponent(doc.file_path)}&fileName=${encodeURIComponent(doc.file_name || doc.title)}`;
    } else {
      // Get public URL from Supabase storage
      const { data } = supabase.storage.from('documents').getPublicUrl(doc.file_path);
      previewUrl = data.publicUrl;
    }
    
    setPreviewDocument({ ...doc, file_path: previewUrl } as any);
    setIsPreviewModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }
  
  if (!session || (session.user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title as="h1" className="text-2xl font-bold text-gray-900">
            Quản lý tài liệu
          </Title>
          <p className="mt-1 text-gray-500">
            Duyệt và quản lý các tài liệu được đăng tải
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
            filter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setFilter('all')}
        >
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-sm text-gray-500">Tổng cộng</p>
        </div>
        <div
          className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
            filter === 'PENDING' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setFilter('PENDING')}
        >
          <p className="text-2xl font-bold text-yellow-600">
            {counts.pending}
          </p>
          <p className="text-sm text-gray-500">Chờ duyệt</p>
        </div>
        <div
          className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
            filter === 'APPROVED' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setFilter('APPROVED')}
        >
          <p className="text-2xl font-bold text-green-600">
            {counts.approved}
          </p>
          <p className="text-sm text-gray-500">Đã duyệt</p>
        </div>
        <div
          className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
            filter === 'REJECTED' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setFilter('REJECTED')}
        >
          <p className="text-2xl font-bold text-red-600">
            {counts.rejected}
          </p>
          <p className="text-sm text-gray-500">Từ chối</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center">
            <Empty
              text={
                filter === 'PENDING'
                  ? 'Không có tài liệu nào chờ duyệt'
                  : 'Không có tài liệu nào'
              }
              textClassName="text-gray-500"
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    {getFileIcon(doc.mime_type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <span>{doc.majors?.name || 'Chưa phân loại'}</span>
                      <span>•</span>
                      <span>{documentTypeLabels[doc.document_type]}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}

                  <ActionIcon
                    variant="outline"
                    size="sm"
                    className="border-cyan-500 text-cyan-500 hover:bg-cyan-50"
                    onClick={() => handlePreview(doc)}
                    title="Xem trước"
                  >
                    <PiEyeBold className="h-4 w-4" />
                  </ActionIcon>

                  <ActionIcon
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    onClick={() => handleDownload(doc)}
                    title="Tải file"
                  >
                    <PiDownloadSimpleBold className="h-4 w-4" />
                  </ActionIcon>

                  <ActionIcon
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-500 hover:bg-purple-50"
                    onClick={() => handleEdit(doc)}
                    title="Chỉnh sửa"
                  >
                    <PiPencilBold className="h-4 w-4" />
                  </ActionIcon>

                  {doc.status === 'PENDING' && (
                    <>
                      <ActionIcon
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-500 hover:bg-green-50"
                        onClick={() => handleApprove(doc.id)}
                        title="Duyệt tài liệu"
                        disabled={approving === doc.id}
                      >
                        {approving === doc.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                        ) : (
                          <PiCheckBold className="h-4 w-4" />
                        )}
                      </ActionIcon>
                      <ActionIcon
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleReject(doc.id)}
                        title="Từ chối tài liệu"
                      >
                        <PiXBold className="h-4 w-4" />
                      </ActionIcon>
                    </>
                  )}

                  <ActionIcon
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-500 hover:bg-gray-50"
                    onClick={() => handleDelete(doc.id)}
                    title="Xóa tài liệu"
                  >
                    <PiTrashBold className="h-4 w-4" />
                  </ActionIcon>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        document={selectedDocument}
        majors={majors}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDocument(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        documentName={previewDocument?.file_name || previewDocument?.title || 'Tài liệu'}
        documentUrl={previewDocument?.file_path || ''}
        mimeType={previewDocument?.mime_type}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewDocument(null);
        }}
      />
    </div>
  );
}
