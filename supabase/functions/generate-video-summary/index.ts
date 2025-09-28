import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, title } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extrair ID do vídeo do YouTube
    const videoId = videoUrl?.split('v=')[1]?.split('&')[0];
    
    if (!videoId) {
      throw new Error('URL de vídeo inválida');
    }

    // Simular transcrição (em produção, você usaria YouTube API ou serviço de transcrição)
    const mockTranscription = `
    Este é um vídeo educativo sobre ${title}. 
    O conteúdo aborda conceitos fundamentais jurídicos, 
    explicando de forma didática os principais pontos do tema. 
    São apresentados exemplos práticos e casos reais para melhor compreensão.
    O vídeo também inclui dicas importantes para aplicação prática do conhecimento.
    `;

    // Gerar resumo usando OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em resumir conteúdo educativo jurídico. Crie resumos claros, objetivos e organizados.'
          },
          {
            role: 'user',
            content: `Por favor, crie um resumo estruturado do seguinte conteúdo de vídeo educativo jurídico:

Título: ${title}
Transcrição: ${mockTranscription}

O resumo deve incluir:
- Principais conceitos abordados
- Pontos-chave importantes
- Aplicações práticas mencionadas

Mantenha o resumo conciso mas informativo (máximo 200 palavras).`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        summary,
        videoId,
        title 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-video-summary function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        summary: "Não foi possível gerar o resumo automaticamente. Por favor, tente novamente mais tarde."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});