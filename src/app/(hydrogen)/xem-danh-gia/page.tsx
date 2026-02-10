import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Xem Đánh Giá'),
};

export default function XemDanhGiaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Xem Đánh Giá Giảng Viên</h1>

      {/* Reviews Section - Placeholder */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chưa có đánh giá nào.</p>
      </div>
    </div>
  );
}
