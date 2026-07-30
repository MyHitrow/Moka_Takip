'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Trash2, User, Clock } from 'lucide-react';
import { useData } from '@/context/data-context';

export function HaftalikNotlar() {
  const { haftalikNotlar, currentUser, addHaftalikNot, deleteHaftalikNot, formatDateTr } = useData();
  const [newNote, setNewNote] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addHaftalikNot(newNote.trim());
    setNewNote('');
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
              <h3 className="font-bold text-base text-foreground">Haftalık Notlar</h3>
              <p className="text-xs text-muted-foreground">Ekip içi duyuru ve haftalık notlar</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {haftalikNotlar.length} Not
          </Badge>
        </div>

        {/* Note input form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Haftalık not ekleyin..."
            className="bg-background text-sm h-9"
          />
          <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-9">
            <Plus className="w-4 h-4 mr-1" /> Ekle
          </Button>
        </form>

        {/* Notes List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {haftalikNotlar.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Henüz haftalık not bulunmuyor.</p>
          ) : (
            haftalikNotlar.map((note) => {
              const canDelete =
                currentUser.role === 'super_admin' || note.authorUsername === currentUser.username;

              return (
                <div
                  key={note.id}
                  className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl relative group transition-colors hover:border-amber-500/40"
                >
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
