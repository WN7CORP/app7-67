import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface QuizViewerProps {
  courseType: string;
  areaOrSemestre: string;
  moduloOrTema: string;
}

export const QuizViewer = ({ courseType, areaOrSemestre, moduloOrTema }: QuizViewerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Quiz Interativo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Quizzes em breve!</h3>
          <p className="text-muted-foreground">
            Sistema de quizzes interativos será implementado em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};