import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Viết Đánh Giá'),
};

export default function VietDanhGiaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Viết Đánh Giá Giảng Viên</h1>

      {/* Form Section - Placeholder */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chức năng viết đánh giá sẽ được phát triển.</p>
      </div>
    </div>
  );
}
