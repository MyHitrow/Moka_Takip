'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Trash2, User, Clock, Building2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export function HaftalikNotlar() {
  const { haftalikNotlar, isletmeler, currentUser, addHaftalikNot, deleteHaftalikNot, formatDateTr } = useData();
  const [newNote, setNewNote] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addHaftalikNot(newNote.trim(), selectedClient || undefined);
    setNewNote('');
    setSelectedClient('');
  };

  return (
    <Card className="p-6 bg-card border border-border flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <StickyNote className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Yapılacak İşler & Notlar</h3>
              <p className="text-xs text-muted-foreground">Görevler, duyurular ve haftalık notlar</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {haftalikNotlar.length} Görev
          </Badge>
        </div>

        {/* Task/Note input form with Business Selection */}
        <form onSubmit={handleAdd} className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold min-w-[120px] max-w-[160px] shrink-0"
            >
              <option value="">Genel Görev</option>
              {isletmeler.map((isletme) => (
                <option key={isletme.id} value={isletme.name}>
                  {isletme.name}
                </option>
              ))}
            </select>
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Görev veya not ekleyin..."
              className="bg-background text-sm h-9"
            />
            <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-9">
              <Plus className="w-4 h-4 mr-1" /> Ekle
            </Button>
          </div>
        </form>

        {/* Notes/Tasks List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {haftalikNotlar.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Henüz görev veya not bulunmuyor.</p>
          ) : (
            haftalikNotlar.map((note) => {
              const canDelete =
                currentUser.role === 'super_admin' || note.authorUsername === currentUser.username;

              return (
                <div
                  key={note.id}
                  className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl relative group transition-colors hover:border-amber-500/40"
                >
                  {/* Business Tag */}
                  {note.client && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <Building2 className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                        {note.client}
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-foreground font-medium pr-6 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <div className="mt-2 pt-2 border-t border-amber-500/15 flex items-center justify-between text-xs text-muted-foreground">
                    {/* Author username display under note */}
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                      <User className="w-3 h-3" />
                      <span>@{note.authorUsername}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">({note.authorName})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-[10px]">
                        <Clock className="w-3 h-3 mr-0.5" />
                        {formatDateTr(note.date)} {note.createdAt}
                      </span>

                      {canDelete && (
                        <button
                          onClick={() => deleteHaftalikNot(note.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
