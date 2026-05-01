import React from 'react';
import FeedbackForm from './feedback-form';
import ReviewList from './review-list';
import { Verified, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Góp ý'),
};


export default function FeedbackPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Feedback Form & Decoration */}
        <section className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <FeedbackForm />
          
          {/* Visual Decoration Card */}
          <div className="relative overflow-hidden rounded-lg h-56 bg-secondary-container group shadow-sm">
            <Image 
              fill
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="HUP Corner aesthetic"

              src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent flex flex-col justify-end p-8">
              <p className="text-white font-black text-xl leading-tight font-plus-jakarta">
                Góp ý của bạn là tài sản quý giá nhất của HUP Corner.

              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Community Reviews */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-plus-jakarta">Cộng đồng đánh giá</h2>
              <p className="text-on-surface-variant text-sm mt-1 font-medium">Hàng trăm học viên đã chia sẻ cảm nghĩ về HUP Corner.</p>

            </div>
            <div className="flex gap-2">
              <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100 shadow-sm">
                <Verified size={14} className="fill-green-600 text-white" />
                Xác thực
              </span>
            </div>
          </div>

          {/* List of reviews */}
          <ReviewList />
        </section>
      </div>
    </div>
  );
}
