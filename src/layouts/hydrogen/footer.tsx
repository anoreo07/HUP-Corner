import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

export default function Footer() {
  return (
    <footer className="border-t border-gray-300 bg-gray-0 px-4 py-6 md:px-5 lg:px-6 3xl:px-8 4xl:px-10">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Liên hệ & đóng góp</h3>
        
        <p className="text-center text-gray-600 text-sm mb-4">
          Mọi ý kiến và thắc mắc vui lòng liên hệ qua hupcorner.team@gmail.com. Xin cảm ơn!
        </p>
        <div className="text-gray-400 text-xs">
          © 2026 HUP CORNER. Made with ❤️ for HUP students.
          <span className="mx-2">•</span>
        </div>
        <div className="mt-4 text-center">
          <h4 className="text-sm font-medium mb-2">Chia sẻ & Backlinks</h4>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                siteConfig.siteUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Chia sẻ lên Facebook
            </a>
            <a
              href="https://www.facebook.com/groups/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Group sinh viên
            </a>
            <a
              href="https://zalo.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Zalo
            </a>
            <a
              href="#forum"
              className="text-blue-600 hover:underline"
            >
              Diễn đàn
            </a>
            <a
              href={`https://www.google.com/search?q=site:${encodeURIComponent(
                siteConfig.siteUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Tìm trên Google
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
