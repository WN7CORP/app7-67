import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnaliseRedacao {
  resumo: string;
  nota: string;
  pontos_fortes: string[];
  melhorias: string[];
}

export interface DicasRedacao {
  estrutura: string;
  dicas: string[];
  criterios: string[];
}

export type TipoRedacao = 'dissertativa' | 'parecer' | 'peca';

export const useRedacao = () => {
  const [loading, setLoading] = useState(false);
  const [analiseRedacao, setAnaliseRedacao] = useState<AnaliseRedacao | null>(null);
  const [dicasRedacao, setDicasRedacao] = useState<DicasRedacao | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analisarRedacao = async (texto: string, tipo: TipoRedacao) => {
    setLoading(true);
    setError(null);
    
    try {
      let prompt = '';
      
      switch (tipo) {
        case 'dissertativa':
          prompt = `Analise esta redação dissertativa jurídica e forneça:

1. Um resumo da análise (máximo 150 palavras)
2. Uma nota de 0 a 10 (considere: argumentação, coesão, conhecimento jurídico, estrutura)
3. Lista de pontos fortes encontrados
4. Lista de sugestões específicas de melhoria

Critérios de avaliação:
- Domínio do tema jurídico
- Clareza e coesão textual
- Estrutura dissertativa (intro, desenvolvimento, conclusão)
- Fundamentação legal adequada
- Linguagem jurídica apropriada

Texto para análise:
"${texto}"

Responda APENAS no formato JSON:
{
  "resumo": "string",
  "nota": "string",
  "pontos_fortes": ["string"],
  "melhorias": ["string"]
}`;
          break;
          
        case 'parecer':
          prompt = `Analise este parecer jurídico e forneça:

1. Um resumo da análise (máximo 150 palavras)
2. Uma nota de 0 a 10 (considere: análise técnica, fundamentação, conclusão)
3. Lista de pontos fortes encontrados
4. Lista de sugestões específicas de melhoria

Critérios de avaliação:
- Análise técnica precisa
- Fundamentação jurídica sólida
- Estrutura de parecer (relatório, fundamentos, conclusão)
- Citação adequada de normas e jurisprudência
- Objetividade e clareza

Texto para análise:
"${texto}"

Responda APENAS no formato JSON:
{
  "resumo": "string",
  "nota": "string", 
  "pontos_fortes": ["string"],
  "melhorias": ["string"]
}`;
          break;
          
        case 'peca':
          prompt = `Analise esta peça processual e forneça:

1. Um resumo da análise (máximo 150 palavras)
2. Uma nota de 0 a 10 (considere: técnica processual, fundamentação, estrutura)
3. Lista de pontos fortes encontrados
4. Lista de sugestões específicas de melhoria

Critérios de avaliação:
- Técnica processual correta
- Fundamentação jurídica consistente
- Estrutura adequada da peça
- Pedidos claros e fundamentados
- Linguagem forense apropriada

Texto para análise:
"${texto}"

Responda APENAS no formato JSON:
{
  "resumo": "string",
  "nota": "string",
  "pontos_fortes": ["string"], 
  "melhorias": ["string"]
}`;
          break;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao analisar redação');
      }

      if (!data || !data.success) {
        throw new Error((data && data.error) || 'Erro ao processar resposta da IA');
      }

      // Tentar parsear JSON da resposta
      let analise: AnaliseRedacao;
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : data.response;
        analise = JSON.parse(jsonStr);
      } catch (parseError) {
        // Fallback se não conseguir parsear
        analise = {
          resumo: 'Análise concluída. Verifique os aspectos estruturais e de conteúdo do texto.',
          nota: '7.0',
          pontos_fortes: ['Texto bem estruturado'],
          melhorias: ['Revise a fundamentação jurídica', 'Melhore a conclusão']
        };
      }

      setAnaliseRedacao(analise);
    } catch (err) {
      console.error('Erro ao analisar redação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const buscarDicas = async (tipo: TipoRedacao) => {
    setLoading(true);
    setError(null);
    
    try {
      let prompt = '';
      
      switch (tipo) {
        case 'dissertativa':
          prompt = `Forneça dicas completas para redação dissertativa jurídica:

1. Estrutura ideal do texto dissertativo jurídico
2. Lista de 8-10 dicas práticas específicas
3. Principais critérios de avaliação

Foque em:
- Estrutura (introdução, desenvolvimento, conclusão)
- Argumentação jurídica sólida
- Uso adequado da linguagem jurídica
- Fundamentação legal
- Coesão e clareza

Responda APENAS no formato JSON:
{
  "estrutura": "string descrevendo a estrutura ideal",
  "dicas": ["dica1", "dica2", ...],
  "criterios": ["criterio1", "criterio2", ...]
}`;
          break;
          
        case 'parecer':
          prompt = `Forneça dicas completas para elaboração de parecer jurídico:

1. Estrutura ideal do parecer jurídico
2. Lista de 8-10 dicas práticas específicas  
3. Principais critérios de avaliação

Foque em:
- Estrutura (relatório, fundamentos, conclusão)
- Análise técnica objetiva
- Fundamentação jurídica consistente
- Citação de normas e jurisprudência
- Linguagem técnica precisa

Responda APENAS no formato JSON:
{
  "estrutura": "string descrevendo a estrutura ideal",
  "dicas": ["dica1", "dica2", ...],
  "criterios": ["criterio1", "criterio2", ...]
}`;
          break;
          
        case 'peca':
          prompt = `Forneça dicas completas para elaboração de peças processuais:

1. Estrutura ideal da peça processual
2. Lista de 8-10 dicas práticas específicas
3. Principais critérios de avaliação

Foque em:
- Estrutura formal da peça
- Técnica processual adequada
- Fundamentação jurídica
- Pedidos claros e específicos
- Linguagem forense apropriada

Responda APENAS no formato JSON:
{
  "estrutura": "string descrevendo a estrutura ideal",
  "dicas": ["dica1", "dica2", ...], 
  "criterios": ["criterio1", "criterio2", ...]
}`;
          break;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao buscar dicas');
      }

      if (!data || !data.success) {
        throw new Error((data && data.error) || 'Erro ao processar resposta da IA');
      }

      // Tentar parsear JSON da resposta
      let dicas: DicasRedacao;
      try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : data.response;
        dicas = JSON.parse(jsonStr);
      } catch (parseError) {
        // Fallback se não conseguir parsear
        dicas = {
          estrutura: 'Estruture seu texto com introdução, desenvolvimento e conclusão.',
          dicas: [
            'Use linguagem jurídica apropriada',
            'Fundamente com base legal',
            'Mantenha clareza e objetividade',
            'Revise antes de finalizar'
          ],
          criterios: ['Estrutura', 'Fundamentação', 'Clareza', 'Linguagem']
        };
      }

      setDicasRedacao(dicas);
    } catch (err) {
      console.error('Erro ao buscar dicas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalise = () => {
    setAnaliseRedacao(null);
    setDicasRedacao(null);
    setError(null);
  };

  return {
    loading,
    analiseRedacao,
    dicasRedacao,
    error,
    analisarRedacao,
    buscarDicas,
    resetAnalise
  };
};