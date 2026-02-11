import { metaObject } from '@/config/site.config';
import UploadForm from './upload-form';

export const metadata = {
  ...metaObject('Upload Tài Liệu'),
};

export default function UploadPage() {
  return <UploadForm />;
}
