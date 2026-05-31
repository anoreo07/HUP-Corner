'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { Button, Badge, Title, Empty, ActionIcon, Loader, Tooltip } from 'rizzui';
import { toast } from 'react-hot-toast';
import {
  PiEyeBold,
  PiDownloadSimpleBold,
  PiPencilBold,
  PiCheckBold,
  PiXBold,
  PiTrashBold,
  PiArrowLeftBold,
  PiArrowsClockwiseBold,
  PiFileTextBold,
  PiCheckCircleFill,
  PiXCircleFill,
  PiClockFill,
  PiFunnelBold,
} from 'react-icons/pi';
import { EditDocumentModal } from '@/app/(hydrogen)/admin/edit-document-modal';
import { DocumentPreviewModal } from '@/app/(hydrogen)/admin/document-preview-modal';
import {
  getMajors,
  supabase,
} from '@/lib/supabase';
import { DocumentWithMajor, DocumentType, DocumentStatus } from '@/types/database';
import cn from '@core/utils/class-names';
import { downloadFileParallel } from '@/utils/file-chunking';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OUTLINE: 'Đề cương',
  OTHER: 'Khác',
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <PiFileTextBold className="h-6 w-6 text-slate-400" />;
  
  if (mimeType.includes('pdf')) return <div className="p-2 bg-red-50 text-red-600 rounded-lg font-black text-[10px]">PDF</div>;
  if (mimeType.includes('presentation') || mimeType.includes('pptx')) 
    return <div className="p-2 bg-orange-50 text-orange-600 rounded-lg font-black text-[10px]">PPT</div>;
  if (mimeType.includes('word') || mimeType.includes('document') || 
      mimeType.includes('wordprocessingml') || mimeType.includes('msword')) 
    return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg font-black text-[10px]">DOC</div>;
  if (mimeType.includes('image')) 
    return <div className="p-2 bg-green-50 text-green-600 rounded-lg font-black text-[10px]">IMG</div>;
  
  return <PiFileTextBold className="h-6 w-6 text-slate-400" />;
};

