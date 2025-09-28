import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, videoTitle } = await req.json()
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'videoUrl is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create a prompt for video summary
    const prompt = `
    Por favor, forneça um resumo detalhado e estruturado do vídeo: "${videoTitle || 'Vídeo educativo'}"
    URL do vídeo: ${videoUrl}
    
    O resumo deve incluir:
    
    1. **Tema Principal**: Qual é o assunto central abordado no vídeo
    
    2. **Pontos-Chave**: Os principais conceitos, argumentos ou informações apresentadas
    
    3. **Estrutura do Conteúdo**: Como o vídeo está organizado (introdução, desenvolvimento, conclusão)
    
    4. **Informações Importantes**: Dados, estatísticas, exemplos ou casos mencionados
    
    5. **Conclusões**: As principais takeaways ou conclusões do vídeo
    
    6. **Aplicação Prática**: Como o conteúdo pode ser aplicado na prática ou nos estudos
    
    Formate o resumo de forma clara e didática, usando tópicos e subtópicos para facilitar a leitura e compreensão.
    
    Nota: Como não tenho acesso direto ao conteúdo do vídeo, baseie o resumo no título e contexto fornecido, e crie um resumo educativo e útil sobre o tema jurídico correspondente.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    console.log('Video summary generated successfully for:', videoTitle)

    return new Response(
      JSON.stringify({ summary }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating video summary:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate video summary' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // For youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v')
    }
    
    // For youtu.be URLs
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1)
    }
    
    return null
  } catch {
    return null
  }
}