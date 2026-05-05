import { NextResponse } from 'next/server';
import { supabase } from '../../../../config/supabase';

export async function POST(request) {
  try {
    const { bulan, tahun, id_user } = await request.json();
    
    // 1. Ambil Data Target
    const { data: targetData } = await supabase
      .from('targets')
      .select('*')
      .eq('bulan', bulan)
      .eq('tahun', tahun)
      .eq('id_user', id_user)
      .single();
      
    // 2. Ambil Data Log Harian
    const startPath = `${tahun}-${bulan.toString().padStart(2, '0')}-01`;
    const endPath = `${tahun}-${bulan.toString().padStart(2, '0')}-31`;
    
    const { data: logsData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('id_user', id_user)
      .gte('tanggal', startPath)
      .lte('tanggal', endPath);
      
    // 3. Hitung Hasil ROAS dan Score
    let totalRevenue = 0;
    let totalSpend = 0;
    let totalLeads = 0;
    let totalClosing = 0;
    
    if (logsData) {
      logsData.forEach(log => {
        totalRevenue += log.nominal_revenue || 0;
        totalSpend += log.nominal_spend || 0;
        totalLeads += log.jml_leads || 0;
        totalClosing += log.jml_closing || 0;
      });
    }
    
    const avg_roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const perf_score = targetData ? (totalRevenue / (targetData.target_revenue || 1)) * 100 : 0;

    const payload = {
      id_user,
      bulan,
      tahun,
      total_leads: totalLeads,
      total_closing: totalClosing,
      total_revenue: totalRevenue,
      avg_roas,
      perf_score
    };

    // 4. Simpan Hasil KPI
    const { data: kpiData, error } = await supabase
      .from('kpi_results')
      .insert([payload])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'KPI berhasil dihitung dan disimpan', data: kpiData }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

