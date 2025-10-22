import { NextRequest, NextResponse } from 'next/server';
import { BrevoService } from '../../../lib/brevoService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body || {};

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await BrevoService.sendContactEmail({ name, email, subject, message });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: 500 });
  }
}
