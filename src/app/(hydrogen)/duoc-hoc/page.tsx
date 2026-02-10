import { metaObject } from '@/config/site.config';
import {
  getMockDocumentsByMajor,
  documentTypeLabels,
} from '@/data/mockDocuments';
import { PiCalendarDuotone, PiArrowRightBold } from 'react-icons/pi';

export const metadata = {
  ...metaObject('Dược học'),
};

export default function DuocHocPage() {
  const documents = getMockDocumentsByMajor('DUOC_HOC');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Dược học</h1>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Chưa có tài liệu nào được chia sẻ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col bg-gradient-to-br from-white via-blue-50 to-sky-100 rounded-xl border border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Content */}
              <div className="flex-1 p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {documentTypeLabels[doc.documentType]}
                </span>
                <h3 className="mt-2 font-semibold text-gray-900 line-clamp-3">
                  {doc.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
                  <PiCalendarDuotone className="h-4 w-4" />
                  <span>{doc.uploadDate}</span>
                </div>
              </div>
              {/* View Button */}
              <button className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 font-bold border-t-2 border-gray-300 hover:bg-red-100 transition-colors">
                XEM CHI TIẾT
                <PiArrowRightBold className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
