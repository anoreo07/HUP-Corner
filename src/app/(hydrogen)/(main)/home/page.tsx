import { metaObject } from '@/config/site.config';
import { getApprovedDocumentsPaginated, getMajors, getNotifications } from '@/lib/supabase';
import HomeDashboardClient from '@/app/shared/home-dashboard-client';
import AnnouncementBanner from '@/app/shared/announcement-banner';
import Image from 'next/image';
import Link from 'next/link';
import { Major } from '@/types/database';

export const metadata = {
  ...metaObject('Trang chủ'),
};


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Get all approved documents
  const { data: documents } = await getApprovedDocumentsPaginated(undefined, 1, 20);

  // Get majors list
  let majors: Major[] = [];
  try {
    majors = (await getMajors()) || [];
  } catch (err) {
    // Error loading majors
  }

  // Get notifications
  let notifications: string | any[] = [];
  try {
    notifications = (await getNotifications()) || [];
  } catch (err) {
    // Error loading notifications
  }

  const featuredDocuments = documents.slice(0, 6);
  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Admin Notification */}
      <AnnouncementBanner notifications={notifications} />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10 mx-4 mt-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-secondary-container px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs font-bold text-on-secondary-container uppercase tracking-wider">
              Mới cập nhật
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-plus-jakarta tracking-tight text-on-surface leading-tight">
            Tài liệu học tập <br />
            <span className="text-primary">tốt nhất cho bạn</span>
          </h1>
          <p className="text-slate-600 max-w-lg leading-relaxed">
            Khám phá kho lưu trữ học thuật khổng lồ từ các giảng viên và sinh
            viên hàng đầu. HUP Corner là không gian để bạn nghiên cứu và sẻ chia
            tri thức.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/all-majors">
              <div className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95">
                Bắt đầu khám phá
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">

            {/* LOGO thay cho toàn bộ vòng tròn */}
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain rounded-full"
            />
            <div className="absolute top-6 right-6 bg-white p-3 rounded-xl shadow-xl border border-outline-variant/10 rotate-12">
              <span className="material-symbols-outlined text-tertiary">
                verified
              </span>
            </div>

            <div className="absolute bottom-6 left-6 bg-white p-3 rounded-xl shadow-xl border border-outline-variant/10 -rotate-6">
              <span className="material-symbols-outlined text-red-500">
                favorite
              </span>
            </div>

          </div>
        </div>
      </section>

      <HomeDashboardClient
        featuredDocuments={featuredDocuments}
        recentDocuments={recentDocuments}
        majors={majors}
      />
    </div>
  );
}
