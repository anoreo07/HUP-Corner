'use client';

import React, { useState } from 'react';
import { Star, Send, User, UserX, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cn from '@core/utils/class-names';
import { toast } from 'react-hot-toast';

export default function FeedbackForm() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    if (!isAnonymous && !name) {
      toast.error('Vui lòng nhập tên của bạn hoặc chọn ẩn danh');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title,
          content,
          user_name: isAnonymous ? null : name,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsSuccess(true);
      toast.success('Cảm ơn bạn đã gửi đánh giá!');
      
      // Reset form sau 3 giây
      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setContent('');
        setName('');
        setRating(5);
      }, 3000);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container-lowest rounded-lg p-12 shadow-sm text-center border border-green-100 flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-extrabold text-on-surface mb-2">Gửi thành công!</h2>
        <p className="text-on-surface-variant max-w-xs">Đánh giá của bạn đã được ghi nhận và sẽ hiển thị trên cộng đồng ngay lập tức.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-lg p-8 shadow-[0px_20px_40px_rgba(13,52,89,0.04)] border border-slate-100">
      <h2 className="text-2xl font-extrabold text-on-surface mb-2 tracking-tight">Bạn đánh giá website này thế nào?</h2>
      <p className="text-on-surface-variant mb-8 text-sm italic font-medium">&quot;Sự góp ý của bạn là động lực để chúng tôi phát triển.&quot;</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="flex flex-col gap-3 bg-surface-container-low/50 p-4 rounded-2xl border border-slate-50">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline px-1">MỨC ĐỘ HÀI LÒNG</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-125 active:scale-95"
              >
                <Star 
                  size={36} 
                  className={cn(
                    "transition-all duration-300",
                    (hoverRating || rating) >= star 
                      ? "fill-primary text-primary" 
                      : "text-outline-variant"
                  )} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Identity Toggle */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline px-1">CHẾ ĐỘ HIỂN THỊ</span>
          <div className="flex bg-surface-container-low p-1 rounded-full w-fit">
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                isAnonymous ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <UserX size={14} />
              Ẩn danh
            </button>
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                !isAnonymous ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <User size={14} />
              Công khai
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isAnonymous && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline px-1">TÊN CỦA BẠN</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all outline-none placeholder:text-outline-variant text-sm font-medium"
                placeholder="Nhập tên để mọi người biết bạn là ai"
                type="text"
                required={!isAnonymous}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline px-1">TIÊU ĐỀ ĐÁNH GIÁ</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all outline-none placeholder:text-outline-variant text-sm font-medium"
            placeholder="Tóm tắt trải nghiệm của bạn"
            type="text"
            required
          />
        </div>

        {/* Content Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline px-1">NỘI DUNG GÓP Ý</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-[2rem] px-6 py-5 focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all outline-none resize-none placeholder:text-outline-variant text-sm font-medium"
            placeholder="Bạn thích điều gì nhất? Điều gì cần cải thiện?"
            rows={5}
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          disabled={isSubmitting}
          className="w-full py-5 rounded-full bg-gradient-to-br from-primary to-primary-dim text-white font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Star size={20} />
            </motion.div>
          ) : (
            <>
              Gửi đánh giá ngay
              <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
