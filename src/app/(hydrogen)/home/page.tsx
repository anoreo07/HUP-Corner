import { metaObject } from '@/config/site.config';
import { getApprovedDocumentsPaginated, getMajors, getNotifications } from '@/lib/supabase';
import DocumentListClient from '@/app/shared/document-list-client';
import Image from 'next/image';
import Link from 'next/link';
import { Major, Notification } from '@/types/database';

export const metadata = {
  ...metaObject('Trang chủ - HUP Corner'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Map major codes to route paths
const MAJOR_ROUTES: Record<string, string> = {
  'HOA_DUOC': '/pharmaceutical-chemistry',
  'HOA_HOC': '/chemistry',
  'CONG_NGHE_SINH_HOC': '/biotechnology',
  'DUOC_HOC': '/pharmacology',
};

const MAJOR_DISPLAY_NAMES: Record<string, string> = {
  'HOA_DUOC': 'Hoá Dược',
  'HOA_HOC': 'Hoá Học',
  'CONG_NGHE_SINH_HOC': 'Công Nghệ Sinh Học',
  'DUOC_HOC': 'Dược Học',
};

export default async function HomePage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const perPage = 12;

  // Get all approved documents for latest section
  const { data: documents, totalPages } = await getApprovedDocumentsPaginated(undefined, page, perPage);

  // Get majors list
  let majors: Major[] = [];
  try {
    majors = (await getMajors()) || [];
  } catch (err) {
    // Error loading majors
  }

  // Get notifications
  let notifications: Notification[] = [];
  try {
    notifications = (await getNotifications()) || [];
  } catch (err) {
    // Error loading notifications
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Admin Notification */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">📢</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-amber-900 mb-2">[THÔNG BÁO ADMIN]</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                {notifications[0].description || notifications[0].title}
              </p>
              <p className="text-xs text-amber-700 mt-2">
                {new Date(notifications[0].created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-2xl p-12 md:p-16 shadow-lg text-center">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <Image
              src="/logo-512.png"
              alt="HUP Corner Logo"
              width={200}
              height={200}
              className="drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 max-w-2xl">
            Chào mừng đến với HUP CORNER
          </h1>
        </div>
      </div>

      {/* Majors Section */}
      {majors.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            TÀI LIỆU THEO NGÀNH
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {majors
              .filter((major) => MAJOR_ROUTES[major.code])
              .map((major) => (
                <Link
                  key={major.id}
                  href={MAJOR_ROUTES[major.code] || '#'}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition">
                        {MAJOR_DISPLAY_NAMES[major.code] || major.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{major.code}</p>
                    </div>
                    <span className="text-2xl group-hover:scale-110 transition transform">📄</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Latest Documents Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           TÀI LIỆU MỚI NHẤT
          </h2>
          <Link
            href="/all-majors"
            className="text-red-600 hover:text-red-700 font-semibold text-sm"
          >
            Xem tất cả →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-lg">Chưa có tài liệu nào được chia sẻ.</p>
          </div>
        ) : (
          <>
            <DocumentListClient documents={documents} showMajor serverPaginated />

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link
                href={`?page=${Math.max(1, page - 1)}`}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ← Trước
              </Link>

              <div className="text-sm text-gray-600 font-semibold min-w-fit">
                Trang {page} / {totalPages}
              </div>

              <Link
                href={`?page=${Math.min(totalPages, page + 1)}`}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tiếp →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">📤 Chia sẻ tài liệu của bạn</h3>
        <p className="text-gray-600 mb-6">
          Bạn có tài liệu hay? Hãy chia sẻ với cộng đồng để giúp đỡ các bạn khác.
        </p>
        <Link
          href="/upload"
          className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          Tải lên tài liệu
        </Link>
      </div>
    </div>
  );
}
