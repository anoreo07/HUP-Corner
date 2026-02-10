import { metaObject } from '@/config/site.config';
import Image from 'next/image';
import {
  PiFileTextDuotone,
  PiDownloadSimpleDuotone,
  PiCalendarDuotone,
  PiUserDuotone,
} from 'react-icons/pi';

export const metadata = {
  ...metaObject('Trang Chủ'),
};

const mockDocuments = [
  {
    id: 1,
    title: 'Đề cương Hóa Dược 1 - Kỳ 2 năm 2025',
    category: 'Đề cương',
    uploadedBy: 'Nguyễn Văn A',
    date: '08/02/2026',
    downloads: 156,
  },
  {
    id: 2,
    title: 'Slide bài giảng Công nghệ sinh học đại cương',
    category: 'Slide',
    uploadedBy: 'Trần Thị B',
    date: '07/02/2026',
    downloads: 89,
  },
  {
    id: 3,
    title: 'Đề thi Dược lý học - Đề thi thử lần 1',
    category: 'Đề thi',
    uploadedBy: 'Lê Văn C',
    date: '06/02/2026',
    downloads: 234,
  },
  {
    id: 4,
    title: 'Bài tập thực hành Hóa phân tích',
    category: 'Bài tập',
    uploadedBy: 'Phạm Thị D',
    date: '05/02/2026',
    downloads: 67,
  },
  {
    id: 5,
    title: 'Tổng hợp kiến thức Sinh học phân tử',
    category: 'Tài liệu',
    uploadedBy: 'Hoàng Văn E',
    date: '04/02/2026',
    downloads: 112,
  },
];

export default function TrangChuPage() {
  return (
    <div className="flex flex-col gap-8">
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
        <div className="space-y-4">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <PiFileTextDuotone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{doc.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {doc.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <PiUserDuotone className="h-4 w-4" />
                      {doc.uploadedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <PiCalendarDuotone className="h-4 w-4" />
                      {doc.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <PiDownloadSimpleDuotone className="h-5 w-5" />
                <span className="text-sm">{doc.downloads}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="border-t border-gray-300 pt-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">HUP CORNER</h2>
          <p className="text-gray-500">Nền tảng hỗ trợ học tập dành cho sinh viên HUP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4">
            <span className="text-3xl mb-2 block">📌</span>
            <p className="text-gray-600">Chia sẻ & tải tài liệu học tập</p>
          </div>
          <div className="text-center p-4">
            <span className="text-3xl mb-2 block">🤝</span>
            <p className="text-gray-600">Kết nối cộng đồng sinh viên</p>
          </div>
          <div className="text-center p-4">
            <span className="text-3xl mb-2 block">📚</span>
            <p className="text-gray-600">Cập nhật nguồn học liệu mới mỗi ngày</p>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">Liên hệ & đóng góp</h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-gray-500 text-sm">
            <span>📤 Gửi tài liệu để chia sẻ với cộng đồng</span>
            <span className="hidden md:block">•</span>
            <span>💡 Góp ý để cải thiện hệ thống</span>
            <span className="hidden md:block">•</span>
            <span>📱 Theo dõi fanpage để nhận thông báo tài liệu mới</span>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-400 text-xs">
          © 2026 HUP CORNER. Made with ❤️ for HUP students.
        </div>
      </div>
    </div>
  );
}
