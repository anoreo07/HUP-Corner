'use client';

import { useState } from 'react';
import { Drawer, Button, Title } from 'rizzui';
import { PiXBold, PiQuestionDuotone } from 'react-icons/pi';

interface GuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideDrawer({ isOpen, onClose }: GuideDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right">
      <div className="h-full overflow-y-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <PiQuestionDuotone className="h-6 w-6" />
            <Title as="h2" className="text-xl font-bold text-white">
              Hướng Dẫn Sử Dụng
            </Title>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sky-600 rounded-lg transition"
          >
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tìm Kiếm Tài Liệu</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-10">
              Sử dụng thanh tìm kiếm ở phía trên để tìm kiếm tài liệu theo<strong> tiêu đề hoặc tên môn học</strong>. 
              Bạn có thể tìm kiếm nhanh chóng những gì mình cần.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900">Lọc Theo Ngành Học</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-10">
              Chọn một ngành học từ danh sách bên trái hoặc phần "TÀI LIỆU THEO NGÀNH" để xem tài liệu của ngành đó. 
              Bạn cũng có thể xem <strong>Tất Cả Tài Liệu</strong> từ tất cả các ngành.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900">Xem Chi Tiết Tài Liệu</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-10">
              Nhấp vào một tài liệu để xem chi tiết: tiêu đề, mô tả, tên môn học, năm học, loại tài liệu, v.v. 
              Bạn cũng có thể tải xuống hoặc xem trước tài liệu tại đây.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tải Lên Tài Liệu</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-10">
              Đi tới trang <strong>Upload</strong> để chia sẻ tài liệu của bạn:
            </p>
            <ul className="ml-10 space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span>Chọn ngành học (nếu có)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span>Nhập tiêu đề tài liệu</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span>Chọn loại tài liệu (Đề thi, Slide, Giáo trình, Khác)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span>Kéo/thả hoặc chọn file từ máy tính (hỗ trợ PDF, Word, PowerPoint, hình ảnh)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span>Nhấn "Tải lên" và chờ hoàn tất</span>
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
                5
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quy Trình Duyệt</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-10">
              Sau khi tải lên, tài liệu sẽ chuyển vào trạng thái <strong>"Chờ duyệt"</strong>. 
              Admin sẽ kiểm tra và duyệt tài liệu trong thời gian sớm nhất. 
              Khi được duyệt, tài liệu sẽ xuất hiện công khai trên website.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center">
                6
              </div>
              <h3 className="text-lg font-bold text-gray-900">Góp Ý & Phản Hồi</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-10">
              Có ý tưởng cải tiến hoặc phát hiện lỗi? Vào trang <strong>Góp Ý</strong> để gửi phản hồi của bạn. 
              Chúng tôi rất hoan nghênh mọi đóng góp!
            </p>
          </div>

          {/* Tips */}
          <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-sky-900 flex items-center gap-2">
              💡 Mẹo Hữu Ích
            </h4>
            <ul className="space-y-2 text-sm text-sky-800 ml-6">
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Tên môn học</strong> sẽ tự động viết HOA khi bạn tải lên</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Tệp lớn sẽ được chia nhỏ trước khi gửi để tránh lỗi</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Bạn có thể tải nhiều tài liệu, nhưng mỗi phút tối đa 7 tài liệu</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Hãy đặt tên tài liệu rõ ràng để dễ tìm kiếm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-lg"
          >
            Đã Hiểu
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
