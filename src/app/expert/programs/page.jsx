"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Dumbbell, Clock, Edit3, Trash2, Send, Zap } from 'lucide-react';
import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';
import ExerciseDatabase from './components/ExerciseDatabase';

function ProgramsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState('templates');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  useEffect(() => {
    if (tabParam === 'exercise-library' || tabParam === 'database') {
      setActiveTab('database');
    } else if (tabParam === 'workout-templates' || tabParam === 'templates') {
      setActiveTab('templates');
    }
  }, [tabParam]);

  // FastAPI + Neon DB için örnek JSON Modeli
  const [workouts, setWorkouts] = useState([
    {
      id: "uuid-1234",
      title: "Elit Hipertrofi: Göğüs & Ön Kol",
      level: "İleri Seviye",
      duration: 60,
      targetMuscles: ["chest_upper", "chest_middle", "arm_biceps"],
      exercises: [
        { id: "ex-1", name: "Incline Dumbbell Press", sets: 4, reps: "8-10", mediaType: "youtube", mediaLink: "https://youtube.com/..." },
        { id: "ex-2", name: "Cable Crossover", sets: 3, reps: "12-15", mediaType: "none", mediaLink: "" },
      ]
    }
  ]);

  const handleSaveWorkout = (newWorkout) => {
    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === newWorkout.id ? newWorkout : w));
    } else {
      setWorkouts([{ ...newWorkout, id: `new-${Date.now()}` }, ...workouts]);
    }
    setIsBuilderOpen(false);
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = (id) => {
    if (confirm("Bu elit şablonu kalıcı olarak silmek istediğinize emin misiniz?")) {
      setWorkouts(workouts.filter(w => w.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 lg:p-6 space-y-6 font-sans text-sm">

      {/* Üst Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Program Yönetimi <Zap className="text-[#EA580C]" fill="#EA580C" size={18} />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Danışanlarınız için üst düzey antrenman şablonları oluşturun ve veritabanını yönetin.
          </p>
        </div>

        {activeTab === 'templates' && (
          <button
            onClick={() => { setEditingWorkout(null); setIsBuilderOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#EA580C] to-orange-500 hover:from-orange-600 hover:to-orange-500 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] transition-all duration-300"
          >
            <Plus size={15} /> Yeni Şablon Oluştur
          </button>
        )}
      </div>

      {/* Tab Navigasyonu */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'templates' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Antrenman Şablonlarım (PT)
          {activeTab === 'templates' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#EA580C] to-orange-400 rounded-t-full shadow-[0_-2px_8px_rgba(234,88,12,0.5)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'database' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Egzersiz Veritabanı
          {activeTab === 'database' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#EA580C] to-orange-400 rounded-t-full shadow-[0_-2px_8px_rgba(234,88,12,0.5)]" />
          )}
        </button>
      </div>

      {/* Tab İçerikleri */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'templates' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workouts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-14 bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl">
                <div className="p-4 bg-slate-800/50 rounded-full mb-3">
                  <Dumbbell className="text-slate-400" size={36} />
                </div>
                <p className="text-sm font-bold text-white">Henüz şablon oluşturmadınız.</p>
                <p className="text-xs text-slate-500 mt-1.5">İlk premium programınızı hazırlamaya başlayın.</p>
              </div>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="bg-[#111827] border border-slate-800 hover:border-slate-600 rounded-2xl p-4 shadow-xl transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black bg-orange-500/10 text-[#EA580C] border border-orange-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {workout.level}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setEditingWorkout(workout); setIsBuilderOpen(true); }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-white text-base mb-2">{workout.title}</h3>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#EA580C]" /> {workout.duration} Dk</span>
                      <span className="flex items-center gap-1.5"><Dumbbell size={14} className="text-[#EA580C]" /> {workout.exercises.length} Egzersiz</span>
                    </div>

                    <div className="bg-[#182134] p-3 rounded-xl border border-slate-800 mb-4 space-y-1.5">
                      {workout.exercises.slice(0, 3).map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium truncate pr-3">• {ex.name}</span>
                          <span className="font-bold text-[#EA580C] whitespace-nowrap">{ex.sets} x {ex.reps}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <p className="text-[10px] font-bold text-slate-500 pt-1.5 text-center border-t border-slate-800 mt-1.5">
                          + {workout.exercises.length - 3} egzersiz daha
                        </p>
                      )}
                    </div>
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-white text-white hover:text-black text-xs font-bold rounded-lg transition-colors">
                    <Send size={14} /> Danışana Ata
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <ExerciseDatabase />
        )}
      </div>

      <WorkoutTemplateBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1120] p-8 text-white font-bold text-sm">Arayüz Yükleniyor...</div>}>
      <ProgramsContent />
    </Suspense>
  );
}