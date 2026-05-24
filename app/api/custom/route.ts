 // app/api/custom/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Admin/Client backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const file = formData.get('file') as File;

    if (!name || !email || !file) {
      return NextResponse.json({ error: 'Data form tidak lengkap' }, { status: 400 });
    }

    // 1. Generate Order ID unik untuk Midtrans & DB
    const orderId = `REQ-${Date.now()}`;
    
    // 2. Upload file PNG ke Supabase Storage Bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}.${fileExt}`; // Nama file disamain ama Order ID biar gampang dicari
    
    // Convert File object ke Buffer karena berjalan di environment Node.js server
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data: storageData, error: storageError } = await supabase.storage
      .from('custom-frames')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (storageError) throw storageError;

    // 3. Ambil URL Publik dari file yang barusan di-upload
    const { data: { publicUrl } } = supabase.storage
      .from('custom-frames')
      .getPublicUrl(fileName);

    // 4. Insert data awal ke tabel custom_orders (status default: pending)
    const { error: dbError } = await supabase
      .from('custom_orders')
      .insert({
        id: orderId,
        name: name,
        email: email,
        frame_url: publicUrl,
        payment_status: 'pending'
      });

    if (dbError) throw dbError;

    // 5. TODO BESOK: Tembak API Midtrans di sini pake data orderId & nominal harga custom frame
    // Untuk sekarang, kita return sukses dulu beserta orderId-nya
    return NextResponse.json({ 
      success: true, 
      orderId: orderId,
      publicUrl: publicUrl,
      message: 'File berhasil diunggah dan database berhasil dicatat!'
    });

  } catch (error: any) {
    console.error('Custom Order API Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memproses pesanan' }, { status: 500 });
  }
}