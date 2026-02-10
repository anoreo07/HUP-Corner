import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Hoá Dược'),
};

export default function HoaDuocPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Hoá dược</h1>

      {/* Documents Section - Placeholder */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chưa có tài liệu nào được chia sẻ.</p>
      </div>
    </div>
  );
}
