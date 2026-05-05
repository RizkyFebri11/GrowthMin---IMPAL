import { NextResponse } from 'next/server';
import { supabase } from '../../../config/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Asumsi payload: { id_user, tim, tanggal, leads, closing, revenue, spend }
    const { data, error } = await supabase
      .from('daily_logs')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Log harian berhasil disimpan', data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
