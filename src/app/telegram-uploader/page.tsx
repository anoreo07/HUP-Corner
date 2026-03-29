'use client';

import { TelegramFileUploader } from '@/components/telegram-file-uploader';

export default function TelegramUploaderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:to-black p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            📤 Telegram File Uploader
          </h1>
          <p className="text-gray-300 text-lg">
            Gửi file trực tiếp tới Telegram Bot API với progress bar
          </p>
        </div>

        {/* Main Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <TelegramFileUploader />
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              ⚡ Fast Upload
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bypass Vercel 413 limit bằng cách gửi file trực tiếp từ browser
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              🔒 Secure Token
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bot Token được bảo vệ ở server-side, không lộ ở client
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              📊 Progress Bar
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time upload progress tracking với percentage display
            </p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6">
            🚀 Quick Setup
          </h2>

          <ol className="space-y-4 text-blue-800 dark:text-blue-200">
            <li className="flex gap-4">
              <span className="font-bold flex-shrink-0">1.</span>
              <div>
                <p className="font-semibold">Add environment variables to `.env.local`:</p>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-2 overflow-x-auto text-sm">
{`TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHANNEL_ID=-1001234567890
NEXT_PUBLIC_TELEGRAM_CHANNEL_ID=-1001234567890`}
                </pre>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="font-bold flex-shrink-0">2.</span>
              <div>
                <p className="font-semibold">Get Bot Token from @BotFather on Telegram</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  ⚠️ Never share your token publicly
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="font-bold flex-shrink-0">3.</span>
              <div>
                <p className="font-semibold">Restart your Next.js dev server</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Changes to `.env.local` require a restart
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="font-bold flex-shrink-0">4.</span>
              <div>
                <p className="font-semibold">Start uploading files!</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Drag & drop or click to select files
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Security Notes */}
        <div className="mt-8 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-6">
            🔐 Security Best Practices
          </h2>

          <ul className="space-y-3 text-amber-800 dark:text-amber-200">
            <li className="flex gap-3">
              <span>✓</span>
              <span>
                <strong>.env.local</strong> không bao giờ commit lên Git
              </span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>
                <strong>TELEGRAM_BOT_TOKEN</strong> chỉ dùng ở server-side
              </span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>
                <strong>/api/telegram/upload-proxy</strong> validate request trước gửi
              </span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>
                Thêm <strong>rate limiting</strong> để bảo vệ khỏi abuse
              </span>
            </li>
            <li className="flex gap-3">
              <span>✓</span>
              <span>
                Thêm <strong>authentication</strong> nếu cần
              </span>
            </li>
          </ul>
        </div>

        {/* File Usage */}
        <div className="mt-8 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-6">
            📁 Files Created
          </h2>

          <div className="space-y-3 font-mono text-sm text-green-800 dark:text-green-200">
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <code>src/components/telegram-file-uploader.tsx</code>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                React component with progress bar
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <code>src/app/api/telegram/upload-proxy/route.ts</code>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Secure API route - protects Bot Token
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <code>src/hooks/use-file-uploader.ts</code>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Reusable hook for other components
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <code>TELEGRAM_UPLOADER_SETUP.md</code>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Detailed setup & security documentation
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p className="text-sm">
            Built with Next.js, React, Tailwind CSS & Telegram Bot API
          </p>
          <p className="text-xs mt-2">
            Để chi tiết setup: xem file{' '}
            <code className="bg-gray-800 px-2 py-1 rounded">
              TELEGRAM_UPLOADER_SETUP.md
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
