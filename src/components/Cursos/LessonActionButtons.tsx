import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Brain, HelpCircle, Download, Loader2 } from 'lucide-react';
import { useLessonContent, type LessonData } from '@/hooks/useLessonContent';
import { LessonSummaryModal } from './LessonSummaryModal';
import { FlashcardsViewer } from './FlashcardsViewer';
import { QuizViewer } from './QuizViewer';
interface LessonActionButtonsProps {
  lesson: LessonData;
}
export const LessonActionButtons = ({
  lesson
}: LessonActionButtonsProps) => {
  const {
    loading,
    generateContent,
    exportToPDF
  } = useLessonContent();
  const [activeModal, setActiveModal] = useState<'summary' | 'flashcards' | 'quiz' | null>(null);
  const [content, setContent] = useState<any>(null);
  const handleGenerateContent = async (type: 'summary' | 'flashcards' | 'quiz') => {
    const generatedContent = await generateContent(lesson, type);
    if (generatedContent) {
      setContent(generatedContent);
      setActiveModal(type);
    }
  };
  const handleExportPDF = async () => {
    if (content && activeModal) {
      await exportToPDF(lesson, content, activeModal);
    }
  };
  return <>
      <div className="grid grid-cols-3 gap-3 mt-6">
        <Button onClick={() => handleGenerateContent('summary')} disabled={loading} variant="outline" className="flex items-center gap-2 h-auto py-3 px-4 text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          <span className="hidden sm:inline">Baixar</span>
          
          <br className="hidden sm:block" />
          <span className="text-xs text-muted-foreground">Resumo</span>
        </Button>

        <Button onClick={() => handleGenerateContent('flashcards')} disabled={loading} variant="outline" className="flex items-center gap-2 h-auto py-3 px-4 text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          <span className="hidden sm:inline">Baixar</span>
          
          <br className="hidden sm:block" />
          <span className="text-xs text-muted-foreground">Flashcards</span>
        </Button>

        <Button onClick={() => handleGenerateContent('quiz')} disabled={loading} variant="outline" className="flex items-center gap-2 h-auto py-3 px-4 text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
          <span className="hidden sm:inline">Baixar</span>
          
          <br className="hidden sm:block" />
          <span className="text-xs text-muted-foreground">Questões</span>
        </Button>
      </div>

      {/* Modais */}
      <LessonSummaryModal isOpen={activeModal === 'summary'} onClose={() => setActiveModal(null)} content={content} lesson={lesson} onExportPDF={handleExportPDF} />

      <FlashcardsViewer isOpen={activeModal === 'flashcards'} onClose={() => setActiveModal(null)} content={content} lesson={lesson} onExportPDF={handleExportPDF} />

      <QuizViewer isOpen={activeModal === 'quiz'} onClose={() => setActiveModal(null)} content={content} lesson={lesson} onExportPDF={handleExportPDF} />
    </>;
};