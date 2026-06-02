import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const file = formData.get('file') as File;

    if (!name || !email || !file) {
      return NextResponse.json({ error: 'Data form tidak lengkap' }, { status: 400 });
    }

    // 1. Generate Order ID
    const orderId = `REQ-${Date.now()}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}.${fileExt}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Upload ke Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('custom-frames')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (storageError) throw storageError;

    // 3. Ambil URL Publik
    const { data: { publicUrl } } = supabase.storage
      .from('custom-frames')
      .getPublicUrl(fileName);

    // 4. Catat di Database
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

    // 5. GENERATE TOKEN MIDTRANS SNAP
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const authString = Buffer.from(`${serverKey}:`).toString('base64');
    
    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: 35000 // Harga custom frame lu, sesuaikan nominalnya
        },
        customer_details: {
          first_name: name,
          email: email
        }
      })
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      throw new Error(midtransData.error_messages?.[0] || 'Gagal generate token pembayaran');
    }

    // 6. Return ke Frontend bawa Snap Token-nya
    return NextResponse.json({ 
      success: true, 
      orderId: orderId,
      publicUrl: publicUrl,
      snapToken: midtransData.token
    });

  } catch (error: any) {
    console.error('Custom Order API Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memproses pesanan' }, { status: 500 });
  }
}