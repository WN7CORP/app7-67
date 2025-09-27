import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface FlashcardsViewerProps {
  courseType?: string;
  areaOrSemestre?: string;
  moduloOrTema?: string;
}

export const FlashcardsViewer = ({ courseType, areaOrSemestre, moduloOrTema }: FlashcardsViewerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Flashcards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Flashcards em breve!</h3>
          <p className="text-muted-foreground">
            Sistema de flashcards personalizados será implementado em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};