'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button, Title, ActionIcon } from 'rizzui';
import { 
  PiArrowUpRightBold, 
  PiFilesBold, 
  PiMegaphoneBold, 
  PiSignOutBold,
  PiShieldCheckFill,
  PiLayoutBold,
  PiLightningBold,
  PiUserCircleFill
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import cn from '@core/utils/class-names';

export default function AdminPortalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const justLoggedIn = searchParams.get('justLoggedIn');
    if (justLoggedIn) {
      toast.success('Chào mừng bạn quay trở lại, Admin!');
    }
  }, [status, session, router, searchParams]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Đã đăng xuất an toàn');
    router.push('/admin/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="relative w-16 h-16">
           <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
           <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-400 font-bold tracking-widest text-[10px] uppercase">Hệ thống đang khởi tạo...</p>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    return null;
  }

  const adminName = (session.user as any)?.name || 'Administrator';

  const modules = [
    {
      title: 'Duyệt tài liệu',
      description: 'Quản lý quy trình phê duyệt tài liệu từ sinh viên. Kiểm tra tính xác thực và xuất bản lên hệ thống.',
      href: '/admin/dashboard',
      icon: <PiFilesBold size={28} />,
      color: 'bg-blue-600',
      shadow: 'shadow-blue-100',
      label: 'Core Module'
    },
    {
      title: 'Đăng tài liệu môn học',
      description: 'Công cụ dành riêng cho Admin để đăng tải tài liệu trực tiếp vào các học phần môn học với tính năng tìm kiếm thông minh.',
      href: '/admin/subjects/upload',
      icon: <PiLightningBold size={28} />,
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-100',
      label: 'Academic Content'
    },
    {
      title: 'Thông báo Admin',
      description: 'Đăng tải các thông báo quan trọng, hướng dẫn học tập hiển thị ngay trên đầu trang chủ của người dùng.',
      href: '/admin/notifications',
      icon: <PiMegaphoneBold size={28} />,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-100',
      label: 'Communications'
    }

  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] py-12 md:py-20 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Top Bar / Brand */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                 <PiShieldCheckFill size={18} />
              </div>
              <span className="text-sm font-black tracking-tighter text-slate-900 uppercase">HUP Corner Control</span>
           </div>
           <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
           >
              <PiSignOutBold size={16} />
              Rời khỏi hệ thống
           </button>
        </div>

        {/* Hero Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-8 md:p-12 text-white shadow-2xl"
        >
           <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Quản trị viên trực tuyến</span>
              </div>
              <Title as="h1" className="text-4xl md:text-5xl font-black tracking-tight font-plus-jakarta leading-tight">
                 Xin chào, <span className="text-blue-400">{adminName}</span>
              </Title>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                 Chào mừng bạn đến với trung tâm điều hành HUP Corner. Hãy chọn một phân khu làm việc bên dưới để bắt đầu quản lý.
              </p>
           </div>
           
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent" />
           <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px]" />
           <div className="absolute right-20 bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]" />
        </motion.div>

        {/* Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {modules.map((mod, idx) => (
             <motion.div
               key={mod.href}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * (idx + 1) }}
             >
                <Link href={mod.href} className="group block h-full">
                   <div className="h-full bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-200 transition-all duration-500 relative overflow-hidden">
                      <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-xl transition-transform duration-500 group-hover:scale-110", mod.color, mod.shadow)}>
                         {mod.icon}
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mod.label}</span>
                            <div className="h-px flex-1 bg-slate-50" />
                         </div>
                         <h2 className="text-2xl font-black text-slate-900 font-plus-jakarta group-hover:text-blue-600 transition-colors">{mod.title}</h2>
                         <p className="text-slate-500 font-medium leading-relaxed">{mod.description}</p>
                      </div>
                      
                      <div className="mt-8 flex items-center gap-2 text-xs font-black text-slate-900 group-hover:gap-4 transition-all">
                         BẮT ĐẦU NGAY
                         <PiArrowUpRightBold size={16} />
                      </div>
                      
                      {/* Hover effect decoration */}
                      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-slate-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 -z-10" />
                   </div>
                </Link>
             </motion.div>
           ))}
        </div>

        {/* Stats & Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           {[
             { label: 'Hiệu suất', value: 'Tối ưu', icon: <PiLightningBold />, color: 'text-amber-500' },
             { label: 'Giao diện', value: 'V3.0 Modern', icon: <PiLayoutBold />, color: 'text-indigo-500' },
             { label: 'Phiên làm việc', value: 'Đang bảo mật', icon: <PiShieldCheckFill />, color: 'text-emerald-500' },
           ].map((item) => (
             <div key={item.label} className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center", item.color)}>
                   {item.icon}
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                   <p className="text-sm font-bold text-slate-900">{item.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Footer Info */}
        <div className="text-center pt-8 border-t border-slate-100">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">HUP Corner · Management System · 2026</p>
        </div>

      </div>
    </div>
  );
}


