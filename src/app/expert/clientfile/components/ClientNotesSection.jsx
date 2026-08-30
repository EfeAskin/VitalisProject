"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Send,
  Clock,
  FileText,
  Loader2,
  Dumbbell,
  Apple,
  ShieldCheck,
} from "lucide-react";

export default function ClientNotesSection({
  notes = [],
  newNote,
  setNewNote,
  isSavingNote,
  onAddNote,
}) {
  const [localAddedNotes, setLocalAddedNotes] = useState([]);

  const getRoleBadge = (role) => {
    const roleText = typeof role === "string" ? role.trim() : "";
    const roleLower = roleText.toLowerCase();

    if (!roleText) {
      return null;
    }

    if (
      roleLower.includes("diyetisyen") ||
      roleLower.includes("dietitian") ||
      roleLower.includes("beslenme") ||
      roleLower.includes("nutrition") ||
      roleLower.includes("klinik")
    ) {
      return {
        label: roleText,
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        icon: <Apple className="w-3 h-3 text-emerald-400" />,
        glow: "shadow-[0_0_12px_rgba(16,185,129,0.2)]",
      };
    }

    if (
      roleLower.includes("trainer") ||
      roleLower.includes("antrenor") ||
      roleLower.includes("antrenör") ||
      roleLower.includes("fitness") ||
      roleLower.includes("koç") ||
      roleLower.includes("koc") ||
      /\bpt\b/i.test(roleLower)
    ) {
      return {
        label: roleText,
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        icon: <Dumbbell className="w-3 h-3 text-amber-400" />,
        glow: "shadow-[0_0_12px_rgba(245,158,11,0.2)]",
      };
    }

    return {
      label: roleText,
      bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      icon: <ShieldCheck className="w-3 h-3 text-indigo-400" />,
      glow: "shadow-[0_0_12px_rgba(99,102,241,0.2)]",
    };
  };

  const displayedNotes = useMemo(() => {
    const serverNoteIds = new Set(
      notes
        .map((note) => note?.id)
        .filter((id) => id !== undefined && id !== null)
    );

    const localNotes = localAddedNotes.filter(
      (note) => !serverNoteIds.has(note?.id)
    );

    return [...localNotes, ...notes];
  }, [localAddedNotes, notes]);

  useEffect(() => {
    if (!notes.length || !localAddedNotes.length) {
      return;
    }

    const serverNoteIds = new Set(
      notes
        .map((note) => note?.id)
        .filter((id) => id !== undefined && id !== null)
    );

    setLocalAddedNotes((current) =>
      current.filter((note) => !serverNoteIds.has(note?.id))
    );
  }, [notes, localAddedNotes.length]);

  const handleAddNote = async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    const result = await onAddNote(event);
    const addedNote = result?.note || result;

    if (addedNote?.id) {
      setLocalAddedNotes((current) => {
        if (current.some((note) => note.id === addedNote.id)) {
          return current;
        }

        return [addedNote, ...current];
      });
    }

    return result;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#161b36]/90 via-[#11142D]/95 to-[#0b0d1e]/98 border border-slate-700/60 rounded-3xl p-6 md:p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-7 transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-amber-600/10 text-amber-400 rounded-2xl border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex-shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight flex items-center gap-2 drop-shadow">
              Uzman Notları & Değerlendirmeler
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Danışanın süreci, gelişimi ve teknik takipleri için özel notlar
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center px-4 py-1.5 bg-[#0d0f22]/80 border border-slate-700/80 text-slate-300 text-xs font-heading font-extrabold rounded-full flex items-center gap-2 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{displayedNotes.length} Not Kayıtlı</span>
        </div>
      </div>

      <form onSubmit={handleAddNote} className="relative z-10 space-y-3">
        <div className="relative group">
          <textarea
            rows={3}
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
            placeholder="Danışan hakkında teknik not, ölçüm detayları veya özel talimatlar ekleyin..."
            className="w-full bg-[#0d0f22]/90 border border-slate-700/70 text-white text-xs p-4 rounded-2xl outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 placeholder:text-slate-500 resize-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] group-hover:border-slate-600/80"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Eklenen notlar tüm yetkili uzman panelinde eşzamanlı görünür.
          </span>

          <button
            type="submit"
            disabled={isSavingNote || !newNote.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-heading font-black tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] border border-amber-400/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
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

      <div className="relative z-10 space-y-3.5 pt-2">
        {displayedNotes.length > 0 ? (
          displayedNotes.map((note, index) => {
            const authorName = String(
              note?.author_name ||
              note?.author ||
              note?.specialist_name ||
              ""
            ).trim();

            const authorRole = String(
              note?.author_role ||
              note?.specialist_role ||
              note?.specialist_title ||
              note?.role ||
              ""
            ).trim();

            const roleInfo = getRoleBadge(authorRole);

            return (
              <div
                key={note?.id || `note-${index}`}
                className="group relative bg-[#0d0f22]/80 hover:bg-[#131738] p-4 md:p-5 rounded-2xl border border-slate-800/90 hover:border-amber-500/40 transition-all duration-300 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]"
              >
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-amber-500/50 to-indigo-500/30 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {authorName ? (
                      <>
                        <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-amber-300 shadow-sm">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-heading font-bold text-slate-100 tracking-wide">
                          {authorName}
                        </span>
                      </>
                    ) : null}

                    {roleInfo ? (
                      <span
                        className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-md flex items-center gap-1 ${roleInfo.bg} ${roleInfo.glow}`}
                      >
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{note?.created_at || note?.date || ""}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans pl-1 whitespace-pre-line">
                  {note?.note_text || note?.text || ""}
                </p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-[#0d0f22]/60 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
              <FileText className="w-6 h-6 text-amber-400/80" />
            </div>
            <p className="text-xs text-slate-400 font-medium max-w-xs">
              Bu danışan hakkında henüz kayıtlı bir uzman notu bulunmuyor. İlk notu yukarıdan ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 