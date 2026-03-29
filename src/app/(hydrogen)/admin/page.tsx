'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from 'rizzui';
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">👨‍💼 Bảng Điều Khiển Admin</h1>
            <p className="text-red-100">Xin chào, {adminName}! 👋</p>
          </div>
          <div className="text-5xl">⚙️</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tài liệu chờ duyệt</h3>
            <div className="text-3xl">📋</div>
          </div>
          <p className="text-sm text-gray-600">Kiểm tra và duyệt tài liệu</p>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-xl p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            <div className="text-3xl">📢</div>
          </div>
          <p className="text-sm text-gray-600">Quản lý thông báo admin</p>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Hệ thống</h3>
            <div className="text-3xl">🛠️</div>
          </div>
          <p className="text-sm text-gray-600">Thông tin hệ thống</p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dashboard */}
        <Link href="/admin/dashboard" className="group">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-3 border-blue-300 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">📊 Dashboard Duyệt</h2>
                <p className="text-blue-700 leading-relaxed">
                  Quản lý và duyệt tài liệu. Xem thông tin chi tiết, chỉnh sửa metadata, duyệt hoặc từ chối tài liệu từ người dùng.
                </p>
              </div>
              <div className="text-5xl group-hover:scale-110 transition transform">📈</div>
            </div>
            <div className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer">
              ✓ Vào Dashboard
            </div>
          </div>
        </Link>

        {/* Notifications */}
        <Link href="/admin/notifications" className="group">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-300 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-amber-900 mb-2">📢 Quản Lý Thông Báo</h2>
                <p className="text-amber-700 leading-relaxed">
                  Tạo và quản lý thông báo admin. Những thông báo sẽ hiển thị ở đầu trang chủ để thông báo cho tất cả người dùng.
                </p>
              </div>
              <div className="text-5xl group-hover:scale-110 transition transform">🔔</div>
            </div>
            <div className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer">
              📢 Quản Lý Thông Báo
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          📋 Quy Trình Duyệt Tài Liệu
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Người dùng tải lên tài liệu → tài liệu có trạng thái &quot;Chờ duyệt&quot;</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Admin vào Dashboard → xem danh sách tài liệu chờ duyệt</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Admin xem trước, chỉnh sửa nếu cần (tiêu đề, tên môn học, năm học)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Admin nhấn &quot;Duyệt&quot; → tài liệu được lưu vào Telegram và hiển thị công khai</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Admin có thể xóa tài liệu từ cả hệ thống lẫn Telegram</span>
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}

