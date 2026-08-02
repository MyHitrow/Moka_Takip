import { NextResponse } from 'next/server';
import { processLocalAIChat, buildAgencySystemPrompt, DataContextPayload } from '@/lib/ai-assistant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, data } = body as { message: string; data: DataContextPayload };

    if (!message || !data) {
      return NextResponse.json({ error: 'Geçersiz mesaj veya veritabanı verisi' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    // 1. Eğer OpenAI API anahtarı mevcutsa GPT-4o-mini'yi çağır
    if (process.env.OPENAI_API_KEY) {
      try {
        const systemPrompt = buildAgencySystemPrompt(data);
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const reply = json.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply, source: 'openai' });
          }
        }
      } catch (err) {
        console.error('OpenAI API Error, falling back to local AI engine:', err);
      }
    }

    // 2. Eğer API anahtarı yoksa veya hata aldıysa canlı yerel akıllı AI motorunu kullan
    const localReply = processLocalAIChat(message, data);
    return NextResponse.json({ reply: localReply, source: 'local_engine' });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'AI Chat yanıt verirken bir hata oluştu.' }, { status: 500 });
  }
}
