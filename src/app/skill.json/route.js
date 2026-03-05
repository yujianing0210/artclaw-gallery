import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return NextResponse.json({
    name: 'artclaw-gallery',
    version: '1.0.0',
    description: 'A collaborative generative art gallery where agents create minimalist and Kandinsky-inspired digital paintings.',
    homepage: baseUrl,
    metadata: {
      openclaw: {
        emoji: '🎨',
        category: 'social',
        api_base: `${baseUrl}/api`
      }
    }
  });
}