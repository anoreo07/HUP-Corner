import { metaObject } from '@/config/site.config';
import FeedbackPageClient from './page-client';

export const metadata = {
  ...metaObject('Góp Ý'),
};

export default function GopYPage() {
  return <FeedbackPageClient />;
}
