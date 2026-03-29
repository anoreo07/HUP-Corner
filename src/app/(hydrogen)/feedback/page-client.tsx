'use client';

import { useState } from 'react';
import { Button, Textarea, Input, Title, Text } from 'rizzui';
import toast from 'react-hot-toast';
import {
  PiPaperPlaneRightDuotone,
  PiShieldCheckDuotone,
  PiChatTextDuotone,
  PiSpinnerGapBold,
} from 'react-icons/pi';

export default function FeedbackPageClient() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Vui lòng nhập nội dung góp ý');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim() || 'Góp ý từ người dùng',
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gửi góp ý thất bại');
      }

      toast.success('Gửi góp ý thành công! Cảm ơn bạn 🎉');
      setSubmitted(true);
      setSubject('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
          <PiChatTextDuotone className="h-8 w-8 text-teal-500" />
        </div>
        <Title as="h1" className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Viết Góp Ý
        </Title>
        <Text className="mt-2 text-gray-500">
          Hãy đưa ý kiến của bạn để chúng tôi có thể cải thiện
        </Text>
      </div>

      {submitted ? (
        /* Success State */
        <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <PiShieldCheckDuotone className="h-8 w-8 text-green-600" />
          </div>
          <Title as="h3" className="mb-2 text-lg font-semibold text-green-800">
            Đã gửi góp ý thành công!
          </Title>
          <Text className="mb-6 text-green-700">
            Cảm ơn bạn đã đóng góp ý kiến. Chúng tôi sẽ xem xét và cải thiện.
          </Text>
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            Gửi góp ý khác
          </Button>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Chủ đề{' '}
                  <span className="text-gray-400">(không bắt buộc)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nhập chủ đề góp ý..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nội dung góp ý{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Chia sẻ ý kiến, đề xuất hoặc phản hồi của bạn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Anonymous Badge */}
          <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
            <PiShieldCheckDuotone className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
            <div>
              <Text className="text-sm font-medium text-teal-800">
                Hoàn toàn ẩn danh
              </Text>
              <Text className="text-xs text-teal-600">
                Góp ý của bạn được gửi hoàn toàn ẩn danh. Chúng tôi không thu
                thập bất kỳ thông tin cá nhân nào — không tên, không email,
                không IP. Hãy thoải mái chia sẻ!
              </Text>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full gap-2 bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50"
            size="lg"
          >
            {loading ? (
              <>
                <PiSpinnerGapBold className="h-5 w-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <PiPaperPlaneRightDuotone className="h-5 w-5" />
                Gửi góp ý
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
