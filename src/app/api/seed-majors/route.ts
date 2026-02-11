import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// The majors that match the hardcoded routes in the app
const SEED_MAJORS = [
  { code: 'HOA_DUOC', name: 'Hoá Dược' },
  { code: 'CONG_NGHE_SINH_HOC', name: 'Công Nghệ Sinh Học' },
  { code: 'HOA_HOC', name: 'Hoá Học' },
  { code: 'DUOC_HOC', name: 'Dược Học' },
];

export async function POST() {
  try {
    const results = [];

    const supabaseAdmin = getSupabaseAdmin();

    for (const major of SEED_MAJORS) {
      // Check if major already exists
      const { data: existing } = await supabaseAdmin
        .from('majors')
        .select()
        .eq('code', major.code)
        .single();

      if (existing) {
        results.push({ ...major, status: 'already_exists', id: existing.id });
        continue;
      }

      // Insert new major
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('majors')
        .insert({ code: major.code, name: major.name })
        .select()
        .single();

      if (insertError) {
        results.push({ ...major, status: 'error', error: insertError.message });
      } else {
        results.push({ ...major, status: 'created', id: inserted?.id });
      }
    }

    return NextResponse.json({ success: true, majors: results });
  } catch (error: any) {
    console.error('Seed majors error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed majors' },
      { status: 500 }
    );
  }
}
