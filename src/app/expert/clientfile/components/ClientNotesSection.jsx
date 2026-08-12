"use client";

import React from "react";
import { Edit3, Send, Clock, User, FileText, Loader2 } from "lucide-react";

export default function ClientNotesSection({
  notes = [],
  newNote,
  setNewNote,
  isSavingNote,
  onAddNote,
}) {
  return (
    <div className="relative overflow-hidden bg-[#11142D]/95 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(79,70,229,0.15)] space-y-6 transition-all duration-300">
      {/* BAŞLIK VE SAYAÇ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-orange-300 rounded-2xl border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex-shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-heading font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
              Uzman Notları & Değerlendirmeler
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Danışanın süreci, gelişimi ve teknik takipleri için özel notlar
            </p>
          </div>
        </div>
        <span className="self-start sm:self-center px-3.5 py-1.5 bg-[#11142D] border border-slate-700/80 text-slate-200 text-xs font-heading font-extrabold rounded-full flex items-center gap-1.5 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          {notes.length} Not
        </span>
      </div>

      {/* NOT EKLEME FORMU */}
      <form onSubmit={onAddNote} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Danışan hakkında teknik not, ölçüm detayları veya özel talimatlar ekleyin..."
            className="w-full bg-[#11142D] border border-slate-700/80 text-white text-xs p-4 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all duration-300 placeholder:text-slate-400 resize-none shadow-inner"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] text-slate-300 font-medium">
            * Eklenen notlar yalnızca uzman panelinde görünür.
          </span>

          <button
            type="submit"
            disabled={isSavingNote || !newNote.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-heading font-black rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] border border-orange-400/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
          >
            {isSavingNote ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>KAYDEDİLİYOR...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>NOTU KAYDET</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* NOTLAR LİSTESİ */}
      <div className="space-y-3 pt-2">
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note.id || `note-${index}`}
              className="group bg-[#11142D] hover:bg-slate-900/90 p-4 md:p-5 rounded-2xl border border-slate-700/80 hover:border-orange-500/50 transition-all duration-300 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]"
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-orange-300 font-heading font-bold drop-shadow">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  <span>{note.author || "Uzman PT"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{note.created_at || note.date || "Bugün"}</span>
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans pl-0.5">
                {note.note_text || note.text}
              </p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-[#11142D] rounded-2xl border border-dashed border-slate-700/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Bu danışan hakkında henüz kayıtlı bir uzman notu bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}