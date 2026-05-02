import React from 'react';
import { metaObject } from '@/config/site.config';
import { CloudUpload, ShieldCheck, CheckCircle2, FileText, Info } from 'lucide-react';

export const metadata = {
  ...metaObject('Hướng dẫn tải lên'),
};


export default function UploadGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <CloudUpload size={32} />
          </div>
          <h1 className="text-4xl font-black font-plus-jakarta text-on-surface">Hướng dẫn tải lên</h1>
        </div>

        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center">1</span>
              Quy trình đăng tải
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepCard
                icon={<FileText size={24} />}
                title="Chọn tệp tin"
                desc="Hỗ trợ các định dạng PDF, DOCX, PPTX với dung lượng tối đa 100MB."
              />
              <StepCard
                icon={<Info size={24} />}
                title="Điền thông tin"
                desc="Nhập tiêu đề, chọn môn học và năm học để người khác dễ dàng tìm kiếm."
              />
              <StepCard
                icon={<ShieldCheck size={24} />}
                title="Chờ duyệt"
                desc="Đội ngũ admin sẽ kiểm duyệt nội dung của bạn trong vòng 24 giờ."
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">Tiêu chí tài liệu hợp lệ</h2>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
              <div className="flex gap-4">
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-1" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Nội dung học thuật rõ ràng, không bị nhòe hoặc mất chữ.</p>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-1" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Được phân loại đúng ngành học và môn học.</p>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-1" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Không chứa các thông tin quảng cáo, spam hoặc nội dung độc hại.</p>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-1" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Ưu tiên các tài liệu tự biên soạn, đề thi hoặc slide bài giảng chất lượng cao.</p>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
            <h3 className="text-lg font-bold text-primary mb-2">Bạn cần hỗ trợ?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Nếu bạn gặp khó khăn trong quá trình tải lên hoặc có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.</p>
            <a href="mailto:support@hupcorner.com" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">Gửi Email hỗ trợ</a>
          </section>
        </div>
      </div>
    </div>
  );
}

function StepCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all">
      <div className="text-primary mb-4">{icon}</div>
      <h4 className="font-bold text-on-surface mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
