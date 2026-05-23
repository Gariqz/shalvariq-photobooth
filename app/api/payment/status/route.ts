// app/api/payment/status/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const encodedKey = Buffer.from(serverKey + ':').toString('base64');

    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      }
    });

    const data = await response.json();
    // Kembalikan status transaksi (misal: 'settlement', 'pending', atau 'expire')
    return NextResponse.json({ status: data.transaction_status });
  } catch (error) {
    console.error("Midtrans Status Error:", error);
    return NextResponse.json({ error: 'Gagal mengecek status transaksi' }, { status: 500 });
  }
}