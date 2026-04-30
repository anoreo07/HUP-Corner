import React from 'react';
import { getSiteReviews } from '@/lib/supabase';
import { Star, Verified, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import cn from '@core/utils/class-names';

export default async function ReviewList() {
  const reviews = await getSiteReviews();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-lg p-12 text-center border-2 border-dashed border-slate-200">
        <p className="text-on-surface-variant font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[1200px] overflow-y-auto no-scrollbar pr-2 pb-10">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="bg-surface-container-lowest rounded-lg p-6 shadow-sm border border-slate-100 group hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm",
                review.is_anonymous ? "bg-slate-100 text-slate-400" : "bg-primary-container text-primary"
              )}>
                {review.is_anonymous ? <User size={20} /> : (review.user_name?.charAt(0).toUpperCase() || 'U')}
              </div>
              <div>
                <h4 className="font-extrabold text-on-surface leading-none">
                  {review.is_anonymous ? 'Người dùng ẩn danh' : review.user_name}
                </h4>
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider mt-1 block">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: vi })}
                </span>
              </div>
            </div>
            <div className="flex gap-0.5 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < review.rating ? "fill-primary" : "text-outline-variant"} 
                />
              ))}
            </div>
          </div>
          
          <div className="pl-15">
            <h5 className="font-bold text-primary mb-2 text-base">{review.title}</h5>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {review.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
