import { getSubjects } from '@/lib/supabase';
import { metaObject } from '@/config/site.config';
import SubjectsList from '@/app/shared/subjects-list';

export const metadata = {
  ...metaObject('Danh sách môn học'),
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <SubjectsList initialSubjects={subjects} />
    </div>
  );

}

