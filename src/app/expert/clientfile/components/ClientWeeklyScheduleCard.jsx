"use client";

import React, { useState } from "react";
import { Calendar, Dumbbell, Flame, Layers } from "lucide-react";

const DAYS = [
  { key: "Pzt", full: "Pazartesi" },
  { key: "Sal", full: "Salı" },
  { key: "Çar", full: "Çarşamba" },
  { key: "Per", full: "Perşembe" },
  { key: "Cum", full: "Cuma" },
  { key: "Cmt", full: "Cumartesi" },
  { key: "Paz", full: "Pazar" },
];

export default function ClientWeeklyScheduleCard({
  weeklyPrograms = [],
  programs = [],
  assignedPrograms = [],
}) {
  // Varsayılan olarak Pazartesi seçili
  const [selectedDay, setSelectedDay] = useState("Pzt");

  // Üst bileşenden gelen her türlü veri ismini destekle
  const activeProgramsList =
    weeklyPrograms.length > 0
      ? weeklyPrograms
      : programs.length > 0
      ? programs
      : assignedPrograms;

  // Seçili güne atanan programları filtrele
  const activeProgramsForDay = activeProgramsList.filter((prog) => {
    const days = prog.assigned_days || prog.program_details?.assigned_days || [];
    return days.includes(selectedDay);
  });

  return (
    <div className="relative overflow-hidden bg-[#11142D]/95 border border-slate-700/80 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(249,115,22,0.12)] space-y-6">
      {/* HEADER & HAFTANIN GÜNLERİ SEKMELERİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-2xl text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-base font-heading font-black text-white tracking-wide">
              Haftalık Antrenman Rutini
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Güne göre atanmış antrenman programları ve egzersiz detayları
            </p>
          </div>
        </div>

        {/* GÜN SEÇİM BUTONLARI (PZT - PAZ) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {DAYS.map((d) => {
            const isSelected = selectedDay === d.key;
            // O gün antrenman var mı kontrol et
            const hasWorkout = activeProgramsList.some((prog) => {
              const days = prog.assigned_days || prog.program_details?.assigned_days || [];
              return days.includes(d.key);
            });

            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-heading font-extrabold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_18px_rgba(249,115,22,0.4)] scale-105"
                    : "bg-[#181C3F] text-slate-300 hover:text-white hover:bg-[#202654] border border-slate-700/60"
                }`}
              >
                <span>{d.key}</span>
                {hasWorkout && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEÇİLİ GÜN İÇERİĞİ VE EGZERSİZ LİSTESİ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-heading font-extrabold text-slate-200 flex items-center gap-2">
            <span className="text-orange-400">
              {DAYS.find((d) => d.key === selectedDay)?.full}
            </span>{" "}
            Programı
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {activeProgramsForDay.length} Aktif Antrenman
          </span>
        </div>

        {activeProgramsForDay.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeProgramsForDay.map((prog, pIdx) => {
              const exercises = prog.exercises || prog.template_exercises || [];

              return (
                <div
                  key={prog.id || pIdx}
                  className="bg-[#161A3C] border border-orange-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                >
                  {/* Program Başlığı */}
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
                        <Dumbbell size={18} />
                      </div>
                      <div>
                        <h5 className="text-sm font-heading font-black text-white">
                          {prog.name || prog.template_name || "Günün Programı"}
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {prog.duration_minutes ? `${prog.duration_minutes} Dakika` : "Standart Süre"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-heading font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      Atandı
                    </span>
                  </div>

                  {/* Egzersiz Listesi Tablosu / Kartları */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-heading font-bold uppercase text-slate-400 flex items-center gap-1 tracking-wider">
                      <Layers size={13} className="text-orange-400" /> Egzersizler & Set
                      Detayları
                    </span>

                    {exercises.length > 0 ? (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                        {exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="flex items-center justify-between bg-[#11142D] border border-slate-700/60 p-2.5 rounded-xl text-xs hover:border-orange-500/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                {exIdx + 1}
                              </span>
                              <span className="font-heading font-bold text-slate-200 truncate">
                                {ex.exercise_name || ex.name || "Egzersiz"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md text-[11px]">
                                {ex.sets || 3} Set x {ex.reps || "12"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic bg-[#11142D] p-3 rounded-xl border border-slate-800 text-center">
                        Bu programa eklenmiş egzersiz detayları bulunmuyor.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#161A3C]/60 border border-dashed border-slate-700/80 rounded-2xl p-8 text-center space-y-2">
            <Flame size={32} className="mx-auto text-slate-600" />
            <h5 className="text-sm font-heading font-bold text-slate-300">
              {DAYS.find((d) => d.key === selectedDay)?.full} günü için dinlenme günü veya
              program atanmamış.
            </h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sol taraftaki program kartı üzerinden bu güne antrenman ekleyebilir veya yeni
              program tanımlayabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}