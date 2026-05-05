import { NextResponse } from 'next/server';
import { supabase } from '../../../config/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    let query = supabase
      .from('kpi_results')
      .select('*, evaluations(*)') // Asumsi relasi kpi_results dengan evaluations
      .order('perf_score', { ascending: false });

    if (bulan) query = query.eq('bulan', bulan);
    if (tahun) query = query.eq('tahun', tahun);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Laporan Performa berhasil diambil', data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
