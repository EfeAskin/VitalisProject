"use client";
import React, { useState, useEffect } from 'react';
import { Dumbbell, Check, CheckSquare, Square, Loader2, Moon } from 'lucide-react';

export default function WeeklyWorkout({ workoutProgress, setWorkoutProgress }) {
  const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const [selectedDay, setSelectedDay] = useState('Pzt');
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayName, setTodayName] = useState('Pzt');

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
          setScheduleData(data.schedule || {});
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

    setScheduleData(prev => {
      const updatedExercises = prev[day].exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: newCompletedStatus } : ex
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
          day
        })
      });
    } catch (err) {
      console.error("Hareket durumu güncellenemedi:", err);
    }
  };

  const currentDayData = scheduleData[selectedDay] || { target: "Planlanmış Antrenman Yok", exercises: [] };

  return (
    <div className="bg-[#0D2017]/85 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300">

      {/* Üst Başlık ve İkon */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
          <Dumbbell size={16} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
          Haftalık Antrenman İlerlemesi
        </h3>
        <span className="text-[10px] text-emerald-200/70 font-extrabold tracking-wide">
          Güne Tıklayıp Detayları Gör
        </span>
      </div>

      {/* Gün Seçici Menü */}
      <div className="grid grid-cols-7 gap-2 text-center mb-6">
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
              className="space-y-2 focus:outline-none group cursor-pointer"
            >
              {/* Gün İsmi */}
              <span className={`text-[11px] font-extrabold transition-all block ${
                isSelected 
                  ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                  : 'text-emerald-200/60 group-hover:text-white'
              }`}>
                {dayName}
              </span>

              {/* Gün Durum Kutucuğu */}
              <div className={`h-11 rounded-xl flex items-center justify-center transition-all relative duration-300
                ${isCompleted 
                  ? 'bg-[#07130D] text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-[#07130D]/60 text-slate-400 border border-emerald-500/20'
                }
                ${isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0D2017]' : ''}
                ${isSelected && !isCompleted ? 'border-2 border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : ''}
              `}>
                {/* İkon Durum Mantığı */}
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                ) : hasExercises ? (
                  <span className="text-xs text-emerald-400 font-bold">•</span>
                ) : (
                  <Moon size={12} className="text-emerald-500/30" />
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
      <div className="bg-[#07130D]/90 border border-emerald-500/30 rounded-2xl p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] min-h-[160px] flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold py-6">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Antrenman Programı Yükleniyor...
          </div>
        ) : (
          <>
            <div className="mb-3">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase block tracking-wider drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
                Bölge & Odak
              </span>
              <h4 className="text-xs font-black text-white mt-0.5 tracking-wide">
                {currentDayData.target}
              </h4>
            </div>

            {currentDayData.exercises && currentDayData.exercises.length > 0 ? (
              <div className="space-y-2.5 border-t border-emerald-500/20 pt-3">
                {currentDayData.exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    onClick={() => toggleExercise(selectedDay, exercise.id)}
                    className="flex items-center justify-between p-3 bg-[#0D2017] border border-emerald-500/25 rounded-xl hover:border-emerald-400/60 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] group"
                  >
                    <div className="flex items-center gap-3">
                      {exercise.completed ? (
                        <CheckSquare size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      ) : (
                        <Square size={18} className="text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
                      )}
                      <div>
                        <p className={`text-xs font-extrabold transition-all ${
                          exercise.completed ? 'line-through text-emerald-200/40' : 'text-white'
                        }`}>
                          {exercise.name}
                        </p>
                        <span className="text-[10px] text-emerald-300/70 font-semibold">{exercise.sets}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-t border-dashed border-emerald-500/20 mt-3 text-emerald-300/60 text-xs font-bold">
                Bu gün için planlanmış ağırlık antrenmanı bulunmuyor.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}