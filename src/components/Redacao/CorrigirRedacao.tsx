import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, PenTool, Loader2, Upload, CheckCircle, AlertCircle, Star, FileText, Info, Sparkles, Target } from 'lucide-react';
import { useRedacao, TipoRedacao, AnaliseRedacao } from '@/hooks/useRedacao';
import { useRedacaoHistory } from '@/hooks/useRedacaoHistory';
import { usePDFExport } from '@/hooks/usePDFExport';
import { FileUploadZone } from './FileUploadZone';
import { useToast } from '@/hooks/use-toast';

interface CorrigirRedacaoProps {
  onVoltar: () => void;
}

export const CorrigirRedacao = ({ onVoltar }: CorrigirRedacaoProps) => {
  const { toast } = useToast();
  const [texto, setTexto] = useState('');
  const [tipoRedacao, setTipoRedacao] = useState<TipoRedacao>('dissertativa');
  const [arquivoUpload, setArquivoUpload] = useState<{ url: string; texto?: string; nome: string } | null>(null);
  const [tituloRedacao, setTituloRedacao] = useState('');
  const [etapaAtual, setEtapaAtual] = useState<'dados' | 'analise'>('dados');
  
  const { 
    loading, 
    analiseRedacao, 
    error, 
    analisarRedacao, 
    resetAnalise 
  } = useRedacao();
  
  const { salvarAnalise } = useRedacaoHistory();
  const { exporting, exportarAnalise } = usePDFExport();

  const validarDados = () => {
    const temTexto = texto.trim() || arquivoUpload?.texto;
    const temTitulo = tituloRedacao.trim();
    
    if (!temTexto) {
      toast({
        title: "Texto obrigatório",
        description: "Digite sua redação ou faça upload de um arquivo.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!temTitulo) {
      toast({
        title: "Título obrigatório", 
        description: "Digite um título para sua redação.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAnalizar = async () => {
    if (!validarDados()) return;
    
    const textoParaAnalise = arquivoUpload?.texto || texto;
    await analisarRedacao(textoParaAnalise, tipoRedacao);
    setEtapaAtual('analise');
  };

  const handleFileUploaded = (file: { url: string; texto?: string; nome: string }) => {
    setArquivoUpload(file);
    if (file.texto) {
      setTexto(file.texto);
    }
    if (!tituloRedacao) {
      setTituloRedacao(file.nome.replace(/\.[^/.]+$/, ''));
    }
    toast({
      title: "Arquivo carregado!",
      description: "O texto foi extraído e está pronto para análise.",
    });
  };

  const handleNovaAnalise = () => {
    resetAnalise();
    setTexto('');
    setTituloRedacao('');
    setArquivoUpload(null);
    setEtapaAtual('dados');
  };

  const tiposRedacao = [
    { id: 'dissertativa', label: 'Dissertação', desc: 'Texto argumentativo', icon: <PenTool className="h-4 w-4" /> },
    { id: 'parecer', label: 'Parecer', desc: 'Análise técnica', icon: <FileText className="h-4 w-4" /> },
    { id: 'peca', label: 'Peça', desc: 'Petição/Contestação', icon: <Target className="h-4 w-4" /> }
  ];

  const statusPreenchimento = {
    temTitulo: Boolean(tituloRedacao.trim()),
    temTexto: Boolean(texto.trim() || arquivoUpload?.texto)
  };

  const podeAnalizar = statusPreenchimento.temTitulo && statusPreenchimento.temTexto;

  const getNota = () => {
    if (!analiseRedacao?.nota) return null;
    const nota = parseFloat(analiseRedacao.nota);
    
    if (nota >= 9) return { cor: 'from-emerald-500 to-green-600', texto: 'Excelente', emoji: '🏆' };
    if (nota >= 7) return { cor: 'from-blue-500 to-indigo-600', texto: 'Bom', emoji: '👍' };
    if (nota >= 5) return { cor: 'from-yellow-500 to-orange-600', texto: 'Regular', emoji: '⚡' };
    return { cor: 'from-red-500 to-pink-600', texto: 'Precisa melhorar', emoji: '💪' };
  };

  if (etapaAtual === 'analise' && analiseRedacao) {
    const nota = getNota();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header Minimalista */}
        <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoltar}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Análise Completa</h1>
                <p className="text-xs text-slate-400">{tituloRedacao}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNovaAnalise}
                className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
              >
                Nova Análise
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo da Análise */}
        <div className="p-4 max-w-4xl mx-auto space-y-6">
          {error && (
            <Alert className="bg-red-900/20 border-red-500/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Card da Nota */}
          {nota && (
            <Card className="bg-gradient-to-r ${nota.cor} p-6 border-0 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{analiseRedacao.nota}/10</div>
                  <div className="text-lg opacity-90">{nota.texto} {nota.emoji}</div>
                </div>
                <div className="text-5xl opacity-80">{nota.emoji}</div>
              </div>
            </Card>
          )}

          {/* Resumo da Análise */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Info className="h-5 w-5 text-blue-400" />
                Resumo da Análise
              </h3>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {analiseRedacao.resumo}
              </div>
            </div>
          </Card>

          {/* Grid de Pontos Fortes e Melhorias */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pontos Fortes */}
            {analiseRedacao.pontos_fortes && analiseRedacao.pontos_fortes.length > 0 && (
              <Card className="bg-emerald-900/20 backdrop-blur-sm border-emerald-500/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-300">
                    <CheckCircle className="h-5 w-5" />
                    Pontos Fortes
                  </h3>
                  <div className="space-y-3">
                    {analiseRedacao.pontos_fortes.map((ponto, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-emerald-900/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <p className="text-emerald-100 text-sm leading-relaxed">{ponto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Pontos de Melhoria */}
            {analiseRedacao.melhorias && analiseRedacao.melhorias.length > 0 && (
              <Card className="bg-amber-900/20 backdrop-blur-sm border-amber-500/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-300">
                    <Target className="h-5 w-5" />
                    Oportunidades de Melhoria
                  </h3>
                  <div className="space-y-3">
                    {analiseRedacao.melhorias.map((melhoria, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-900/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                        <p className="text-amber-100 text-sm leading-relaxed">{melhoria}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Minimalista */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onVoltar}
            className="text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <PenTool className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Corrigir Redação</h1>
              <p className="text-xs text-slate-400">Análise inteligente com IA</p>
            </div>
          </div>

          <div className="w-20"> {/* Espaçador */}</div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {error && (
          <Alert className="bg-red-900/20 border-red-500/50 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            statusPreenchimento.temTitulo ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {statusPreenchimento.temTitulo ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
            )}
            <span className="text-sm font-medium">Título</span>
          </div>
          
          <div className={`w-12 h-0.5 transition-all duration-300 ${
            statusPreenchimento.temTitulo ? 'bg-emerald-400' : 'bg-slate-600'
          }`} />
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            statusPreenchimento.temTexto ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {statusPreenchimento.temTexto ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
            )}
            <span className="text-sm font-medium">Texto</span>
          </div>
          
          <div className={`w-12 h-0.5 transition-all duration-300 ${
            podeAnalizar ? 'bg-emerald-400' : 'bg-slate-600'
          }`} />
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            podeAnalizar ? 'text-purple-400' : 'text-slate-400'
          }`}>
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Analisar</span>
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título da redação *
            </label>
            <Input
              placeholder="Ex: Análise sobre responsabilidade civil..."
              value={tituloRedacao}
              onChange={(e) => setTituloRedacao(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          {/* Tipo de Redação */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tipo de redação
            </label>
            <div className="grid grid-cols-3 gap-3">
              {tiposRedacao.map((tipo) => (
                <Button
                  key={tipo.id}
                  variant={tipoRedacao === tipo.id ? "default" : "outline"}
                  onClick={() => setTipoRedacao(tipo.id as TipoRedacao)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                    tipoRedacao === tipo.id
                      ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white border-0 scale-105'
                      : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  {tipo.icon}
                  <div className="text-center">
                    <div className="font-medium text-sm">{tipo.label}</div>
                    <div className="text-xs opacity-70">{tipo.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Texto da Redação */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Texto da redação *
            </label>
            
            {/* Textarea Principal */}
            <Textarea
              placeholder="Cole ou digite sua redação aqui..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="min-h-[200px] bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 mb-4"
            />
            
            {/* Upload de Arquivo - Expandível */}
            <div className="border border-slate-600 rounded-lg bg-slate-800/30">
              <Button
                type="button"
                variant="ghost"
                onClick={() => document.getElementById('file-upload-zone')?.click()}
                className="w-full p-4 text-left text-slate-300 hover:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="font-medium">Ou envie um arquivo</div>
                    <div className="text-sm text-slate-400">PDF, DOC, DOCX ou imagem até 10MB</div>
                  </div>
                </div>
              </Button>
              
              <div id="file-upload-zone" className="hidden">
                <FileUploadZone onFileUploaded={handleFileUploaded} />
              </div>
            </div>
            
            {arquivoUpload && (
              <Alert className="mt-3 bg-emerald-900/20 border-emerald-500/50 text-emerald-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Arquivo carregado:</strong> {arquivoUpload.nome}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botão Analisar */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAnalizar}
              disabled={!podeAnalizar || loading}
              className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                podeAnalizar 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-2xl hover:shadow-purple-500/25 hover:scale-105' 
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analisar Redação
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};