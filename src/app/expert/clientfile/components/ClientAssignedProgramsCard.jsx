"use client";

import React, { useState } from "react";
import { Dumbbell, Trash2, Edit3, Plus, Calendar, Clock, AlertTriangle } from "lucide-react";

export default function ClientAssignedProgramsCard({
  programs = [],
  assignedPrograms = [],
  workoutPrograms = [],
  onDeleteProgram,
  onEditProgram,
  onAssignNewProgram,
}) {
  const [deletingId, setDeletingId] = useState(null);

  // Prop adı fark etmeksizin dolu olan listeyi kullan
  const activeProgramsList =
    programs.length > 0
      ? programs
      : assignedPrograms.length > 0
      ? assignedPrograms
      : workoutPrograms;

  const handleDelete = (id) => {
    if (deletingId === id) {
      if (onDeleteProgram) onDeleteProgram(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000); // 3 sn sonra sıfırla
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#11142D]/95 border border-slate-700/80 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(249,115,22,0.12)] space-y-5">
      {/* BAŞLIK VE YENİ PROGRAM ATA BUTONU */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-500/15 border border-orange-500/30 rounded-xl text-orange-400">
            <Dumbbell size={18} />
          </div>
          <div>
            <h4 className="text-sm font-heading font-black text-white tracking-wide">
              Atanan Programlar
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Aktif antrenman yönetim alanı
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAssignNewProgram}
          className="p-2 bg-orange-600/20 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/40 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 text-xs font-heading font-bold shadow-[0_0_10px_rgba(249,115,22,0.2)]"
          title="Yeni Program Ata"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Ekle</span>
        </button>
      </div>

      {/* PROGRAM LİSTESİ */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {activeProgramsList.length > 0 ? (
          activeProgramsList.map((prog) => {
            const days = prog.assigned_days || prog.program_details?.assigned_days || [];
            const isDeleting = deletingId === prog.id;

            return (
              <div
                key={prog.id}
                className="group relative bg-[#181C3F] border border-orange-500/25 hover:border-orange-500/60 rounded-2xl p-4 transition-all duration-200 space-y-3 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <h5 className="text-sm font-heading font-extrabold text-white truncate group-hover:text-orange-400 transition-colors">
                      {prog.name || prog.template_name || "Antrenman Programı"}
                    </h5>
                    {prog.duration_minutes && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock size={12} className="text-amber-400" />
                        {prog.duration_minutes} dk
                      </span>
                    )}
                  </div>

                  {/* EYLEM BUTONLARI (DÜZENLE & SİL) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditProgram && onEditProgram(prog)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                      title="Programı / Günleri Düzenle"
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(prog.id)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isDeleting
                          ? "bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          : "text-slate-400 hover:text-red-400 hover:bg-red-500/20 border-transparent hover:border-red-500/30"
                      }`}
                      title={isDeleting ? "Emin misiniz? Tıklayın" : "Programı Kaldır"}
                    >
                      {isDeleting ? <AlertTriangle size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* ATANAN GÜNLER ROZETLERİ */}
                <div className="space-y-1 pt-1 border-t border-slate-700/50">
                  <span className="text-[10px] uppercase font-heading font-bold text-slate-400 flex items-center gap-1">
                    <Calendar size={11} className="text-orange-400" /> Atanan Günler:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {days.length > 0 ? (
                      days.map((day, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-heading font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Gün atanmamış</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4 border border-dashed border-slate-700/80 rounded-2xl space-y-2">
            <Dumbbell size={28} className="mx-auto text-slate-600" />
            <p className="text-xs text-slate-400 font-medium">
              Henüz atanmış aktif bir program bulunmuyor.
            </p>
            <button
              type="button"
              onClick={onAssignNewProgram}
              className="text-xs font-heading font-bold text-orange-400 hover:underline cursor-pointer"
            >
              + Hemen Program Ata
            </button>
          </div>
        )}
      </div>
    </div>
  );
}