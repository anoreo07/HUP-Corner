'use client';

import Link from 'next/link';
import cn from '@core/utils/class-names';
import { toast } from 'react-hot-toast';

export default function Footer({ className }: { className?: string }) {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  return (
    <footer
      className={cn(
        'md:ml-56 bg-white dark:bg-slate-900 mt-16 px-6 py-12 border-t border-slate-100 dark:border-slate-800',
        className
      )}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">
                school
              </span>
            </div>
            <span className="text-xl font-extrabold font-plus-jakarta text-primary">
              HUP Corner
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
            Nền tảng chia sẻ tài liệu học tập dành riêng cho sinh viên khối ngành
            khoa học sức khỏe và công nghệ.
          </p>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
              href="mailto:contact@hupcorner.com"
              title="Liên hệ qua Email"
            >
              <span className="material-symbols-outlined text-xl">
                alternate_email
              </span>
            </a>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
              title="Chia sẻ trang này"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
          </div>
        </div>

        {/* Navigation Columns */}
        <div>
          <h4 className="font-bold font-plus-jakarta mb-6 text-on-surface">
            Về chúng tôi
          </h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li>
              <Link href="#" className="hover:text-primary transition-all">
                Giới thiệu HUP Corner
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary transition-all">
                Điều khoản dịch vụ
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary transition-all">
                Chính sách bảo mật
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold font-plus-jakarta mb-6 text-on-surface">
            Liên kết hữu ích
          </h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li>
              <Link href="/upload" className="hover:text-primary transition-all">
                Hướng dẫn tải lên
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-primary transition-all">
                Góp ý hệ thống
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary transition-all">
                Liên hệ hợp tác
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          © 2024 HUP Corner Project. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-xs text-slate-400 hover:text-primary">
            Trợ giúp
          </Link>
          <Link href="#" className="text-xs text-slate-400 hover:text-primary">
            Phản hồi
          </Link>
        </div>
      </div>
    </footer>
  );
}
