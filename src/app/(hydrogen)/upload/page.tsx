import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Upload Tài Liệu'),
};

export default function UploadPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Upload Tài Liệu</h1>
      <p className="text-gray-600">Trang upload tài liệu sẽ được phát triển.</p>
    </div>
  );
}