const getStatusDetails = (status: DocumentStatus) => {
  switch (status) {
    case 'PENDING':
      return { 
        label: 'Chờ duyệt', 
        color: 'warning', 
        icon: <PiClockFill className="h-4 w-4" />,
        className: 'bg-amber-50 text-amber-700 border-amber-100'
      };
    case 'APPROVED':
      return { 
        label: 'Đã duyệt', 
        color: 'success', 
        icon: <PiCheckCircleFill className="h-4 w-4" />,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100'
      };
    case 'REJECTED':
      return { 
        label: 'Từ chối', 
        color: 'danger', 
        icon: <PiXCircleFill className="h-4 w-4" />,
        className: 'bg-rose-50 text-rose-700 border-rose-100'
      };
    default:
      return { label: status, color: 'secondary', icon: null, className: '' };
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<DocumentWithMajor[]>([]);
  const [majors, setMajors] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMajor | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentWithMajor | null>(null);

  const loadDocuments = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/admin/documents/all', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      if (!silent) toast.error('Lỗi khi tải danh sách tài liệu');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadMajors = useCallback(async () => {
    try {
      const data = await getMajors();
      setMajors(data || []);
    } catch (err) {
      console.error('Error loading majors:', err);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadMajors();
    loadDocuments();
  }, [status, session, router, loadMajors, loadDocuments]);

  // Real-time fallback & BroadcastChannel listener
  useEffect(() => {
    // 1. Polling every 15s
    const interval = setInterval(() => {
      loadDocuments(true);
    }, 15000);

    // 2. Listen for BroadcastChannel updates (from same browser)
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('documents');
      bc.onmessage = (event) => {
        if (event.data?.type === 'uploaded') {
          loadDocuments(true);
        }
      };
    } catch (e) {}

    // 3. Storage event listener (for different tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'documents-updated') {
        loadDocuments(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadDocuments]);

  const handleApprove = async (id: string) => {
    try {
      setApproving(id);
      
      // Optimistic update
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, status: 'APPROVED' as DocumentStatus } : doc
      ));

      const res = await fetch('/api/documents/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const result = await res.json();
      if (!res.ok) {
        // Rollback on error
        loadDocuments(true);
        throw new Error(result.error || 'Duyệt thất bại');
      }
      
      toast.success('Đã duyệt tài liệu thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi duyệt tài liệu');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Từ chối tài liệu này? File sẽ bị xoá khỏi Telegram.')) return;
    try {
      setRejecting(id);
      
      // Optimistic removal (if filtering by pending) or update
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, status: 'REJECTED' as DocumentStatus } : doc
      ));

      const res = await fetch('/api/documents/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const result = await res.json();
      if (!res.ok) {
        loadDocuments(true);
        throw new Error(result.error || 'Từ chối thất bại');
      }
      
      toast.success('Đã từ chối tài liệu!');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi từ chối tài liệu');
    } finally {
      setRejecting(null);
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
      // Optimistic update
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, ...data } : doc
      ));

      const res = await fetch('/api/admin/documents/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          ...data,
        }),
      });
      
      if (!res.ok) {
        const result = await res.json();
        loadDocuments(true);
        throw new Error(result.error || 'Cập nhật thất bại');
      }
      
      toast.success('Cập nhật thành công!');
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa vĩnh viễn tài liệu này?')) return;
    try {
      // Optimistic delete
      const originalDocs = [...documents];
      setDocuments(prev => prev.filter(doc => doc.id !== id));

      const res = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) {
        setDocuments(originalDocs);
        const result = await res.json();
        throw new Error(result.error || 'Xoá thất bại');
      }
      
      toast.success('Đã xoá tài liệu khỏi hệ thống!');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi khi xoá tài liệu');
    }
  };

  const handleDownload = async (doc: DocumentWithMajor) => {
    if (doc.storage_provider === 'telegram') {
      try {
        const toastId = toast.loading('Đang chuẩn bị tải xuống...');
        await downloadFileParallel(
          doc.file_path,
          doc.file_name || doc.title,
          (progress, message) => {
            if (message) toast.loading(message, { id: toastId });
          },
          doc.telegram_bot_index || 1
        );
        toast.success('Tải về thành công!', { id: toastId });
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
      const botQuery = doc.telegram_bot_index ? `&botIndex=${doc.telegram_bot_index}` : '';
      previewUrl = `/api/telegram/download?fileId=${encodeURIComponent(doc.file_path)}&fileName=${encodeURIComponent(doc.file_name || doc.title)}${botQuery}`;
    } else {
      const { data } = supabase.storage.from('documents').getPublicUrl(doc.file_path);
      previewUrl = data.publicUrl;
    }
    setPreviewDocument({ ...doc, file_path: previewUrl } as any);
    setIsPreviewModalOpen(true);
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  const counts = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size="lg" className="mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Đang chuẩn bị dữ liệu quản trị...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin">
               <ActionIcon variant="text" size="sm" className="rounded-full hover:bg-slate-100">
                  <PiArrowLeftBold />
               </ActionIcon>
            </Link>
            <Title as="h1" className="text-3xl font-black text-slate-900 tracking-tight font-plus-jakarta">
              Duyệt tài liệu
            </Title>
          </div>
          <p className="text-slate-500 font-medium">
            Quản lý quy trình phê duyệt tài liệu từ người dùng
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => loadDocuments()}
            className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2"
          >
            <PiArrowsClockwiseBold className={cn(loading && "animate-spin")} />
            Làm mới
          </Button>
          <Button
            onClick={() => router.push('/admin/notifications')}
            className="rounded-xl bg-slate-900 text-white shadow-lg hover:bg-slate-800"
          >
            Tạo thông báo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng số', value: counts.total, type: 'all', color: 'bg-slate-900', text: 'text-white' },
          { label: 'Chờ duyệt', value: counts.pending, type: 'PENDING', color: 'bg-amber-500', text: 'text-white' },
          { label: 'Đã duyệt', value: counts.approved, type: 'APPROVED', color: 'bg-emerald-500', text: 'text-white' },
          { label: 'Từ chối', value: counts.rejected, type: 'REJECTED', color: 'bg-rose-500', text: 'text-white' },
        ].map((stat) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={stat.type}
            onClick={() => setFilter(stat.type as any)}
            className={cn(
              "cursor-pointer rounded-[2rem] p-8 shadow-sm transition-all border border-slate-100 relative overflow-hidden group",
              filter === stat.type ? "ring-2 ring-slate-900 ring-offset-4" : "bg-white hover:shadow-xl hover:border-slate-200"
            )}
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20", stat.color)}></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
               <p className="text-4xl font-black text-slate-900">{stat.value}</p>
               <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.color, stat.text)}>
                  {stat.type === 'PENDING' ? <PiClockFill size={20} /> : 
                   stat.type === 'APPROVED' ? <PiCheckCircleFill size={20} /> : 
                   stat.type === 'REJECTED' ? <PiXCircleFill size={20} /> : <PiFileTextBold size={20} />}
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0px_40px_80px_rgba(13,52,89,0.05)] overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                 <PiFunnelBold className="text-slate-400" />
                 <span className="text-sm font-bold text-slate-600">Lọc theo:</span>
                 <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm font-bold text-slate-900 border-none p-0 focus:ring-0 cursor-pointer bg-transparent"
                 >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                 </select>
              </div>
           </div>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Hiển thị {filteredDocuments.length} kết quả
           </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader size="lg" />
            <p className="mt-4 text-slate-400 font-medium">Đang truy xuất dữ liệu...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-20 text-center">
            <Empty
              text={
                filter === 'PENDING'
                  ? 'Tuyệt vời! Không có tài liệu nào đang chờ duyệt.'
                  : 'Không tìm thấy tài liệu nào trong mục này.'
              }
              className="max-w-xs mx-auto"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tài liệu</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông tin học thuật</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocuments.map((doc) => {
                  const statusInfo = getStatusDetails(doc.status);
                  const isBusy = approving === doc.id || rejecting === doc.id;
                  
                  return (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                            {getFileIcon(doc.mime_type)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate max-w-[240px] leading-tight mb-1">{doc.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(doc.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">{doc.majors?.name || 'Khác'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {documentTypeLabels[doc.document_type]} • {doc.subject_name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          statusInfo.className
                        )}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Xem tài liệu" placement="top">
                             <ActionIcon
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                onClick={() => handlePreview(doc)}
                             >
                               <PiEyeBold size={16} />
                             </ActionIcon>
                          </Tooltip>

                          <Tooltip content="Tải file" placement="top">
                            <ActionIcon
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
                              onClick={() => handleDownload(doc)}
                            >
                              <PiDownloadSimpleBold size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip content="Chỉnh sửa" placement="top">
                            <ActionIcon
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50"
                              onClick={() => handleEdit(doc)}
                            >
                              <PiPencilBold size={16} />
                            </ActionIcon>
                          </Tooltip>

                          {doc.status === 'PENDING' && (
                            <>
                              <Tooltip content="Duyệt" placement="top">
                                <ActionIcon
                                  variant="solid"
                                  size="sm"
                                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 disabled:opacity-50"
                                  onClick={() => handleApprove(doc.id)}
                                  disabled={isBusy}
                                >
                                  {approving === doc.id ? <Loader size="sm" color="current" /> : <PiCheckBold size={16} />}
                                </ActionIcon>
                              </Tooltip>
                              
                              <Tooltip content="Từ chối" placement="top">
                                <ActionIcon
                                  variant="solid"
                                  size="sm"
                                  className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100 disabled:opacity-50"
                                  onClick={() => handleReject(doc.id)}
                                  disabled={isBusy}
                                >
                                  {rejecting === doc.id ? <Loader size="sm" color="current" /> : <PiXBold size={16} />}
                                </ActionIcon>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip content="Xóa" placement="top">
                            <ActionIcon
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <PiTrashBold size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
