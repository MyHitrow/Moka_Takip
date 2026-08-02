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
    <Card className="p-5 md:p-6 bg-[#17181B] border border-[#2B2D32] panel-shadow flex flex-col justify-between h-full rounded-xl">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#E32636]/10 p-2 rounded-lg text-[#E32636]">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F7F7F8]">Yapılacak İşler & Notlar</h3>
              <p className="text-xs text-[#73767E]">Görevler, duyurular ve haftalık notlar</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs border-[#2B2D32] bg-[#1D1F23] text-[#B5B7BD]">
            {haftalikNotlar.length} Not
          </Badge>
        </div>

        {/* Task/Note input form */}
        <form onSubmit={handleAdd} className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="h-9 rounded-lg border border-[#2B2D32] bg-[#0D0E10] px-2.5 py-1 text-xs font-semibold text-[#F7F7F8] min-w-[120px] max-w-[150px] shrink-0"
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
              className="bg-[#0D0E10] border-[#2B2D32] text-xs h-9 text-[#F7F7F8] placeholder:text-[#73767E]"
            />
            <Button type="submit" size="sm" className="bg-[#E32636] hover:bg-[#FF3545] text-white shrink-0 h-9 font-bold text-xs red-button-shadow">
              <Plus className="w-3.5 h-3.5 mr-1" /> Ekle
            </Button>
          </div>
        </form>

        {/* Notes/Tasks List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {haftalikNotlar.length === 0 ? (
            <p className="text-xs text-[#73767E] text-center py-6">Henüz görev veya not bulunmuyor.</p>
          ) : (
            haftalikNotlar.map((note) => {
              const canDelete =
                currentUser.role === 'super_admin' || note.authorUsername === currentUser.username;

              return (
                <div
                  key={note.id}
                  className="p-3 bg-[#1D1F23] border border-[#2B2D32] rounded-lg relative group transition-colors hover:border-[#34363C]"
                >
                  {/* Business Tag */}
                  {note.client && (
                    <div className="flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3 text-[#E32636]" />
                      <span className="text-[10px] font-extrabold text-[#E32636] bg-[#E32636]/10 px-1.5 py-0.5 rounded">
                        {note.client}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[#F7F7F8] font-medium pr-6 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#2B2D32]/80 flex items-center justify-between text-[11px] text-[#73767E]">
                    <div className="flex items-center gap-1 font-semibold text-[#B5B7BD]">
                      <User className="w-3 h-3 text-[#E32636]" />
                      <span>@{note.authorUsername}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-[10px]">
                        <Clock className="w-3 h-3 mr-1 text-[#73767E]" />
                        {formatDateTr(note.date)}
                      </span>

                      {canDelete && (
                        <button
                          onClick={() => deleteHaftalikNot(note.id)}
                          className="text-[#73767E] hover:text-[#FF3545] transition-colors p-0.5"
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
