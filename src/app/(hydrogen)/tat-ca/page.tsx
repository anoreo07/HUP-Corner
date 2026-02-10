import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Tất cả tài liệu'),
};

export default function TatCaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tất cả tài liệu</h1>

      {/* Documents Section - Placeholder */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chưa có tài liệu nào được chia sẻ.</p>
      </div>
    </div>
  );
}
