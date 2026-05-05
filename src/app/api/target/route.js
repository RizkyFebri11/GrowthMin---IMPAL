import { NextResponse } from 'next/server';
import { supabase } from '../../../config/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Asumsi payload: { bulan, tahun, tim, target_leads, target_closing, target_revenue }
    const { data, error } = await supabase
      .from('targets')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Data target berhasil disimpan', data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
