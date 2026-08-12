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
    <div className="min-h-screen bg-[#11142D] text-slate-200 p-4 lg:p-6 space-y-6 font-sans text-sm">

      {/* Üst Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Program Yönetimi {userRole === 'dietitian' ? <Apple className="text-emerald-500" size={24} /> : <Zap className="text-[#EA580C]" fill="#EA580C" size={22} />}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 border border-white/10"
            >
              <Plus size={18} /> Yeni Diyet Şablonu
            </button>
          )
        ) : (
          activeTab === 'workout-templates' && (
            <button
              onClick={() => { setEditingWorkout(null); setIsWorkoutBuilderOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#EA580C] to-orange-500 hover:from-orange-600 hover:to-orange-500 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300 border border-white/10"
            >
              <Plus size={18} /> Yeni Şablon Oluştur
            </button>
          )
        )}
      </div>

      {/* Tab Navigasyonu (Neon Glow Underline) */}
      <div className="flex border-b border-white/10 gap-8">
        {userRole === 'dietitian' ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('diet-templates')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'diet-templates' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Utensils size={16} className={activeTab === 'diet-templates' ? 'text-emerald-400' : ''} />
              Beslenme & Diyet Planları
              {activeTab === 'diet-templates' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('food-database')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'food-database' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Apple size={16} className={activeTab === 'food-database' ? 'text-emerald-400' : ''} />
              Besin & Kalori Veritabanı
              {activeTab === 'food-database' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('workout-templates')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'workout-templates' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Dumbbell size={16} className={activeTab === 'workout-templates' ? 'text-[#EA580C]' : ''} />
              Antrenman Şablonlarım (PT)
              {activeTab === 'workout-templates' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C] rounded-t-full shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exercise-database')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'exercise-database' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Zap size={16} className={activeTab === 'exercise-database' ? 'text-[#EA580C]' : ''} />
              Egzersiz Veritabanı
              {activeTab === 'exercise-database' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C] rounded-t-full shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Tab İçerikleri */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* DİYETİSYEN: Beslenme & Diyet Planları */}
        {userRole === 'dietitian' && activeTab === 'diet-templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {diets.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1A1F37]/40 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                <Utensils className="text-slate-600 mb-4" size={48} />
                <p className="text-lg font-bold text-white">Henüz diyet şablonu oluşturmadınız.</p>
                <p className="text-sm text-slate-400 mt-2">İlk premium beslenme planınızı hazırlamaya başlayın.</p>
              </div>
            ) : (
              diets.map((diet) => (
                <div key={diet.id} className="bg-[#1A1F37]/60 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                        {diet.goal}
                      </span>
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setEditingDiet(diet); setIsDietBuilderOpen(true); }}
                          className="p-2 bg-[#2D3455] hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiets(diets.filter(d => d.id !== diet.id))}
                          className="p-2 bg-[#2D3455] hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-white text-lg mb-4 group-hover:text-emerald-400 transition-colors">{diet.title}</h3>

                    {/* Makro Barları */}
                    <div className="grid grid-cols-4 gap-2 bg-[#11142D] p-3 rounded-2xl border border-white/5 mb-4 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Kalori</span>
                        <span className="text-sm font-bold text-white">{diet.totalCalories}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Prot</span>
                        <span className="text-sm font-bold text-rose-400">{diet.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Karb</span>
                        <span className="text-sm font-bold text-amber-400">{diet.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Yağ</span>
                        <span className="text-sm font-bold text-blue-400">{diet.fat}g</span>
                      </div>
                    </div>

                    {/* Öğün Önizleme */}
                    <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-white/5 mb-4 space-y-3">
                      {diet.meals.map((meal, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-bold text-emerald-400 block mb-1">• {meal.name}</span>
                          <p className="text-[11px] text-slate-400 truncate pl-3">
                            {meal.items.map(i => `${i.foodName} (${i.portion})`).join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3455] hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg">
                    <Send size={16} /> Danışana Gönder
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workouts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1A1F37]/40 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                <Dumbbell className="text-slate-600 mb-4" size={48} />
                <p className="text-lg font-bold text-white">Henüz şablon oluşturmadınız.</p>
                <p className="text-sm text-slate-400 mt-2">İlk premium programınızı hazırlamaya başlayın.</p>
              </div>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="bg-[#1A1F37]/60 backdrop-blur-md border border-white/10 hover:border-orange-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                        {workout.level}
                      </span>
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setEditingWorkout(workout); setIsWorkoutBuilderOpen(true); }}
                          className="p-2 bg-[#2D3455] hover:bg-orange-600 text-slate-300 hover:text-white rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkouts(workouts.filter(w => w.id !== workout.id))}
                          className="p-2 bg-[#2D3455] hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-white text-lg mb-4">{workout.title}</h3>

                    <div className="flex items-center gap-6 text-xs font-medium text-slate-400 mb-6">
                      <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> {workout.duration} Dk</span>
                      <span className="flex items-center gap-2"><Dumbbell size={16} className="text-orange-500" /> {workout.exercises.length} Egzersiz</span>
                    </div>

                    <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-white/5 mb-4 space-y-3">
                      {workout.exercises.slice(0, 3).map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-medium truncate pr-3">• {ex.name}</span>
                          <span className="font-bold text-orange-400 whitespace-nowrap">{ex.sets} x {ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3455] hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg">
                    <Send size={16} /> Danışana Ata
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
    <Suspense fallback={<div className="min-h-screen bg-[#11142D] p-8 text-white font-bold text-sm">Arayüz Yükleniyor...</div>}>
      <ProgramsContent />
    </Suspense>
  );
}