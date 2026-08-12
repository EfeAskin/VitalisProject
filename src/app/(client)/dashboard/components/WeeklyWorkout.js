"use client";
import React, { useState } from 'react';
import { Dumbbell, Check, CheckSquare, Square } from 'lucide-react';

// Orijinal mock veri yapısı - Tek bir harfi bile değiştirilmeden Birebir Korundu!
const workoutDataByDay = {
  'Pzt': {
    target: "Göğüs & Ön Kol (Chest & Biceps)",
    exercises: [
      { id: 'p1', name: 'Incline Dumbbell Press', sets: '4 Set x 10 Tekrar', completed: true },
      { id: 'p2', name: 'Flat Bench Press', sets: '3 Set x 8 Tekrar', completed: true },
      { id: 'p3', name: 'Cable Crossover', sets: '3 Set x 12 Tekrar', completed: true },
      { id: 'p4', name: 'Barbell Curl', sets: '4 Set x 10 Tekrar', completed: true },
    ]
  },
  'Sal': {
    target: "Sırt & Arka Kol (Back & Triceps) - Bugün",
    exercises: [
      { id: 's1', name: 'Lat Pulldown', sets: '4 Set x 10 Tekrar', completed: false },
      { id: 's2', name: 'Seated Cable Row', sets: '3 Set x 12 Tekrar', completed: false },
      { id: 's3', name: 'Dumbbell Row', sets: '3 Set x 10 Tekrar', completed: false },
      { id: 's4', name: 'Triceps Pushdown', sets: '4 Set x 12 Tekrar', completed: false },
    ]
  },
  'Çar': { target: "Aktif Dinlenme / Kardiyo", exercises: [] },
  'Per': {
    target: "Omuz & Karın (Shoulders & Abs)",
    exercises: [
      { id: 'pe1', name: 'Overhead Press', sets: '4 Set x 8 Tekrar', completed: false },
      { id: 'pe2', name: 'Lateral Raise', sets: '4 Set x 15 Tekrar', completed: false },
      { id: 'pe3', name: 'Hanging Leg Raise', sets: '3 Set x Maksimum', completed: false },
    ]
  },
  'Cum': {
    target: "Bacak (Leg Day)",
    exercises: [
      { id: 'c1', name: 'Barbell Squat', sets: '4 Set x 8 Tekrar', completed: false },
      { id: 'c2', name: 'Leg Press', sets: '3 Set x 10 Tekrar', completed: false },
      { id: 'c3', name: 'Lying Leg Curl', sets: '3 Set x 12 Tekrar', completed: false },
    ]
  },
  'Cmt': { target: "Hafif Kardiyo & Esneme", exercises: [] },
  'Paz': { target: "Dinlenme Günü", exercises: [] }
};

export default function WeeklyWorkout({ workoutProgress, setWorkoutProgress }) {
  const [selectedDay, setSelectedDay] = useState('Sal'); // Varsayılan olarak bugün (Salı) seçili
  const [exercises, setExercises] = useState(workoutDataByDay);

  // --- NEON DB ENTEGRASYON REHBERİ ---
  // Yarın Neon DB'den veri çekerken tek yapman gereken setExercises(dbGelenEgzersizler) demek.
  // Aşağıdaki fonksiyon veritabanına bir PUT/POST isteği göndererek güncel durumu anında işleyecek şekilde kurgulanmıştır.

  const toggleExercise = (day, exerciseId) => {
    setExercises(prev => {
      const updatedExercises = prev[day].exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      );
      
      // Eğer tüm egzersizler bittiyse haftalık ilerlemede o günü yeşil yapalım
      const allDone = updatedExercises.length > 0 && updatedExercises.every(ex => ex.completed);
      setWorkoutProgress(currentProgress => 
        currentProgress.map(p => p.day === day ? { ...p, completed: allDone } : p)
      );

      // --- YARIN BURADA NEON DB API'Sİ TETİKLENEBİLİR ---
      /*
      fetch('/api/workout/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, exerciseId, completed: !prev[day].exercises.find(e => e.id === exerciseId).completed })
      });
      */

      return {
        ...prev,
        [day]: {
          ...prev[day],
          exercises: updatedExercises
        }
      };
    });
  };

  const currentDayData = exercises[selectedDay] || { target: "Egzersiz Yok", exercises: [] };

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
        {workoutProgress.map((item) => {
          const isSelected = selectedDay === item.day;
          return (
            <button 
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className="space-y-2 focus:outline-none group cursor-pointer"
            >
              {/* Gün Ismi */}
              <span className={`text-[11px] font-extrabold transition-all block ${
                isSelected 
                  ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                  : 'text-emerald-200/60 group-hover:text-white'
              }`}>
                {item.day}
              </span>
              
              {/* Gün Durum Kutucuğu */}
              <div className={`h-11 rounded-xl flex items-center justify-center transition-all relative duration-300
                ${item.completed 
                  ? 'bg-[#07130D] text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-[#07130D]/60 text-slate-400 border border-emerald-500/20'
                }
                ${item.isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0D2017]' : ''}
                ${isSelected && !item.completed ? 'border-2 border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : ''}
              `}>
                {item.completed ? (
                  <Check size={16} strokeWidth={3} className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                ) : (
                  <span className="text-[10px] font-black">•</span>
                )}
                
                {item.isToday && (
                  /* Bugünün parlayan neon altın bildirim noktası */
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#0D2017] shadow-[0_0_8px_rgba(251,191,36,0.9)]"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Seçili Güne Ait Egzersiz Detayları Paneli */}
      <div className="bg-[#07130D]/90 border border-emerald-500/30 rounded-2xl p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        <div className="mb-3">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase block tracking-wider drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
            Bölge & Odak
          </span>
          <h4 className="text-xs font-black text-white mt-0.5 tracking-wide">
            {currentDayData.target}
          </h4>
        </div>

        {currentDayData.exercises.length > 0 ? (
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
            Bugün planlanmış ağırlık antrenmanı bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}