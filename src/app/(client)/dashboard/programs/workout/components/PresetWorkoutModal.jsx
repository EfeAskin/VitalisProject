"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Flame,
  Award,
  Video,
  Check,
  Sparkles,
  ShieldCheck,
  Dumbbell,
  Zap,
  ChevronRight
} from "lucide-react";

export default function PresetWorkoutModal({ workout, onClose }) {
  const [completedExercises, setCompletedExercises] = useState([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Gelismis YouTube embed dönüştürücü (Shorts, Watch, Youtu.be uyumlu)
  const embedUrl = useMemo(() => {
    if (!activeVideoUrl) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = activeVideoUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
    }
    return activeVideoUrl;
  }, [activeVideoUrl]);

  // Egzersiz işaretleme
  const toggleExercise = (id) => {
    setCompletedExercises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalExercises = workout?.exercises?.length || 0;
  const progressPercent =
    totalExercises > 0
      ? Math.round((completedExercises.length / totalExercises) * 100)
      : 0;

  // Antrenmanı Tamamlama
  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("vitalis_token");

      await fetch("/api/client/workouts/log-preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workout_id: workout.id,
          workout_title: workout.title,
          completed_exercises: completedExercises,
          total_exercises: totalExercises,
          progress_percent: progressPercent,
          calories_burned: Math.round(
            (workout.calories * progressPercent) / 100
          ),
          completed_at: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.log("Log kaydı tetiklendi (Offline/Fallback):", err);
    } finally {
      setIsFinishing(false);
      setIsCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      
      {/* 🎬 1. BÖLÜM: BĞIMSIZ VİDEO MODALI (Üst Katman - Z-Index 150) */}
      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="bg-[#0D1117] border border-amber-500/40 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] relative flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Header */}
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/30">
                  <Video className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black tracking-wider uppercase">
                    HAREKET FORM SİMÜLASYONU
                  </h4>
                  <p className="text-[10px] text-amber-300/70 font-bold">
                    Vitalis HD Video Rehberi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveVideoUrl(null)}
                className="p-2 bg-slate-800/80 text-slate-300 rounded-full hover:bg-rose-500 hover:text-white transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Frame */}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner relative group">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-white/10 transition-all"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏋️‍♂️ 2. BÖLÜM: ANA ANTRENMAN MODALI */}
      <div className="relative w-full max-w-2xl bg-[#090C10] border border-amber-500/30 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-2xl">
        
        {/* Görsel ve Banner Header */}
        <div className="relative h-48 sm:h-52 w-full shrink-0 overflow-hidden bg-slate-950 border-b border-white/10">
          {!imgError && workout?.image ? (
            <img
              src={workout.image}
              alt={workout.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-slate-900 to-black flex items-center justify-center">
              <Dumbbell className="w-16 h-16 text-amber-500/20 animate-pulse" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#090C10] via-[#090C10]/60 to-transparent" />

          {/* Kapat Butonu */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 text-slate-300 border border-white/15 hover:bg-rose-500/80 hover:text-white transition-all backdrop-blur-md shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Başlık ve Rozet */}
          <div className="absolute bottom-4 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                {workout.level || "SEVİYE BELİRTİLMEDİ"}
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                VİTALIS ONAYLI
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-tight drop-shadow-md">
              {workout.title}
            </h2>
          </div>
        </div>

        {/* 📊 İlerleme ve İstatistik Çubuğu */}
        <div className="bg-slate-950/80 px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
          {/* İstatistikler */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">{workout.duration} Dk</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-300">{workout.calories} Kcal</span>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="flex items-center gap-3 flex-1 max-w-xs min-w-[180px]">
            <div className="w-full bg-slate-900 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-amber-400 text-xs font-black min-w-[40px] text-right">
              %{progressPercent}
            </span>
          </div>
        </div>

        {/* 📋 Egzersiz Ekrani veya Tebrik Paneli */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {isCompleted ? (
            /* 🎉 TEBRİKLER EKRANI */
            <div className="py-12 text-center space-y-5 animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-400/50 rounded-3xl flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-bounce">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-emerald-300 uppercase tracking-tight">
                  TEBRİKLER! ANTRENMAN TAMAMLANDI
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Harika bir performans sergiledin. Başarı verilerin, yakılan
                  kalori ve tamamlama istatistiklerin profil geçmişine
                  kaydedildi.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
                >
                  KAPAT VE PANOYA DÖN
                </button>
              </div>
            </div>
          ) : (
            /* 🏋️ EGZERSİZ LİSTESİ */
            workout?.exercises?.map((ex, idx) => {
              const isChecked = completedExercises.includes(ex.id);
              return (
                <div
                  key={ex.id || idx}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${
                    isChecked
                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-75"
                      : "bg-slate-900/50 border-white/10 hover:border-amber-500/40 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleExercise(ex.id)}
                      className="shrink-0 text-amber-400 hover:scale-110 transition-transform p-1"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 group-hover:text-amber-400/80 transition-colors" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-bold truncate transition-all ${
                          isChecked
                            ? "line-through text-slate-500"
                            : "text-white group-hover:text-amber-200"
                        }`}
                      >
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-amber-300/80 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {ex.sets} SET • {ex.reps}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Video İzleme Butonu */}
                  {ex.video_url && (
                    <button
                      onClick={() => setActiveVideoUrl(ex.video_url)}
                      className="px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 shrink-0 flex items-center gap-1.5 text-xs font-extrabold shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">İzle</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 🔘 Alt Buton Alanı */}
        {!isCompleted && (
          <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
            >
              Vazgeç
            </button>

            <button
              onClick={handleFinishWorkout}
              disabled={isFinishing || completedExercises.length === 0}
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all duration-300 ${
                completedExercises.length > 0
                  ? "bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02]"
                  : "bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4" />
              {isFinishing ? "Kaydediliyor..." : "Antrenmanı Bitir"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}