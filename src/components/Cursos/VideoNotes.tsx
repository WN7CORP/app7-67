import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Save,
  X 
} from 'lucide-react';
import { useVideoNotes, VideoNote } from '@/hooks/useCourseEnhancements';

interface VideoNotesProps {
  videoUrl: string;
  currentTime: number;
  onSeekTo: (time: number) => void;
}

export const VideoNotes = ({ videoUrl, currentTime, onSeekTo }: VideoNotesProps) => {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useVideoNotes(videoUrl);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    
    try {
      await addNote(Math.floor(currentTime), newNoteText);
      setNewNoteText('');
      setShowAddNote(false);
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editText.trim()) return;
    
    try {
      await updateNote(noteId, editText);
      setEditingNote(null);
      setEditText('');
    } catch (error) {
      console.error('Erro ao editar nota:', error);
    }
  };

  const startEditing = (note: VideoNote) => {
    setEditingNote(note.id);
    setEditText(note.note_text);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditText('');
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="h-5 w-5" />
            Anotações ({notes.length})
          </CardTitle>
          <Button
            onClick={() => setShowAddNote(true)}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova Nota
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Formulário para nova anotação */}
        {showAddNote && (
          <div className="p-4 border-b border-border bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Tempo: {formatTime(currentTime)}
              </div>
              <Textarea
                placeholder="Digite sua anotação..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddNote}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNoteText('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de anotações */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando anotações...
            </div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma anotação ainda</p>
              <p className="text-sm">
                Clique em "Nova Nota" para adicionar sua primeira anotação no vídeo
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  {/* Header da nota */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => onSeekTo(note.timestamp_seconds)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(note.timestamp_seconds)}
                    </Badge>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => startEditing(note)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteNote(note.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo da nota */}
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditNote(note.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {note.note_text}
                    </p>
                  )}

                  {/* Timestamp da criação */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};