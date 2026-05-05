import { NextResponse } from 'next/server';
import { supabase } from '../../../config/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Asumsi payload: { id_kpi, id_manajer, catatan, tanggal }
    const { data, error } = await supabase
      .from('evaluations')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Catatan evaluasi berhasil disimpan', data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
