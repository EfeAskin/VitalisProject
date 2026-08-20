"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Dumbbell,
  Clock,
  Edit3,
  Trash2,
  Send,
  Zap,
  Utensils,
  Apple,
  Loader2,
  Flame
} from 'lucide-react';

import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';
import ExerciseDatabase from './components/ExerciseDatabase';
import FoodDatabase from './components/FoodDatabase';
import DietTemplateBuilder from './components/DietTemplateBuilder';
import AssignWorkoutModal from './components/AssignWorkoutModal';

function ProgramsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [userRole, setUserRole] = useState('trainer');
  const [activeTab, setActiveTab] = useState('workout-templates');

  // State'ler
  const [isWorkoutBuilderOpen, setIsWorkoutBuilderOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  // Statik veriyi kaldırdık, boş dizi ile başlatıyoruz
  const [workouts, setWorkouts] = useState([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);

  // Diyetisyen State'leri
  const [isDietBuilderOpen, setIsDietBuilderOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState(null);
  const [diets, setDiets] = useState([]);

  // --- EKLENEN: Danışana Ata Modal State'leri ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState(null);
  // ----------------------------------------------

  // 1. Veritabanından / Oturumdan Rolü Çekme
  useEffect(() => {
    async function checkRole() {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("access_token");

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
        console.warn("Kullanıcı rolü alınırken Hata:", err);
      }
    }

    checkRole();
  }, []);

  // 2. URL'deki Navbar Parametrelerine Göre Tab Ayarlama
  useEffect(() => {
    if (userRole === 'dietitian') {
      if (
        tabParam === 'food-database' ||
        tabParam === 'database'
      ) {
        setActiveTab('food-database');
      } else if (
        tabParam === 'diet-templates' ||
        tabParam === 'templates' ||
        !tabParam
      ) {
        setActiveTab('diet-templates');
      }
    } else {
      if (
        tabParam === 'exercise-library' ||
        tabParam === 'database'
      ) {
        setActiveTab('exercise-database');
      } else if (
        tabParam === 'workout-templates' ||
        tabParam === 'templates' ||
        !tabParam
      ) {
        setActiveTab('workout-templates');
      }
    }
  }, [tabParam, userRole]);

  // 3. VERİTABANINDAN ANTRENMAN ŞABLONLARINI ÇEKME
  const fetchWorkouts = async () => {
    try {
      setIsLoadingWorkouts(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      const res = await fetch('/api/expert/workout-templates', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();

        const rawList = Array.isArray(data)
          ? data
          : (data.templates || data.data || []);

        const formattedWorkouts = rawList.map(t => ({
          id: t.id,

          title: t.name || t.title,

          level:
            t.difficulty_level ||
            t.level ||
            'Başlangıç',

          duration:
            t.duration_minutes ||
            t.duration ||
            45,

          // Kalori bilgisini farklı olası backend alanlarından yakala
          calories:
            t.calories ??
            t.calories_burned ??
            t.estimated_calories ??
            t.kcal ??
            null,

          targetMuscles:
            t.target_muscles ||
            t.targetMuscles ||
            [],

          exercises: (t.exercises || []).map(e => {
            const videoUrl = e.video_url || "";

            let mediaType = "none";
            let mediaLink = "";

            if (videoUrl) {
              if (videoUrl.includes("/static/uploads/")) {
                mediaType = "video";
                mediaLink = videoUrl;
              } else if (
                videoUrl.startsWith("http://") ||
                videoUrl.startsWith("https://") ||
                videoUrl.includes("youtube") ||
                videoUrl.includes("youtu.be")
              ) {
                mediaType = "youtube";
                mediaLink = videoUrl;
              } else {
                mediaType = "youtube";
                mediaLink = videoUrl;
              }
            }

            return {
              id: e.exercise_id || e.id,
              name: e.name || "Egzersiz",
              sets: e.sets || 3,
              reps: e.reps || "10-12",
              notes: e.notes || "",
              mediaType: mediaType,
              mediaLink: mediaLink,
              video_url: videoUrl
            };
          })
        }));

        setWorkouts(formattedWorkouts);
      }
    } catch (err) {
      console.error(
        "Şablonlar veritabanından çekilirken hata oluştu:",
        err
      );
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    if (
      userRole === 'trainer' &&
      activeTab === 'workout-templates'
    ) {
      fetchWorkouts();
    }
  }, [userRole, activeTab]);

  const handleSaveWorkout = () => {
    fetchWorkouts();
    setIsWorkoutBuilderOpen(false);
    setEditingWorkout(null);
  };

  const handleEditWorkout = async (workout) => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      const res = await fetch(
        `/api/expert/workout-templates/${workout.id}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.ok) {
        const detailData = await res.json();

        const t =
          detailData.template ||
          detailData.data ||
          detailData;

        if (t) {
          const formattedEditWorkout = {
            id: t.id,

            title:
              t.name ||
              t.title ||
              workout.title,

            level:
              t.difficulty_level ||
              t.level ||
              workout.level,

            duration:
              t.duration_minutes ||
              t.duration ||
              workout.duration,

            // Düzenleme ekranında da kalori bilgisini koru
            calories:
              t.calories ??
              t.calories_burned ??
              t.estimated_calories ??
              t.kcal ??
              workout.calories ??
              null,

            targetMuscles:
              t.target_muscles ||
              t.targetMuscles ||
              workout.targetMuscles ||
              [],

            exercises: (t.exercises || []).map(e => {
              const videoUrl = e.video_url || "";

              let mediaType = "none";
              let mediaLink = "";

              if (videoUrl) {
                if (videoUrl.includes("/static/uploads/")) {
                  mediaType = "video";
                  mediaLink = videoUrl;
                } else if (
                  videoUrl.startsWith("http://") ||
                  videoUrl.startsWith("https://") ||
                  videoUrl.includes("youtube") ||
                  videoUrl.includes("youtu.be")
                ) {
                  mediaType = "youtube";
                  mediaLink = videoUrl;
                } else {
                  mediaType = "youtube";
                  mediaLink = videoUrl;
                }
              }

              return {
                id: e.exercise_id || e.id,
                name: e.name || "Egzersiz",
                sets: e.sets || 3,
                reps: e.reps || "10-12",
                notes: e.notes || "",
                mediaType: mediaType,
                mediaLink: mediaLink,
                video_url: videoUrl
              };
            })
          };

          setEditingWorkout(formattedEditWorkout);
          setIsWorkoutBuilderOpen(true);
          return;
        }
      }

      setEditingWorkout(workout);
      setIsWorkoutBuilderOpen(true);
    } catch (err) {
      console.error(
        "Şablon detayı alınırken hata oluştu:",
        err
      );

      setEditingWorkout(workout);
      setIsWorkoutBuilderOpen(true);
    }
  };

  const handleDeleteWorkout = async (templateId) => {
    if (
      !confirm(
        "Bu antrenman şablonunu silmek istediğinizden emin misiniz?"
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      const res = await fetch(
        `/api/expert/workout-templates/${templateId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );

      if (res.ok) {
        fetchWorkouts();
      }
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#11142D] text-slate-200 p-4 lg:p-6 space-y-6 font-sans text-sm">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Program Yönetimi

            {userRole === 'dietitian' ? (
              <Apple
                className="text-emerald-500"
                size={24}
              />
            ) : (
              <Zap
                className="text-[#EA580C]"
                fill="#EA580C"
                size={22}
              />
            )}
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            {userRole === 'dietitian'
              ? "Danışanlarınız için beslenme ve diyet planları oluşturun, besin makro veritabanını yönetin."
              : "Danışanlarınız için üst düzey antrenman şablonları oluşturun ve egzersiz veritabanını yönetin."}
          </p>
        </div>

        {userRole === 'trainer' &&
          activeTab === 'workout-templates' && (
            <button
              onClick={() => {
                setEditingWorkout(null);
                setIsWorkoutBuilderOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#EA580C] to-orange-500 hover:from-orange-600 hover:to-orange-500 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300 border border-white/10"
            >
              <Plus size={18} />
              Yeni Şablon Oluştur
            </button>
          )}
      </div>

      <div className="flex border-b border-white/10 gap-8">

        {userRole === 'trainer' && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveTab('workout-templates')
              }
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'workout-templates'
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Dumbbell
                size={16}
                className={
                  activeTab === 'workout-templates'
                    ? 'text-[#EA580C]'
                    : ''
                }
              />

              Antrenman Şablonlarım (PT)

              {activeTab === 'workout-templates' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C] rounded-t-full shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab('exercise-database')
              }
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'exercise-database'
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Zap
                size={16}
                className={
                  activeTab === 'exercise-database'
                    ? 'text-[#EA580C]'
                    : ''
                }
              />

              Egzersiz Veritabanı

              {activeTab === 'exercise-database' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C] rounded-t-full shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
              )}
            </button>
          </>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

        {userRole === 'trainer' &&
          activeTab === 'workout-templates' && (
            <>
              {isLoadingWorkouts ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2
                    size={36}
                    className="animate-spin text-[#EA580C] mb-3"
                  />
                  <p>
                    Veritabanından antrenman şablonları
                    yükleniyor...
                  </p>
                </div>
              ) : workouts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1A1F37]/40 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                  <Dumbbell
                    className="text-slate-600 mb-4"
                    size={48}
                  />

                  <p className="text-lg font-bold text-white">
                    Henüz şablon oluşturmadınız.
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    İlk premium programınızı hazırlamaya başlayın.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-[#1A1F37]/60 backdrop-blur-md border border-white/10 hover:border-orange-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(234,88,12,0.1)]"
                    >

                      <div>

                        {/* ÜST BAR */}
                        <div className="flex justify-between items-start mb-4">

                          <div className="flex items-center gap-2 flex-wrap">

                            {/* Zorluk Rozeti */}
                            <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                              {workout.level}
                            </span>

                            {/* 🔥 KALORİ ROZETİ */}
                            {workout.calories !== null &&
                              workout.calories !== undefined &&
                              workout.calories !== '' && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(234,88,12,0.18)]">
                                  <Flame
                                    size={13}
                                    className="text-orange-500"
                                    fill="currentColor"
                                  />

                                  {Number(workout.calories).toLocaleString('tr-TR')} kcal
                                </span>
                              )}

                          </div>

                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditWorkout(workout)
                              }
                              className="p-2 bg-[#2D3455] hover:bg-orange-600 text-slate-300 hover:text-white rounded-xl transition-all"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteWorkout(
                                  workout.id
                                )
                              }
                              className="p-2 bg-[#2D3455] hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        </div>

                        {/* BAŞLIK */}
                        <h3 className="font-extrabold text-white text-lg mb-4">
                          {workout.title}
                        </h3>

                        {/* METRİKLER */}
                        <div className="flex items-center gap-6 text-xs font-medium text-slate-400 mb-6">

                          <span className="flex items-center gap-2">
                            <Clock
                              size={16}
                              className="text-orange-500"
                            />

                            {workout.duration} Dk
                          </span>

                          <span className="flex items-center gap-2">
                            <Dumbbell
                              size={16}
                              className="text-orange-500"
                            />

                            {workout.exercises?.length || 0} Egzersiz
                          </span>

                        </div>

                        {/* EGZERSİZ LİSTESİ */}
                        <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-white/5 mb-4 space-y-3">

                          {(workout.exercises || [])
                            .slice(0, 3)
                            .map((ex, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center text-xs"
                              >
                                <span className="text-slate-300 font-medium truncate pr-3">
                                  • {ex.name}
                                </span>

                                <span className="font-bold text-orange-400 whitespace-nowrap">
                                  {ex.sets} x {ex.reps}
                                </span>
                              </div>
                            ))}

                        </div>
                      </div>

                      {/* DANIŞANA ATA */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkoutForAssign(
                            workout
                          );

                          setIsAssignModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3455] hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
                      >
                        <Send size={16} />
                        Danışana Ata
                      </button>

                    </div>
                  ))}

                </div>
              )}
            </>
          )}

        {userRole === 'trainer' &&
          activeTab === 'exercise-database' && (
            <ExerciseDatabase />
          )}

      </div>

      <WorkoutTemplateBuilder
        isOpen={isWorkoutBuilderOpen}
        onClose={() =>
          setIsWorkoutBuilderOpen(false)
        }
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />

      <AssignWorkoutModal
        isOpen={isAssignModalOpen}
        onClose={() =>
          setIsAssignModalOpen(false)
        }
        workoutTemplate={selectedWorkoutForAssign}
      />

    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#11142D] p-8 text-white font-bold text-sm">
          Arayüz Yükleniyor...
        </div>
      }
    >
      <ProgramsContent />
    </Suspense>
  );
}