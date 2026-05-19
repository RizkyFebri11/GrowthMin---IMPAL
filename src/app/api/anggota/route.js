import { NextResponse } from 'next/server';
import { supabase } from '../../../config/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Asumsi payload: { nama, email, password, role, tim }
    const { data, error } = await supabase
      .from('users')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Data anggota berhasil disimpan', data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || err.toString() }, { status: 500 });
  }
}
