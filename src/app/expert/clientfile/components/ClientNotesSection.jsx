"use client";

import React from "react";
import { Edit3, Send } from "lucide-react";

export default function ClientNotesSection({
  notes,
  newNote,
  setNewNote,
  isSavingNote,
  onAddNote,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
      <h3 className="text-base font-black text-white flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-[#EA580C]" /> Uzman Notları & Değerlendirmeler
      </h3>
      <form onSubmit={onAddNote} className="space-y-3">
        <textarea
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Danışan hakkında teknik not ekleyin..."
          className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-4 rounded-2xl outline-none focus:border-[#EA580C] transition-all"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSavingNote || !newNote.trim()}
            className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-[#EA580C]/20 transition-all"
          >
            <Send size={14} />{" "}
            <span>{isSavingNote ? "KAYDEDİLİYOR..." : "NOTU KAYDET"}</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note.id || `note-${index}`}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1.5"
            >
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span className="text-[#EA580C]">{note.author || "Uzman PT"}</span>
                <span>{note.created_at || note.date || "Bugün"}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {note.note_text || note.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">
            Bu danışan hakkında henüz kayıtlı bir uzman notu bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}