'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from 'rizzui';
import { PiArrowUpRightBold } from 'react-icons/pi';
import { toast } from 'react-hot-toast';

export default function AdminPortalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect to login if not authenticated or not admin
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    // Check if redirected after login
    const justLoggedIn = searchParams.get('justLoggedIn');
    if (justLoggedIn) {
      toast.success('Đăng nhập thành công!');
    }
  }, [status, session, router, searchParams]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Đã đăng xuất');
    router.push('/admin/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    return null; // Will redirect
  }

  const adminName = (session.user as any)?.name || 'Admin';

  const quickLinks = [
    {
      title: 'Dashboard duyệt',
      description: 'Xem, chỉnh sửa và duyệt các tài liệu người dùng đã tải lên.',
      href: '/admin/dashboard',
      accent: 'text-blue-600 bg-blue-50',
      label: 'Quy trình tài liệu'
    },
    {
      title: 'Thông báo hệ thống',
      description: 'Tạo thông báo nổi bật hiển thị với toàn bộ người dùng.',
      href: '/admin/notifications',
      accent: 'text-amber-600 bg-amber-50',
      label: 'Truyền thông'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4">
        {/* Header */}
        <div className="rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Admin portal</p>
              <h1 className="text-3xl font-semibold text-neutral-900">Xin chào, {adminName}</h1>
              <p className="mt-2 text-base text-neutral-600">
                Quản trị tài liệu và nội dung hệ thống. Hãy chọn khu vực bạn muốn làm việc.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-500">
              Trạng thái: <span className="ml-2 font-medium text-green-600">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Tài liệu chờ duyệt', helper: 'Theo dõi và duyệt nhanh', tone: 'text-blue-600 bg-blue-50' },
            { label: 'Thông báo hệ thống', helper: 'Quản lý thông tin nổi bật', tone: 'text-amber-600 bg-amber-50' },
            { label: 'Hoạt động gần đây', helper: 'Kiểm tra lịch sử thao tác', tone: 'text-emerald-600 bg-emerald-50' }
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>
                {item.label}
              </div>
              <p className="mt-4 text-sm text-neutral-600">{item.helper}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid gap-6 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <div className="h-full rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${link.accent}`}>
                  {link.label}
                </div>
                <div className="mt-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-neutral-900">{link.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">{link.description}</p>
                  </div>
                  <div className="ml-6 rounded-full border border-neutral-200 p-3 text-neutral-400 transition group-hover:text-neutral-800">
                    <PiArrowUpRightBold className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Process */}
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Quy trình</p>
              <h3 className="mt-2 text-xl font-semibold text-neutral-900">Duyệt tài liệu từng bước</h3>
            </div>
            <div className="text-xs text-neutral-500">Cập nhật gần nhất · hôm nay</div>
          </div>
          <div className="mt-6 space-y-5">
            {[
              'Người dùng tải lên tài liệu với trạng thái "Chờ duyệt".',
              'Admin mở dashboard để xem danh sách tài liệu.',
              'Xem chi tiết, cập nhật metadata nếu cần.',
              'Duyệt để xuất bản hoặc từ chối với lý do rõ ràng.',
              'Có thể xóa tài liệu khỏi hệ thống nếu không phù hợp.'
            ].map((step, idx) => (
              <div key={step} className="flex gap-4">
                <span className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full border border-neutral-200 text-sm font-semibold text-neutral-600">
                  {idx + 1}
                </span>
                <p className="text-sm text-neutral-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="flex justify-end">
          <Button
            onClick={handleLogout}
            className="rounded-full border border-neutral-200 bg-white px-6 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-900 hover:text-white"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}

