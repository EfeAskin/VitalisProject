"use client";

import React, { useState } from 'react';
import { Clock, Dumbbell, Edit3, Trash2, Send, Zap, Users, Loader2, Flame } from 'lucide-react';

export default function WorkoutCard({ workout, onEdit, onDelete, onAssign }) {
  const {
    id,
    title,
    level,
    duration,
    exercises = [],
    targetMuscles = [],
    assignedUsers = []
  } = workout;

  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Backend'den gelebilecek tüm kalori alanlarını destekle
  const estimatedCalories =
    workout.estimatedCalories ??
    workout.estimated_calories ??
    workout.calories ??
    workout.kcal ??
    0;

  // Zorluk seviyesine göre neon rozet renkleri
  const getLevelStyle = (lvl) => {
    switch (lvl) {
      case 'Başlangıç':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

      case 'Orta Seviye':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';

      case 'İleri Seviye':
        return 'bg-orange-500/10 text-[#EA580C] border-orange-500/30';

      case 'Pro / Atlet':
      case 'Elit Atlet':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]';

      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (err) {
      console.error("Silme hatası:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignClick = async () => {
    if (!onAssign) return;

    try {
      setIsAssigning(true);
      await onAssign(workout);
    } catch (err) {
      console.error("Atama hatası:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="bg-[#11142D]/60 border border-slate-700/60 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.2)] hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden backdrop-blur-md">
      
      {/* İnce Glow Efekti (Sadece Hover'da belirir) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#EA580C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div>
        {/* Üst Bilgi Barı & Butonlar */}
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider ${getLevelStyle(level)}`}>
            {level}
          </span>
          
          <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => onEdit && onEdit(workout)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700/50"
              title="Şablonu Düzenle"
            >
              <Edit3 size={15} />
            </button>

            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl transition-colors border border-slate-700/50 disabled:opacity-50"
              title="Şablonu Sil"
            >
              {isDeleting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>
        </div>

        {/* Başlık */}
        <h3 className="font-extrabold text-white text-xl mb-3 group-hover:text-[#EA580C] transition-colors line-clamp-1">
          {title}
        </h3>
        
        {/* Metrikler */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300 mb-5">
          
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#EA580C]" />
            {duration} Dk
          </span>

          <span className="flex items-center gap-1.5">
            <Dumbbell size={14} className="text-[#EA580C]" />
            {exercises.length} Egzersiz
          </span>

          {targetMuscles.length > 0 && (
            <span className="flex items-center gap-1.5 text-orange-400">
              <Zap size={14} />
              {targetMuscles.length} Bölge
            </span>
          )}

          {/* KALORİ ROZETİ */}
          {Number(estimatedCalories) > 0 && (
            <span
              className="
                inline-flex items-center gap-1.5
                px-2.5 py-1.5
                rounded-xl
                border border-orange-500/40
                bg-gradient-to-r from-orange-500/15 to-amber-500/10
                text-orange-300
                shadow-[0_0_12px_rgba(249,115,22,0.15)]
                font-black
                whitespace-nowrap
              "
              title="Tahmini Kalori"
            >
              <Flame
                size={14}
                className="text-orange-400 fill-orange-400/20"
              />
              {Number(estimatedCalories).toLocaleString('tr-TR')} kcal
            </span>
          )}
        </div>

        {/* Egzersiz Listesi Özeti (Premium Görünüm) */}
        <div className="bg-[#11142D]/80 p-4 rounded-2xl border border-slate-700/60 mb-5 space-y-2.5 shadow-inner">
          {exercises.slice(0, 3).map((ex, i) => (
            <div
              key={ex.id || i}
              className="flex justify-between items-center text-xs"
            >
              <span className="font-medium text-slate-300 truncate max-w-[170px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
                {ex.name || "İsimsiz Egzersiz"}
              </span>

              <span className="font-bold text-slate-400 text-[11px] bg-[#11142D] px-2.5 py-1 rounded-lg border border-slate-700/70">
                {ex.sets} x {ex.reps}
              </span>
            </div>
          ))}

          {exercises.length > 3 && (
            <div className="pt-2 mt-2 border-t border-slate-700/50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                + {exercises.length - 3} Egzersiz Daha
              </p>
            </div>
          )}

          {exercises.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-2">
              Egzersiz eklenmedi.
            </p>
          )}
        </div>
      </div>

      {/* Alt Bölüm: Atanan Kişiler ve Aksiyon Butonu */}
      <div className="mt-auto">

        {/* Çoka-Çok (Many-to-Many) İlişki Görselleştirmesi */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Users size={14} />
            Atananlar:
          </div>

          <div className="flex -space-x-2">
            {assignedUsers.slice(0, 3).map((u, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full border-2 border-[#11142D] bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white z-10 shadow-sm"
                title={u.name || "Danışan"}
              >
                {u.initials || "PT"}
              </div>
            ))}

            {assignedUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-[#11142D] bg-[#11142D]/90 flex items-center justify-center text-[8px] font-bold text-slate-300 z-0 border border-slate-700">
                +{assignedUsers.length - 3}
              </div>
            )}

            {assignedUsers.length === 0 && (
              <span className="text-[10px] text-slate-400">
                Henüz kimseye atanmadı
              </span>
            )}
          </div>
        </div>

        {/* Atama Butonu */}
        <button 
          onClick={handleAssignClick}
          disabled={isAssigning}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:scale-[1.02] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isAssigning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Atanıyor...
            </>
          ) : (
            <>
              <Send size={14} />
              Danışana Atayarak Gönder
            </>
          )}
        </button>
      </div>
    </div>
  );
}