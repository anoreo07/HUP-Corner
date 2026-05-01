import React from 'react';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Điều khoản dịch vụ'),
};


export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-sm">
        <h1 className="text-4xl font-black font-plus-jakarta mb-8 text-on-surface">Điều khoản dịch vụ</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">1. Chấp nhận điều khoản</h2>
            <p>
              Bằng việc truy cập và sử dụng HUP Corner, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. 
              Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">2. Quyền sở hữu trí tuệ</h2>
            <p>
              Mọi tài liệu được đăng tải trên HUP Corner thuộc quyền sở hữu của người đăng tải hoặc được cấp phép sử dụng. 
              Người dùng cam kết chỉ đăng tải các tài liệu mà mình có quyền sở hữu hoặc đã được sự cho phép của chủ sở hữu hợp pháp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">3. Trách nhiệm người dùng</h2>
            <p>
              Người dùng chịu hoàn toàn trách nhiệm về nội dung tài liệu mà mình đăng tải. HUP Corner không chịu trách nhiệm 
              về bất kỳ thiệt hại nào phát sinh từ việc sử dụng các tài liệu được chia sẻ trên nền tảng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">4. Nghiêm cấm hành vi</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Đăng tải tài liệu vi phạm bản quyền, pháp luật Việt Nam.</li>
              <li>Sử dụng ngôn ngữ thiếu văn hóa, công kích cá nhân.</li>
              <li>Spam hoặc cố tình làm gián đoạn dịch vụ của hệ thống.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">5. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào mà không cần thông báo trước. 
              Việc bạn tiếp tục sử dụng dịch vụ sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
