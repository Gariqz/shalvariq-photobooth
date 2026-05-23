// app/api/payment/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    // Bikin Order ID unik pake prefix SHALVARIQ
    const order_id = `SHALVARIQ-${Date.now()}`;
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    
    // Encode Server Key ke Base64 untuk otorisasi Midtrans
    const encodedKey = Buffer.from(serverKey + ':').toString('base64');

    const payload = {
      payment_type: 'qris',
      transaction_details: {
        order_id: order_id,
        gross_amount: amount,
      },
      custom_expiry: {
        expiry_duration: 5, // QRIS hangus dalam 5 menit jika tidak dibayar
        unit: 'minute'
      }
    };

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Midtrans Charge Error:", error);
    return NextResponse.json({ error: 'Gagal membuat transaksi QRIS' }, { status: 500 });
  }
}