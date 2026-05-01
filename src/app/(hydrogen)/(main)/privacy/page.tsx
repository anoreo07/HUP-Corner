import React from 'react';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Chính sách bảo mật'),
};


export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-sm">
        <h1 className="text-4xl font-black font-plus-jakarta mb-8 text-on-surface">Chính sách bảo mật</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-400">
          <p className="italic">Cập nhật lần cuối: Tháng 4, 2024</p>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">1. Thông tin chúng tôi thu thập</h2>
            <p>
              Khi bạn sử dụng HUP Corner, chúng tôi có thể thu thập các thông tin sau:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Thông tin tài khoản: Tên, email (nếu đăng nhập).</li>
              <li>Thông tin tài liệu: Nội dung, tiêu đề, và siêu dữ liệu của file bạn tải lên.</li>
              <li>Dữ liệu kỹ thuật: Địa chỉ IP, loại trình duyệt để đảm bảo an ninh hệ thống.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
            <p>
              Thông tin của bạn được sử dụng để:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cung cấp và duy trì các tính năng của HUP Corner.</li>
              <li>Kiểm duyệt và hiển thị tài liệu học tập một cách chính xác.</li>
              <li>Cải thiện trải nghiệm người dùng và phát triển tính năng mới.</li>
              <li>Liên hệ khi có thông báo quan trọng về tài liệu của bạn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">3. Chia sẻ thông tin</h2>
            <p>
              HUP Corner cam kết không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại. 
              Thông tin chỉ được chia sẻ khi có yêu cầu từ pháp luật hoặc để bảo vệ quyền lợi hợp pháp của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">4. Bảo mật dữ liệu</h2>
            <p>
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ dữ liệu của bạn khỏi việc truy cập, 
              sửa đổi hoặc tiêu hủy trái phép. Tuy nhiên, không có phương thức truyền tải qua Internet nào là an toàn 100%.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">5. Quyền của bạn</h2>
            <p>
              Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân mà chúng tôi đang lưu trữ. 
              Vui lòng liên hệ với chúng tôi qua email để thực hiện các quyền này.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
