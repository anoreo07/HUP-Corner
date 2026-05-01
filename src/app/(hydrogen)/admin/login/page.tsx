'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button, Title, Password } from 'rizzui';
import { PiShieldCheckFill, PiArrowRightBold } from 'react-icons/pi';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn('admin-password', {
        redirect: false,
        password,
      } as any);
      if (res?.ok) {
        router.push('/admin?justLoggedIn=true');
      } else {
        setError('Mật khẩu quản trị viên không chính xác');
        setLoading(false);
      }
    } catch (err) {
      setError('Hệ thống đang gặp sự cố, vui lòng thử lại sau');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[3rem] p-10 shadow-[0px_40px_80px_rgba(13,52,89,0.08)] border border-slate-50 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
                <PiShieldCheckFill className="h-10 w-10" />
              </div>
              <Title as="h2" className="text-3xl font-black text-slate-900 tracking-tight font-plus-jakarta mb-2">
                HUP Corner Control
              </Title>
              <p className="text-slate-400 font-medium text-sm">
                Xác thực quyền truy cập quản trị viên
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu truy cập</label>
                <Password
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="[&>div]:rounded-2xl [&>div]:bg-slate-50 [&>div]:border-none [&_input]:font-bold h-14"
                  error={error}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 gap-2 text-base transition-all active:scale-[0.98]"
                isLoading={loading}
              >
                Tiến vào bảng điều khiển
                <PiArrowRightBold size={18} />
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-50 text-center">
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  Protected by Enterprise Security
               </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
           <button 
            onClick={() => router.push('/')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
           >
              ← Quay về trang chủ
           </button>
        </div>
      </motion.div>
    </div>
  );
}

