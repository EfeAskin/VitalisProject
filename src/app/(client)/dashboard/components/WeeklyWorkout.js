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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          {/* Eski düz yeşil yerine Zümrüt Yeşili (#10B981) ikon */}
          <Dumbbell size={14} className="text-[#10B981]" /> Haftalık Antrenman İlerlemesi
        </h3>
        <span className="text-[10px] text-slate-400 font-medium">Güne Tıklayıp Detayları Gör</span>
      </div>

      {/* Gün Seçici Menü */}
      <div className="grid grid-cols-7 gap-2 text-center mb-6">
        {workoutProgress.map((item) => {
          const isSelected = selectedDay === item.day;
          return (
            <button 
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className="space-y-2 focus:outline-none group"
            >
              {/* Seçili gün yazı rengi Zümrüt Yeşili (#10B981) olarak güncellendi */}
              <span className={`text-[11px] font-semibold transition-colors block ${isSelected ? 'text-[#10B981]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.day}
              </span>
              
              {/* 
                Tasarım Güncellemeleri:
                - Tamamlanan günler: Derin kadife zümrüt yeşili (#0A3A25) arka plan ve çok hafif mat altın sınır çizgisiyle lüks bir parıltı kazandı.
                - Bugünün halkası: Sıradan siyah yerine asil Mat Altın (#C5A880) halkasıyla sarıldı.
                - Seçili ama bitmemiş gün: Zümrüt parıltılı yumuşak bir yeşile büründü.
              */}
              <div className={`h-11 rounded-xl flex items-center justify-center transition-all relative
                ${item.completed ? 'bg-[#0A3A25] text-white shadow-md shadow-[#0A3A25]/20 border border-[#C5A880]/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}
                ${item.isToday ? 'ring-2 ring-[#C5A880] ring-offset-2' : ''}
                ${isSelected && !item.completed ? 'border-2 border-[#10B981] bg-[#10B981]/5 text-[#10B981]' : ''}
              `}>
                {item.completed ? <Check size={14} strokeWidth={3} className="text-[#C5A880]" /> : <span className="text-[10px] font-bold">•</span>}
                {item.isToday && (
                  /* Bugünün küçük bildirim noktası artık parlayan asil mat altın renginde */
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C5A880] rounded-full border-2 border-white"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Seçili Güne Ait Egzersiz Detayları */}
      <div className="bg-[#F8FAF8] border border-slate-100 rounded-2xl p-4">
        <div className="mb-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Bölge & Odak</span>
          <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">{currentDayData.target}</h4>
        </div>

        {currentDayData.exercises.length > 0 ? (
          <div className="space-y-2.5 border-t border-slate-100 pt-3">
            {currentDayData.exercises.map((exercise) => (
              <div 
                key={exercise.id}
                onClick={() => toggleExercise(selectedDay, exercise.id)}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 cursor-pointer transition-all hover:shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  {exercise.completed ? (
                    /* Checkbox ikonları tamamen Zümrüt Yeşili (#10B981) olarak güncellendi */
                    <CheckSquare size={18} className="text-[#10B981]" />
                  ) : (
                    <Square size={18} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                  )}
                  <div>
                    <p className={`text-xs font-bold transition-all ${exercise.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {exercise.name}
                    </p>
                    <span className="text-[10px] text-slate-400">{exercise.sets}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-t border-dashed border-slate-200 mt-3 text-slate-400 text-xs">
            Bugün planlanmış ağırlık antrenmanı bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}