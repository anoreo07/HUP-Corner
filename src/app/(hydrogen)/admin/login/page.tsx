'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button, Input, Title, Password } from 'rizzui';
import { PiLockKeyBold } from 'react-icons/pi';

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
        router.push('/admin/dashboard');
      } else {
        setError((res as any)?.error || 'Mật khẩu không đúng');
        setLoading(false);
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <PiLockKeyBold className="h-8 w-8 text-red-600" />
          </div>
          <Title as="h2" className="text-2xl font-bold text-gray-900">
            Đăng nhập Admin
          </Title>
          <p className="mt-2 text-sm text-gray-500">
            Nhập mật khẩu để truy cập trang quản trị
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Password
            label="Mật khẩu"
            placeholder="Nhập mật khẩu admin..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            error={error}
          />

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            isLoading={loading}
          >
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
