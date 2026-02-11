import { metaObject } from '@/config/site.config';
import Image from 'next/image';
import { getApprovedDocuments, getNotifications } from '@/lib/supabase';
import LatestDocuments from './latest-documents';
import NotificationsBar from '@/app/shared/notifications-bar';

export const metadata = {
  ...metaObject('Trang Chủ'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrangChuPage() {
  // Fetch approved documents from Supabase and pass all to client-side
  // LatestDocuments will paginate and show the most recent items first.
  const allDocuments = await getApprovedDocuments();
  const notifications = await getNotifications();

  return (
    <div className="flex flex-col gap-8">
      {/* Notifications (admin) */}
      <NotificationsBar notifications={notifications} />

      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo-512.png"
            alt="HUP Corner Logo"
            width={120}
            height={120}
            className="mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chào mừng đến với HUP CORNER
          </h1>
          <div className="max-w-3xl space-y-4 text-gray-600">
            <p>
              <strong className="text-primary">HUP CORNER</strong> là không gian chia sẻ tài liệu và kiến thức học tập dành cho sinh viên HUP.
            </p>
            <p>
              Tại đây, bạn có thể dễ dàng tìm kiếm, tải về và đóng góp các tài liệu như đề cương, slide bài giảng, bài tập, đề thi và nhiều nguồn học tập hữu ích khác.
            </p>
            <p>
              Mục tiêu của HUP CORNER là xây dựng một cộng đồng học tập tích cực – nơi sinh viên hỗ trợ lẫn nhau để học tốt hơn mỗi ngày.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Documents Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📄</span> Tài Liệu Mới Nhất
        </h2>
        <LatestDocuments documents={allDocuments} />
      </div>
    </div>
  );
}
