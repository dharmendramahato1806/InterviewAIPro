import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume');

    if (!file) {
      return NextResponse.json({ text: '' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';
    if (file.name.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      text = buffer.toString('utf8');
    }

    return NextResponse.json({ text: text.substring(0, 8000) });
  } catch (err) {
    console.error('parse-resume error:', err.message);
    return NextResponse.json({ error: 'Failed to parse resume', text: '' }, { status: 500 });
  }
}
