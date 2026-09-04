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
  Flame,
  Beef,
  Wheat,
  Droplet
} from 'lucide-react';

import WorkoutTemplateBuilder from './components/WorkoutTemplateBuilder';
import ExerciseDatabase from './components/ExerciseDatabase';
import FoodDatabase from './components/FoodDatabase';
import DietTemplateBuilder from './components/DietTemplateBuilder';
import AssignWorkoutModal from './components/AssignWorkoutModal';

// Token ve Auth başlıklarını güvenli şekilde hazırlayan yardımcı fonksiyon
const getAuthHeaders = () => {
  if (typeof window === "undefined") return { 'Content-Type': 'application/json' };

  let token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token || token === "null" || token === "undefined") {
    return { 'Content-Type': 'application/json' };
  }

  if (token.startsWith("Bearer ")) {
    token = token.substring(7);
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

function ProgramsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [userRole, setUserRole] = useState('trainer');
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('workout-templates');

  // PT / Trainer State'leri
  const [isWorkoutBuilderOpen, setIsWorkoutBuilderOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);

  // Diyetisyen State'leri
  const [isDietBuilderOpen, setIsDietBuilderOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState(null);
  const [diets, setDiets] = useState([]);
  const [isLoadingDiets, setIsLoadingDiets] = useState(false);

  // Danışana Antrenman / Diyet Ata Modal State'leri
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState(null);

  // 1. Veritabanından / Oturumdan Rolü ve Kullanıcı ID'sini Çekme
  useEffect(() => {
    async function checkRole() {
      try {
        const storedRole = localStorage.getItem("role");
        const storedUserId = localStorage.getItem("user_id") || localStorage.getItem("userId");

        if (storedRole) {
          setUserRole(storedRole);
        }
        if (storedUserId) {
          setUserId(storedUserId);
        }

        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        
        // Token yoksa gereksiz /api/auth/me çağrısı yapıp 401 almanın önüne geçilir
        if (!token || token === "null" || token === "undefined") {
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: getAuthHeaders()
        });

        if (res.ok) {
          const data = await res.json();

          if (data.role) {
            setUserRole(data.role);
            localStorage.setItem("role", data.role);
          }
          if (data.id) {
            setUserId(data.id);
            localStorage.setItem("user_id", data.id);
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

  // 3. VERİTABANINDAN ANTRENMAN ŞABLONLARINI ÇEKME (PT)
  const fetchWorkouts = async () => {
    try {
      setIsLoadingWorkouts(true);

      const res = await fetch('/api/expert/workout-templates', {
        headers: getAuthHeaders()
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
      const res = await fetch(
        `/api/expert/workout-templates/${workout.id}`,
        {
          headers: getAuthHeaders()
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
      const res = await fetch(
        `/api/expert/workout-templates/${templateId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (res.ok) {
        fetchWorkouts();
      }
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  // 4. VERİTABANINDAN DİYET ŞABLONLARINI ÇEKME (DİYETİSYEN)
  const fetchDiets = async () => {
    try {
      setIsLoadingDiets(true);

      const currentUserId = userId || localStorage.getItem("user_id") || localStorage.getItem("userId");
      
      // Backend router adresi /api/expert-diet-program/templates
      let url = `/api/expert-diet-program/templates${currentUserId ? `?dietitian_id=${currentUserId}` : ''}`;

      let res = await fetch(url, {
        headers: getAuthHeaders()
      });

      // Eski endpoint yönlendirmesi varsa yedek olarak denenir
      if (res.status === 404) {
        res = await fetch('/api/expert/diet-templates', {
          headers: getAuthHeaders()
        });
      }

      if (res.ok) {
        const data = await res.json();

        // API çıktısının nesne veya dizi olmasına bağlı tam çözümleme
        const rawList = Array.isArray(data)
          ? data
          : (data.templates || data.diets || data.data || data.programs || data.items || []);

        const formattedDiets = rawList.map(t => {
          const rawMeals = t.day_types || t.dayTypes || t.meals || t.days || [];

          // Öncelikli Dinamik ve Sabit Kalori/Makro Değerleri Çözümlemesi
          const dynamicCal = Number(t.dynamic_cal || t.dynamicCal || 0);
          const dynamicProt = Number(t.dynamic_prot || t.dynamicProt || 0);
          const dynamicCarbs = Number(t.dynamic_carbs || t.dynamicCarbs || 0);
          const dynamicFat = Number(t.dynamic_fat || t.dynamicFat || 0);

          const finalCal = dynamicCal > 0 ? Math.round(dynamicCal) : (t.calculated_calories ?? t.target_calories ?? t.targetCalories ?? t.calories ?? t.kcal ?? 2000);
          const finalProt = dynamicProt > 0 ? Number(dynamicProt.toFixed(1)) : (t.calculated_protein_g ?? t.target_protein_g ?? t.protein ?? t.targetProteinGrams ?? t.target_protein ?? 0);
          const finalCarbs = dynamicCarbs > 0 ? Number(dynamicCarbs.toFixed(1)) : (t.calculated_carbs_g ?? t.target_carbs_g ?? t.carbs ?? t.targetCarbsGrams ?? t.target_carbs ?? 0);
          const finalFat = dynamicFat > 0 ? Number(dynamicFat.toFixed(1)) : (t.calculated_fat_g ?? t.target_fat_g ?? t.fat ?? t.targetFatGrams ?? t.target_fat ?? 0);

          return {
            id: t.id,
            title: t.title || t.name || 'Diyet Şablonu',
            goal: t.goal || t.category || t.type || 'GENEL DİYET',
            targetCalories: finalCal,
            protein: finalProt,
            carbs: finalCarbs,
            fat: finalFat,
            duration: t.duration_days || t.duration || t.days_count || (Array.isArray(rawMeals) && rawMeals.length > 0 ? rawMeals.length : 7),
            meals: rawMeals,
            description: t.description || t.notes || ""
          };
        });

        setDiets(formattedDiets);
      }
    } catch (err) {
      console.error(
        "Diyet şablonları veritabanından çekilirken hata oluştu:",
        err
      );
    } finally {
      setIsLoadingDiets(false);
    }
  };

  useEffect(() => {
    if (
      userRole === 'dietitian' &&
      activeTab === 'diet-templates'
    ) {
      fetchDiets();
    }
  }, [userRole, activeTab, userId]);

  const handleSaveDiet = () => {
    fetchDiets();
    setIsDietBuilderOpen(false);
    setEditingDiet(null);
  };

  const handleEditDiet = async (diet) => {
    try {
      let res = await fetch(
        `/api/expert-diet-program/templates/${diet.id}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (res.status === 404) {
        res = await fetch(
          `/api/expert/diet-templates/${diet.id}`,
          {
            headers: getAuthHeaders()
          }
        );
      }

      if (res.ok) {
        const detailData = await res.json();
        const t =
          detailData.template ||
          detailData.diet ||
          detailData.data ||
          detailData;

        if (t) {
          setEditingDiet(t);
          setIsDietBuilderOpen(true);
          return;
        }
      }

      setEditingDiet(diet);
      setIsDietBuilderOpen(true);
    } catch (err) {
      console.error(
        "Diyet şablonu detayı alınırken hata oluştu:",
        err
      );
      setEditingDiet(diet);
      setIsDietBuilderOpen(true);
    }
  };

  const handleDeleteDiet = async (templateId) => {
    if (
      !confirm(
        "Bu diyet şablonunu silmek istediğinizden emin misiniz?"
      )
    ) {
      return;
    }

    try {
      const currentUserId = userId || localStorage.getItem("user_id") || localStorage.getItem("userId");
      let url = `/api/expert-diet-program/templates/${templateId}${currentUserId ? `?dietitian_id=${currentUserId}` : ''}`;

      let res = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.status === 404) {
        res = await fetch(
          `/api/expert/diet-templates/${templateId}`,
          {
            method: 'DELETE',
            headers: getAuthHeaders()
          }
        );
      }

      if (res.ok) {
        fetchDiets();
      }
    } catch (err) {
      console.error("Diyet silme hatası:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#11142D] text-slate-200 p-4 lg:p-6 space-y-6 font-sans text-sm">

      {/* ÜST BAŞLIK VE AKSİYON BUTONLARI */}
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

        {/* PT YENİ ŞABLON BUTONU */}
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

        {/* DİYETİSYEN YENİ ŞABLON BUTONU */}
        {userRole === 'dietitian' &&
          activeTab === 'diet-templates' && (
            <button
              onClick={() => {
                setEditingDiet(null);
                setIsDietBuilderOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 border border-white/10"
            >
              <Plus size={18} />
              Yeni Diyet Şablonu Oluştur
            </button>
          )}
      </div>

      {/* SEKMELER (TABS) */}
      <div className="flex border-b border-white/10 gap-8">

        {/* PT SEKMELERİ */}
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

        {/* DİYETİSYEN SEKMELERİ */}
        {userRole === 'dietitian' && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveTab('diet-templates')
              }
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'diet-templates'
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Utensils
                size={16}
                className={
                  activeTab === 'diet-templates'
                    ? 'text-emerald-500'
                    : ''
                }
              />

              Beslenme & Diyet Planları

              {activeTab === 'diet-templates' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab('food-database')
              }
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'food-database'
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Apple
                size={16}
                className={
                  activeTab === 'food-database'
                    ? 'text-emerald-500'
                    : ''
                }
              />

              Besin & Kalori Veritabanı

              {activeTab === 'food-database' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              )}
            </button>
          </>
        )}
      </div>

      {/* İÇERİK ALANI */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* PT ANTRENMAN ŞABLONLARI LİSTESİ */}
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
                          setSelectedWorkoutForAssign({
                            ...workout,
                            isDiet: false
                          });

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

        {/* PT EGZERSİZ VERİTABANI */}
        {userRole === 'trainer' &&
          activeTab === 'exercise-database' && (
            <ExerciseDatabase />
          )}

        {/* DİYETİSYEN DİYET ŞABLONLARI LİSTESİ (PT KISMI İLE BİREBİR AYNI DÜZEN) */}
        {userRole === 'dietitian' &&
          activeTab === 'diet-templates' && (
            <>
              {isLoadingDiets ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2
                    size={36}
                    className="animate-spin text-emerald-500 mb-3"
                  />
                  <p>
                    Veritabanından diyet şablonları yükleniyor...
                  </p>
                </div>
              ) : diets.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1A1F37]/40 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                  <Utensils
                    className="text-slate-600 mb-4"
                    size={48}
                  />

                  <p className="text-lg font-bold text-white">
                    Henüz diyet şablonu oluşturmadınız.
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    Danışanlarınız için yeni beslenme ve diyet planı hazırlamaya başlayın.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {diets.map((diet) => {
                    const mealList = Array.isArray(diet.meals) ? diet.meals : [];

                    return (
                      <div
                        key={diet.id}
                        className="bg-[#1A1F37]/60 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      >
                        <div>
                          {/* ÜST BAR (HEDEF / KALORİ ROZETİ + AKSİYONLAR) */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Hedef Rozeti */}
                              <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                {diet.goal}
                              </span>

                              {/* 🔥 KALORİ ROZETİ */}
                              {diet.targetCalories !== null &&
                                diet.targetCalories !== undefined &&
                                diet.targetCalories !== '' && (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(234,88,12,0.18)]">
                                    <Flame
                                      size={13}
                                      className="text-orange-500"
                                      fill="currentColor"
                                    />
                                    {Number(diet.targetCalories).toLocaleString('tr-TR')} kcal
                                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEditDiet(diet)}
                                className="p-2 bg-[#2D3455] hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition-all"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDiet(diet.id)}
                                className="p-2 bg-[#2D3455] hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* BAŞLIK */}
                          <h3 className="font-extrabold text-white text-lg mb-3 line-clamp-1">
                            {diet.title}
                          </h3>

                          {/* METRİKLER (PT METRİKLERİ İLE BİREBİR PARALEL) */}
                          <div className="flex items-center gap-6 text-xs font-medium text-slate-400 mb-4">
                            <span className="flex items-center gap-2">
                              <Clock size={16} className="text-emerald-500" />
                              {diet.duration} Gün
                            </span>

                            <span className="flex items-center gap-2">
                              <Utensils size={16} className="text-emerald-500" />
                              {mealList.length} Öğün / Bölüm
                            </span>
                          </div>

                          {/* MAKROLAR */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium mb-4 bg-[#11142D]/40 p-2.5 rounded-xl border border-white/5">
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                                <Beef size={10} className="text-rose-400" /> Protein
                              </span>
                              <span className="font-bold text-rose-400">{diet.protein}g</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                                <Wheat size={10} className="text-amber-400" /> Karb
                              </span>
                              <span className="font-bold text-amber-400">{diet.carbs}g</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                                <Droplet size={10} className="text-cyan-400" /> Yağ
                              </span>
                              <span className="font-bold text-cyan-400">{diet.fat}g</span>
                            </div>
                          </div>

                          {/* ÖĞÜN İÇERİK ÖNİZLEMESİ (EGZERSİZ LİSTESİ İLE BİREBİR AYNI YAPIDA) */}
                          <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-white/5 mb-4 space-y-3">
                            {mealList.length === 0 ? (
                              <div className="text-xs text-slate-500 italic text-center py-1">
                                Öğün detayı bulunmuyor
                              </div>
                            ) : (
                              mealList.slice(0, 3).map((meal, i) => {
                                const mealName = meal.name || meal.title || meal.meal_name || `Öğün ${i + 1}`;
                                const items = meal.items || meal.foods || meal.options?.[0]?.items || [];
                                const itemCount = items.length;
                                const firstItemName = items[0]?.name || items[0]?.foodName || items[0]?.food_name;

                                return (
                                  <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-300 font-medium truncate pr-3 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                      {mealName}
                                    </span>
                                    <span className="font-bold text-emerald-400 whitespace-nowrap">
                                      {firstItemName ? `${firstItemName}${itemCount > 1 ? ` (+${itemCount - 1})` : ''}` : `${itemCount || 1} Öğe`}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                            {mealList.length > 3 && (
                              <div className="text-[10px] text-center font-bold text-slate-500 pt-1 border-t border-white/5">
                                +{mealList.length - 3} öğün/bölüm daha
                              </div>
                            )}
                          </div>
                        </div>

                        {/* DANIŞANA ATA BUTONU */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWorkoutForAssign({
                              id: diet.id,
                              title: diet.title,
                              isDiet: true,
                              ...diet
                            });
                            setIsAssignModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3455] hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
                        >
                          <Send size={16} />
                          Danışana Ata
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        {/* DİYETİSYEN BESİN & KALORİ VERİTABANI */}
        {userRole === 'dietitian' &&
          activeTab === 'food-database' && (
            <FoodDatabase />
          )}

      </div>

      {/* MODALLAR */}
      <WorkoutTemplateBuilder
        isOpen={isWorkoutBuilderOpen}
        onClose={() =>
          setIsWorkoutBuilderOpen(false)
        }
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />

      <DietTemplateBuilder
        isOpen={isDietBuilderOpen}
        onClose={() =>
          setIsDietBuilderOpen(false)
        }
        onSave={handleSaveDiet}
        initialData={editingDiet}
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