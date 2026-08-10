"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Dumbbell, Clock, Edit3, Trash2, Send, Zap, Utensils, Apple, Flame, Beef, Wheat, Droplet, Sparkles } from 'lucide-react';
import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';
import ExerciseDatabase from './components/ExerciseDatabase';
import FoodDatabase from './components/FoodDatabase';
import DietTemplateBuilder from './components/DietTemplateBuilder';

function ProgramsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Kullanıcı Rolü ('trainer' veya 'dietitian')
  const [userRole, setUserRole] = useState('dietitian'); // Oturum yüklenene kadar dinamik
  const [activeTab, setActiveTab] = useState('templates');
  
  // Antrenör (PT) State'leri
  const [isWorkoutBuilderOpen, setIsWorkoutBuilderOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
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

  // Diyetisyen State'leri
  const [isDietBuilderOpen, setIsDietBuilderOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState(null);
  const [diets, setDiets] = useState([
    {
      id: "diet-1",
      title: "Ketojenik Yağ Yakım & Definisyon",
      goal: "Kilo Verme & Definisyon",
      targetCalories: 1850,
      totalCalories: 1820,
      protein: 140,
      carbs: 35,
      fat: 125,
      meals: [
        {
          id: "m-1",
          name: "Kahvaltı",
          items: [
            { id: "i-1", foodName: "Yumurta (Haşlanmış)", portion: "3 Adet", calories: 230, protein: 18, carbs: 1.5, fat: 15 },
            { id: "i-2", foodName: "Avokado", portion: "100g", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 }
          ]
        },
        {
          id: "m-2",
          name: "Öğle Yemeği",
          items: [
            { id: "i-3", foodName: "Izgara Somon", portion: "200g", calories: 412, protein: 40, carbs: 0, fat: 27 }
          ]
        }
      ]
    }
  ]);

  // 1. Veritabanından / Oturumdan Rolü Çekme
  useEffect(() => {
    async function checkRole() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        const storedRole = localStorage.getItem("role");
        
        if (storedRole) {
          setUserRole(storedRole);
        }

        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role) {
            setUserRole(data.role);
            localStorage.setItem("role", data.role);
          }
        }
      } catch (err) {
        console.warn("Kullanıcı rolü veritabanından alınırken fallback kullanıldı:", err);
      }
    }
    checkRole();
  }, []);

  // 2. URL'deki Navbar Parametrelerine Göre Tab Ayarlama
  useEffect(() => {
    if (userRole === 'dietitian') {
      if (tabParam === 'food-database' || tabParam === 'database') {
        setActiveTab('food-database');
      } else if (tabParam === 'diet-templates' || tabParam === 'templates' || !tabParam) {
        setActiveTab('diet-templates');
      }
    } else {
      if (tabParam === 'exercise-library' || tabParam === 'database') {
        setActiveTab('exercise-database');
      } else if (tabParam === 'workout-templates' || tabParam === 'templates' || !tabParam) {
        setActiveTab('workout-templates');
      }
    }
  }, [tabParam, userRole]);

  // Antrenör Şablon Kaydetme
  const handleSaveWorkout = (newWorkout) => {
    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === newWorkout.id ? newWorkout : w));
    } else {
      setWorkouts([{ ...newWorkout, id: `new-${Date.now()}` }, ...workouts]);
    }
    setIsWorkoutBuilderOpen(false);
    setEditingWorkout(null);
  };

  // Diyetisyen Şablon Kaydetme
  const handleSaveDiet = (newDiet) => {
    if (editingDiet) {
      setDiets(diets.map(d => d.id === newDiet.id ? newDiet : d));
    } else {
      setDiets([{ ...newDiet, id: `diet-${Date.now()}` }, ...diets]);
    }
    setIsDietBuilderOpen(false);
    setEditingDiet(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 lg:p-6 space-y-6 font-sans text-sm">

      {/* Üst Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Program Yönetimi {userRole === 'dietitian' ? <Apple className="text-emerald-500" size={20} /> : <Zap className="text-[#EA580C]" fill="#EA580C" size={18} />}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {userRole === 'dietitian'
              ? "Danışanlarınız için beslenme ve diyet planları oluşturun, besin makro veritabanını yönetin."
              : "Danışanlarınız için üst düzey antrenman şablonları oluşturun ve egzersiz veritabanını yönetin."}
          </p>
        </div>

        {/* Buton: Role ve Taba Göre Dinamik */}
        {userRole === 'dietitian' ? (
          activeTab === 'diet-templates' && (
            <button
              onClick={() => { setEditingDiet(null); setIsDietBuilderOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300"
            >
              <Plus size={15} /> Yeni Diyet Şablonu
            </button>
          )
        ) : (
          activeTab === 'workout-templates' && (
            <button
              onClick={() => { setEditingWorkout(null); setIsWorkoutBuilderOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#EA580C] to-orange-500 hover:from-orange-600 hover:to-orange-500 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-all duration-300"
            >
              <Plus size={15} /> Yeni Şablon Oluştur
            </button>
          )
        )}
      </div>

      {/* Tab Navigasyonu (Rol Odaklı) */}
      <div className="flex border-b border-slate-800 gap-6">
        {userRole === 'dietitian' ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('diet-templates')}
              className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'diet-templates' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Utensils size={14} className={activeTab === 'diet-templates' ? 'text-emerald-400' : ''} />
              Beslenme & Diyet Planları
              {activeTab === 'diet-templates' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('food-database')}
              className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'food-database' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Apple size={14} className={activeTab === 'food-database' ? 'text-emerald-400' : ''} />
              Besin & Kalori Veritabanı
              {activeTab === 'food-database' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('workout-templates')}
              className={`pb-3 text-xs font-bold transition-all relative ${
                activeTab === 'workout-templates' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Antrenman Şablonlarım (PT)
              {activeTab === 'workout-templates' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#EA580C] to-orange-400 rounded-t-full shadow-[0_-2px_8px_rgba(234,88,12,0.5)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exercise-database')}
              className={`pb-3 text-xs font-bold transition-all relative ${
                activeTab === 'exercise-database' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Egzersiz Veritabanı
              {activeTab === 'exercise-database' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#EA580C] to-orange-400 rounded-t-full shadow-[0_-2px_8px_rgba(234,88,12,0.5)]" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Tab İçerikleri */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* DİYETİSYEN: Beslenme & Diyet Planları */}
        {userRole === 'dietitian' && activeTab === 'diet-templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {diets.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-14 bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl">
                <Utensils className="text-slate-500 mb-3" size={36} />
                <p className="text-sm font-bold text-white">Henüz diyet şablonu oluşturmadınız.</p>
                <p className="text-xs text-slate-500 mt-1.5">İlk premium beslenme planınızı hazırlamaya başlayın.</p>
              </div>
            ) : (
              diets.map((diet) => (
                <div key={diet.id} className="bg-[#111827] border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {diet.goal}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setEditingDiet(diet); setIsDietBuilderOpen(true); }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiets(diets.filter(d => d.id !== diet.id))}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-white text-base mb-2 group-hover:text-emerald-400 transition-colors">{diet.title}</h3>

                    {/* Makro Barları */}
                    <div className="grid grid-cols-4 gap-1.5 bg-[#182134] p-2.5 rounded-xl border border-slate-800 mb-4 text-center">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Kalori</span>
                        <span className="text-xs font-bold text-white">{diet.totalCalories} kcal</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Prot</span>
                        <span className="text-xs font-bold text-rose-400">{diet.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Karb</span>
                        <span className="text-xs font-bold text-amber-400">{diet.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Yağ</span>
                        <span className="text-xs font-bold text-blue-400">{diet.fat}g</span>
                      </div>
                    </div>

                    {/* Öğün Önizleme */}
                    <div className="bg-[#182134]/50 p-3 rounded-xl border border-slate-800 mb-4 space-y-2">
                      {diet.meals.map((meal, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-bold text-emerald-400 block mb-0.5">• {meal.name}</span>
                          <p className="text-[11px] text-slate-400 truncate pl-2">
                            {meal.items.map(i => `${i.foodName} (${i.portion})`).join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-200 text-xs font-bold rounded-xl transition-all">
                    <Send size={14} /> Danışana Gönder
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* DİYETİSYEN: Besin & Kalori Veritabanı */}
        {userRole === 'dietitian' && activeTab === 'food-database' && (
          <FoodDatabase />
        )}

        {/* PT: Antrenman Şablonları */}
        {userRole === 'trainer' && activeTab === 'workout-templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workouts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-14 bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl">
                <Dumbbell className="text-slate-400 mb-3" size={36} />
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
                          onClick={() => { setEditingWorkout(workout); setIsWorkoutBuilderOpen(true); }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkouts(workouts.filter(w => w.id !== workout.id))}
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
                    </div>
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-white text-white hover:text-black text-xs font-bold rounded-lg transition-colors">
                    <Send size={14} /> Danışana Ata
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PT: Egzersiz Veritabanı */}
        {userRole === 'trainer' && activeTab === 'exercise-database' && (
          <ExerciseDatabase />
        )}

      </div>

      {/* PT Şablon Modalı */}
      <WorkoutTemplateBuilder
        isOpen={isWorkoutBuilderOpen}
        onClose={() => setIsWorkoutBuilderOpen(false)}
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />

      {/* Diyetisyen Şablon Modalı */}
      <DietTemplateBuilder
        isOpen={isDietBuilderOpen}
        onClose={() => setIsDietBuilderOpen(false)}
        onSave={handleSaveDiet}
        initialData={editingDiet}
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