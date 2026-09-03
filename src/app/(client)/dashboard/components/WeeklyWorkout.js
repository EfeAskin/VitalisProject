"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Check, 
  CheckSquare, 
  Square, 
  Loader2, 
  Moon, 
  Flame, 
  Play, 
  X, 
  ExternalLink, 
  Video 
} from 'lucide-react';

// İçinde bulunulan haftanın Pazartesi gününün başlangıç saatini (00:00:00) hesaplar
const getStartOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi = 1
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Video URL'sini iframe için gömülebilir (embed) formata dönüştüren yardımcı fonksiyon
// Video URL'sini iframe için tam uyumlu gömülebilir (embed) formata dönüştürür
const getEmbedUrl = (url) => {
  if (!url) return null;
  try {
    // Tüm YouTube URL formatlarını (Shorts, Watch, youtu.be, embed, m.youtube) tespit eden Regex
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo URL tespiti
    if (url.includes('vimeo.com/')) {
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
      }
    }

    return url;
  } catch (e) {
    return url;
  }
};

export default function WeeklyWorkout({ workoutProgress, setWorkoutProgress }) {
  const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const [selectedDay, setSelectedDay] = useState('Pzt');
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayName, setTodayName] = useState('Pzt');

  // Video Pop-up Modal State'i
  const [activeVideo, setActiveVideo] = useState(null);

  // Bugünün adını doğru algıla (Pzt = 0, Sal = 1 ... Paz = 6)
  useEffect(() => {
    const jsDay = new Date().getDay(); // 0: Paz, 1: Pzt, 2: Sal...
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Pzt'yi 0. index yap
    const currentToday = DAYS[dayIndex];
    setTodayName(currentToday);
    setSelectedDay(currentToday);
  }, []);

  // API'den Danışanın Atanmış Antrenman Programını Çek
  useEffect(() => {
    async function fetchWeeklySchedule() {
      try {
        setLoading(true);
        const res = await fetch('/api/client/workout-schedule');
        
        if (res.ok) {
          const data = await res.json();
          const rawSchedule = data.schedule || {};
          const currentWeekStart = getStartOfWeek();

          // Backend'den gelen veriyi normalize et ve Haftalık Sıfırlama Mantığını Uygula
          const normalizedSchedule = Object.entries(rawSchedule).reduce(
            (acc, [day, dayData]) => {
              const safeDayData = dayData || {};

              const estimatedCalories =
                safeDayData.estimated_calories ??
                safeDayData.estimatedCalories ??
                safeDayData.calories ??
                safeDayData.calories_burned ??
                safeDayData.estimated_calories_burned ??
                0;

              const rawExercises = Array.isArray(safeDayData.exercises)
                ? safeDayData.exercises
                : [];

              // Egzersizlerin tamamlanma tarihini bu haftanın Pazartesi günü ile kıyasla
              const currentWeekExercises = rawExercises.map(ex => {
                const logDateStr = ex.updated_at || ex.completed_at || ex.log_date || safeDayData.updated_at || safeDayData.log_date;
                let isCompletedThisWeek = Boolean(ex.completed);

                if (logDateStr) {
                  const logDate = new Date(logDateStr);
                  // Eğer kayıt bu haftanın Pazartesi gününden önce yapılmışsa mevcut hafta için sıfırla (false)
                  if (logDate.getTime() < currentWeekStart.getTime()) {
                    isCompletedThisWeek = false;
                  }
                } else {
                  // Tarih verisi yoksa veya eski kayıtsa sıfırla
                  isCompletedThisWeek = false;
                }

                return {
                  ...ex,
                  completed: isCompletedThisWeek
                };
              });

              acc[day] = {
                ...safeDayData,
                estimated_calories: Number(estimatedCalories) || 0,
                exercises: currentWeekExercises
              };

              return acc;
            },
            {}
          );

          setScheduleData(normalizedSchedule);

          // Üst bileşen güncelliği için progress state'ini senkronize et
          if (setWorkoutProgress) {
            setWorkoutProgress(
              DAYS.map(day => {
                const dayExs = normalizedSchedule[day]?.exercises || [];
                const allDone = dayExs.length > 0 && dayExs.every(ex => ex.completed);
                return { day, completed: allDone };
              })
            );
          }
        }
      } catch (error) {
        console.error("Antrenman programı çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklySchedule();
  }, []);

  // Hareket Tamamlama İşlemi
  const toggleExercise = async (day, exerciseId) => {
    const currentDayObj = scheduleData[day];
    if (!currentDayObj) return;

    const targetEx = currentDayObj.exercises.find(ex => ex.id === exerciseId);
    if (!targetEx) return;

    const newCompletedStatus = !targetEx.completed;
    const nowIso = new Date().toISOString();

    setScheduleData(prev => {
      const updatedExercises = prev[day].exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, completed: newCompletedStatus, updated_at: nowIso }
          : ex
      );

      const allDone = updatedExercises.length > 0 && updatedExercises.every(ex => ex.completed);
        
      if (setWorkoutProgress) {
        setWorkoutProgress(currentProgress =>
          currentProgress.map(p => p.day === day ? { ...p, completed: allDone } : p)
        );
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          exercises: updatedExercises
        }
      };
    });

    try {
      await fetch('/api/client/workout-schedule/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          completed: newCompletedStatus,
          day,
          log_date: nowIso.split('T')[0] // Veritabanına bugünün tarih kaydı olarak yazılır
        })
      });
    } catch (err) {
      console.error("Hareket durumu güncellenemedi:", err);
    }
  };

  const currentDayData = scheduleData[selectedDay] || {
    target: "Planlanmış Antrenman Yok",
    exercises: [],
    estimated_calories: 0
  };

  // Günlük tahmini yakılan kalori
  const estimatedCalories =
    Number(
      currentDayData.estimated_calories ??
      currentDayData.estimatedCalories ??
      currentDayData.calories ??
      currentDayData.calories_burned ??
      currentDayData.estimated_calories_burned ??
      0
    ) || 0;

  return (
    <div className="bg-[#0D2017]/85 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-emerald-500/30 hover:border-emerald-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 relative">
      
      {/* Üst Başlık ve İkon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
          <Dumbbell size={16} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
          Haftalık Antrenman İlerlemesi
        </h3>
        <span className="text-[10px] text-emerald-200/70 font-extrabold tracking-wide">
          Güne Tıklayıp Detayları Gör
        </span>
      </div>

      {/* Gün Seçici Menü */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-4">
        {DAYS.map((dayName) => {
          const isSelected = selectedDay === dayName;
          const isToday = todayName === dayName;
          const dayInfo = scheduleData[dayName] || { exercises: [] };
          const hasExercises = dayInfo.exercises && dayInfo.exercises.length > 0;
          const isCompleted = hasExercises && dayInfo.exercises.every(ex => ex.completed);

          return (
            <button 
              key={dayName}
              onClick={() => setSelectedDay(dayName)}
              className="space-y-1.5 focus:outline-none group cursor-pointer"
            >
              {/* Gün İsmi */}
              <span className={`text-[10px] sm:text-[11px] font-extrabold transition-all block ${
                isSelected 
                  ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                  : 'text-emerald-200/60 group-hover:text-white'
              }`}>
                {dayName}
              </span>

              {/* Gün Durum Kutucuğu */}
              <div className={`h-9 sm:h-10 rounded-xl flex items-center justify-center transition-all relative duration-300
                ${isCompleted 
                  ? 'bg-[#07130D] text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-[#07130D]/60 text-slate-400 border border-emerald-500/20'
                }
                ${isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0D2017]' : ''}
                ${isSelected && !isCompleted ? 'border-2 border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : ''}
              `}>
                {/* İkon Durum Mantığı */}
                {isCompleted ? (
                  <Check size={15} strokeWidth={3} className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                ) : hasExercises ? (
                  <span className="text-xs text-emerald-400 font-bold">•</span>
                ) : (
                  <Moon size={11} className="text-emerald-500/30" />
                )}

                {/* Bugün Gösterge Noktası */}
                {isToday && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#0D2017] shadow-[0_0_8px_rgba(251,191,36,0.9)]"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Seçili Güne Ait Egzersiz Detayları Paneli */}
      <div className="bg-[#07130D]/90 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] min-h-[140px] flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold py-6">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Antrenman Programı Yükleniyor...
          </div>
        ) : (
          <>
            {/* Bölge & Odak + Kalori Rozeti */}
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-extrabold uppercase block tracking-wider drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
                  Bölge & Odak
                </span>
                <h4 className="text-xs font-black text-white mt-0.5 tracking-wide">
                  {currentDayData.target}
                </h4>
              </div>

              {/* Yakılan Kalori Rozeti */}
              {estimatedCalories > 0 && (
                <div 
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.18)]"
                  title="Tahmini yakılan kalori"
                >
                  <Flame 
                    size={13} 
                    fill="#EA580C"
                    className="text-[#EA580C] drop-shadow-[0_0_6px_rgba(234,88,12,0.8)]" 
                  />
                  <span className="text-[10px] sm:text-[11px] font-black text-orange-300 whitespace-nowrap">
                    {estimatedCalories} kcal
                  </span>
                </div>
              )}
            </div>

            {/* EGZERSİZ LİSTESİ - Maksimum yükseklik sınırı ve dahili kaydırma çubuğu */}
            {currentDayData.exercises && currentDayData.exercises.length > 0 ? (
              <div className="space-y-1.5 border-t border-emerald-500/20 pt-2.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {currentDayData.exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    onClick={() => toggleExercise(selectedDay, exercise.id)}
                    className="flex items-center justify-between py-2 px-3 bg-[#0D2017] border border-emerald-500/25 rounded-xl hover:border-emerald-400/60 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] group"
                  >
                    {/* Sol Kısım: İlerleme Durumu ve Hareket İsmi */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {exercise.completed ? (
                        <CheckSquare size={17} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                      ) : (
                        <Square size={17} className="text-emerald-500/40 group-hover:text-emerald-400 transition-colors shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={`text-xs font-extrabold transition-all leading-tight ${
                          exercise.completed ? 'line-through text-emerald-200/40' : 'text-white'
                        }`}>
                          {exercise.name}
                        </p>
                        <span className="text-[10px] text-emerald-300/70 font-semibold block mt-0.5">{exercise.sets}</span>
                      </div>
                    </div>

                    {/* En Sağ Kısım: Premium Oynatma (Video) Butonu */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Checkbox işaretlenmesini engeller
                        setActiveVideo(exercise);
                      }}
                      className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-200 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group/btn cursor-pointer ml-2"
                      title="Egzersiz Videosunu İzle"
                    >
                      <Play size={13} className="fill-emerald-400 group-hover/btn:fill-emerald-200 transition-colors ml-0.5 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 border-t border-dashed border-emerald-500/20 mt-2 text-emerald-300/60 text-xs font-bold">
                Bu gün için planlanmış ağırlık antrenmanı bulunmuyor.
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* PREMİUM EGZERSİZ VİDEO POP-UP MODAL EKRANI               */}
      {/* ========================================================= */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="bg-[#0D2017] border border-emerald-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Üst Başlık */}
            <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-[#07130D]">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Video size={18} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white truncate tracking-wide">
                    {activeVideo.name}
                  </h3>
                  <p className="text-[11px] text-emerald-300/70 font-semibold truncate mt-0.5">
                    {activeVideo.sets}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Video Oynatıcı Alanı */}
            <div className="p-4 sm:p-5">
              {activeVideo.video_url ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/70 shadow-inner flex items-center justify-center">
                  {activeVideo.video_url.includes('youtube.com') || 
                   activeVideo.video_url.includes('youtu.be') || 
                   activeVideo.video_url.includes('vimeo.com') ? (
                    <iframe
                      src={getEmbedUrl(activeVideo.video_url)}
                      title={activeVideo.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeVideo.video_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      Tarayıcınız video etiketini desteklemiyor.
                    </video>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-[#07130D]/60 rounded-2xl border border-dashed border-emerald-500/20 px-4">
                  <Video size={36} className="text-emerald-500/30 mb-2.5" />
                  <p className="text-xs font-extrabold text-emerald-200/80">
                    Bu egzersiz için henüz rehber video yüklenmemiş.
                  </p>
                  <span className="text-[10px] text-emerald-300/40 mt-1">
                    Detaylı uygulama formu için koçunuzla iletişime geçebilirsiniz.
                  </span>
                </div>
              )}

              {/* Alt Bilgi & Dış Bağlantı */}
              {activeVideo.video_url && (
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-emerald-300/60 px-1">
                  <span className="font-semibold">Doğru Form & Uygulama Rehberi</span>
                  <a
                    href={activeVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-200 font-extrabold transition-colors"
                  >
                    Harici Sekmede İzle <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}