"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  Swords,
  Activity,
  Dumbbell,
  Flame,
  Zap,
  Target,
  Shield,
  Trophy,
  Layers,
  Compass
} from "lucide-react";
import AssignedProgramsList from "./components/assignedprogramslist";
import ProgramDetailView from "./components/programdetailview";
import PresetWorkoutModal from "./components/PresetWorkoutModal";
import { PRESET_WORKOUTS } from "@/data/presetWorkouts";

// Kategorilere Özel Başlık, İkon ve Renk Konfigürasyonu
const CATEGORY_CONFIG = {
  combat: {
    title: "DÖVÜŞ SPORLARI AKTİVİTELERİ",
    icon: Swords,
    borderColor: "border-rose-500/20 hover:border-rose-400/60",
    bgGradient: "from-rose-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-rose-500/20 border-rose-400/30 text-rose-300",
    textColor: "text-rose-400",
    dotColor: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]",
  },
  stretching: {
    title: "ESNETME & MOBİLİTE REHBERİ",
    icon: Activity,
    borderColor: "border-emerald-500/20 hover:border-emerald-400/60",
    bgGradient: "from-emerald-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
    textColor: "text-emerald-400",
    dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]",
  },
  strength: {
    title: "GÖĞÜS & KUVVET ANTRENMANLARI",
    icon: Dumbbell,
    borderColor: "border-blue-500/20 hover:border-blue-400/60",
    bgGradient: "from-blue-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-blue-500/20 border-blue-400/30 text-blue-300",
    textColor: "text-blue-400",
    dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]",
  },
  legs: {
    title: "BACAK & KALÇA PROGRAMLARI",
    icon: Zap,
    borderColor: "border-amber-500/20 hover:border-amber-400/60",
    bgGradient: "from-amber-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-amber-500/20 border-amber-400/30 text-amber-300",
    textColor: "text-amber-400",
    dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]",
  },
  core: {
    title: "KARIN & CORE ÇALIŞMALARI",
    icon: Flame,
    borderColor: "border-orange-500/20 hover:border-orange-400/60",
    bgGradient: "from-orange-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-orange-500/20 border-orange-400/30 text-orange-300",
    textColor: "text-orange-400",
    dotColor: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]",
  },
  warmup: {
    title: "ANTRENMAN ÖNCESİ ISINMA",
    icon: Sparkles,
    borderColor: "border-cyan-500/20 hover:border-cyan-400/60",
    bgGradient: "from-cyan-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-cyan-500/20 border-cyan-400/30 text-cyan-300",
    textColor: "text-cyan-400",
    dotColor: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]",
  },
  arms: {
    title: "KOL GELİŞTİRME PROGRAMLARI",
    icon: Target,
    borderColor: "border-indigo-500/20 hover:border-indigo-400/60",
    bgGradient: "from-indigo-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-indigo-500/20 border-indigo-400/30 text-indigo-300",
    textColor: "text-indigo-400",
    dotColor: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,1)]",
  },
  back: {
    title: "SIRT & LAT ANTRENMANLARI",
    icon: Shield,
    borderColor: "border-purple-500/20 hover:border-purple-400/60",
    bgGradient: "from-purple-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-purple-500/20 border-purple-400/30 text-purple-300",
    textColor: "text-purple-400",
    dotColor: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,1)]",
  },
  shoulders: {
    title: "OMUZ & ÜST VÜCUT PROGRAMLARI",
    icon: Compass,
    borderColor: "border-sky-500/20 hover:border-sky-400/60",
    bgGradient: "from-sky-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-sky-500/20 border-sky-400/30 text-sky-300",
    textColor: "text-sky-400",
    dotColor: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,1)]",
  },
  fullbody: {
    title: "TÜM VÜCUT (FULL BODY) ATLETİK",
    icon: Trophy,
    borderColor: "border-teal-500/20 hover:border-teal-400/60",
    bgGradient: "from-teal-950/20 via-slate-900/40 to-slate-950/80",
    badgeBg: "bg-teal-500/20 border-teal-400/30 text-teal-300",
    textColor: "text-teal-400",
    dotColor: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)]",
  },
};

export default function WorkoutTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("main"); // 'main' | 'coach_list' | 'detail'

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeProgram, setActiveProgram] = useState(null);
  const [coachPrograms, setCoachPrograms] = useState([]);

  // Preset Workout Modal ve Filtreleme State'i
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  // Mevcut Verilerdeki Tüm Kategorileri Otomatik Toplama
  const availableCategories = Array.from(
    new Set(PRESET_WORKOUTS.map((w) => w.category))
  );

  // Statik Menü Yapısı (Kütüphanem Kartları)
  const categories = [
    {
      id: "from-coach",
      title: "EĞİTMENDEN GELENLER",
      bg: "https://img-hopi.mncdn.com/42/fd/42fd9ec31d0246fe846a4d4157032d9a.jpeg",
      premium: true,
    },
    {
      id: "my-creations",
      title: "BENİM OLUŞTURDUKLARIM",
      bg: "https://www.macfit.com/wp-content/uploads/2025/09/fitness-antrenman-header-43.jpg",
    },
    {
      id: "favorites",
      title: "FAVORİLERİM",
      bg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThkLkfcbdPChAuJbYQkmMqeIOgBSLdVrc7rQG-9jt0rdE57S9K_h1ZvdP4&s=10",
    },
    {
      id: "last-done",
      title: "EN SON YAPTIKLARIM",
      bg: "https://www.macfit.com/wp-content/uploads/2025/09/fitness-antrenman-programi-nasil-olmali.jpg?q=80&w=600",
    },
  ];

  // API'den Eğitmen Verilerini Çekme
  const fetchWorkoutData = async () => {
    setIsLoading(true);
    setError(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          localStorage.getItem("vitalis_token") ||
          localStorage.getItem("accessToken")
        : null;

    try {
      const response = await fetch("/api/client/workout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        let programsList = [];

        if (Array.isArray(data)) {
          programsList = data;
        } else if (Array.isArray(data.coachPrograms)) {
          programsList = data.coachPrograms;
        } else if (Array.isArray(data.programs)) {
          programsList = data.programs;
        } else if (Array.isArray(data.data)) {
          programsList = data.data;
        }

        setCoachPrograms(programsList);

        if (data.activeProgram) {
          setActiveProgram(data.activeProgram);
        } else if (programsList.length > 0) {
          setActiveProgram(programsList[0]);
        }
      } else {
        setError("Antrenman verisi alınamadı.");
      }
    } catch (err) {
      console.error("Workout fetch error:", err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, []);

  const handleCategoryClick = (catId) => {
    if (catId === "from-coach") {
      setActiveView("coach_list");
    }
  };

  const handleOpenDetail = (program) => {
    setSelectedProgram(program);
    setActiveView("detail");
  };

  const getSelectedProgramId = () => {
    if (!selectedProgram) return null;
    if (typeof selectedProgram === "object") {
      return (
        selectedProgram.id ??
        selectedProgram.program_id ??
        selectedProgram.workout_program_id ??
        selectedProgram._id ??
        selectedProgram.template_id ??
        null
      );
    }
    return selectedProgram;
  };

  const selectedProgramId = getSelectedProgramId();

  if (isLoading && !activeProgram && coachPrograms.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
        <p className="text-xs text-amber-300 font-bold animate-pulse">
          Antrenman Verileri Yükleniyor...
        </p>
      </div>
    );
  }

  // DETAY GÖRÜNÜMÜ
  if (activeView === "detail" && selectedProgramId) {
    return (
      <ProgramDetailView
        programId={selectedProgramId}
        onBack={() => {
          setSelectedProgram(null);
          setActiveView("coach_list");
        }}
      />
    );
  }

  // EĞİTMENDEN GELENLER LİSTE GÖRÜNÜMÜ
  if (activeView === "coach_list") {
    return (
      <AssignedProgramsList
        programs={coachPrograms}
        onSelectProgram={handleOpenDetail}
        onBack={() => setActiveView("main")}
        onRefresh={fetchWorkoutData}
        isLoading={isLoading}
      />
    );
  }

  // Kategorilere Göre Programları Gruplama
  const categoriesToRender =
    filterCategory === "all"
      ? availableCategories
      : availableCategories.filter((cat) => cat === filterCategory);

  return (
    <div className="space-y-12 animate-fadeIn pb-12">
      {/* 1. SEKTÖR: Aktif Program */}
      <div>
        <h4 className="text-xs font-black tracking-widest text-amber-400/90 mb-4 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]"></span>
          SENİN PROGRAMIN
        </h4>

        {activeProgram ? (
          <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/40 to-amber-900/10 border border-amber-500/40 rounded-3xl overflow-hidden relative group hover:border-amber-400/70 transition-all duration-500 shadow-[0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="p-8 md:col-span-7 flex flex-col justify-between z-10 space-y-6">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-400/30 uppercase backdrop-blur-md">
                    {activeProgram.subtitle ||
                      activeProgram.difficulty_level ||
                      "AKTİF PROGRAM"}
                  </span>

                  <h2 className="text-3xl font-black tracking-tight mt-4 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {activeProgram.title ||
                      activeProgram.name ||
                      "Antrenman Programı"}
                  </h2>

                  <p className="text-amber-100/70 text-xs leading-relaxed max-w-md font-medium">
                    {activeProgram.description ||
                      "Aktif atanan program detayları."}
                  </p>

                  <div className="flex gap-4 mt-5 text-xs text-amber-300/80 font-bold">
                    {activeProgram.duration && (
                      <span className="bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/20">
                        ⏱️ {activeProgram.duration}
                      </span>
                    )}

                    {activeProgram.duration_minutes && (
                      <span className="bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/20">
                        ⏱️ {activeProgram.duration_minutes} dk
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDetail(activeProgram)}
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black py-4 px-8 rounded-2xl text-xs tracking-widest transition-all duration-300 self-start flex items-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  PROGRAMA BAŞLA
                </button>
              </div>

              {activeProgram.imageUrl && (
                <div className="hidden md:block md:col-span-5 relative min-h-[280px] overflow-hidden">
                  <img
                    src={activeProgram.imageUrl}
                    alt="Gym"
                    className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#11142D] via-transparent to-transparent" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-amber-500/20 rounded-3xl p-8 text-center text-slate-400 text-xs">
            Şu anda atanmış aktif bir program bulunmuyor.
          </div>
        )}
      </div>

      {/* 2. SEKTÖR: Kütüphanem Navigasyonu */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black tracking-widest text-purple-400/90 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,1)]"></span>
            KATEGORİLER & KÜTÜPHANEM
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group relative rounded-3xl overflow-hidden aspect-video md:aspect-square cursor-pointer border transition-all duration-500 backdrop-blur-xl bg-purple-950/20 ${
                cat.premium
                  ? "border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:border-purple-400"
                  : "border-purple-500/20 hover:border-purple-400/50"
              }`}
            >
              <img
                src={cat.bg}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11142D] via-[#11142D]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-between h-auto">
                <h5 className="font-black text-xs tracking-wider text-purple-100 mb-1 uppercase group-hover:text-purple-300 transition-colors">
                  {cat.title}
                </h5>

                {cat.premium && (
                  <span className="text-[9px] font-black text-purple-300 flex items-center gap-1 bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/40 w-fit backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-purple-300 animate-pulse" />
                    Eğitmen Yazdı!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SEKTÖR: HAZIR ANTRENMAN REHBERLERİ & FİLTRELEME ÇUBUĞU */}
      <div className="space-y-6">
        {/* Filtreleme Butonları */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white tracking-wider uppercase">
              HAZIR ANTRENMAN REHBERLERİ
            </h3>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
              {PRESET_WORKOUTS.length} Program
            </span>
          </div>

          {/* Kategori Filtre Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setFilterCategory("all")}
              className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                filterCategory === "all"
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "bg-slate-900/60 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              HEPSİ
            </button>

            {availableCategories.map((catKey) => {
              const config = CATEGORY_CONFIG[catKey] || {
                title: catKey.toUpperCase(),
              };
              return (
                <button
                  key={catKey}
                  onClick={() => setFilterCategory(catKey)}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap uppercase ${
                    filterCategory === catKey
                      ? "bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      : "bg-slate-900/60 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {catKey}
                </button>
              );
            })}
          </div>
        </div>

        {/* TÜM KATEGORİLERİN DİNAMİK LİSTELENMESİ */}
        {categoriesToRender.map((catKey) => {
          const workouts = PRESET_WORKOUTS.filter(
            (w) => w.category === catKey
          );
          const config = CATEGORY_CONFIG[catKey] || {
            title: `${catKey.toUpperCase()} PROGRAMLARI`,
            icon: Dumbbell,
            borderColor: "border-slate-700 hover:border-amber-400/50",
            bgGradient: "from-slate-900/40 via-slate-900/20 to-slate-950/80",
            badgeBg: "bg-amber-500/20 border-amber-400/30 text-amber-300",
            textColor: "text-amber-400",
            dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]",
          };

          const IconComponent = config.icon;

          if (workouts.length === 0) return null;

          return (
            <div key={catKey} className="space-y-4">
              {/* Kategori Başlığı */}
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-black tracking-widest ${config.textColor} uppercase flex items-center gap-2`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
                  <IconComponent className="w-3.5 h-3.5 inline" />
                  {config.title}
                </h4>
              </div>

              {/* Kategori Kartları Izgarası */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workouts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPreset(item)}
                    className={`group relative bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} rounded-3xl p-4 cursor-pointer transition-all duration-300 flex items-center gap-4 hover:scale-[1.01] backdrop-blur-xl`}
                  >
                    {/* Görsel Kutusu */}
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover brightness-90 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Resim yüklenemezse varsayılan koyu arka plan gösterir
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>

                    {/* Bilgiler */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <h5 className="text-white font-black text-sm group-hover:text-amber-300 transition-colors truncate">
                        {item.title}
                      </h5>
                      <p className="text-slate-300/70 text-xs line-clamp-2 font-medium leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${config.badgeBg}`}
                        >
                          {item.level}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-black/40 text-slate-300 text-[10px] font-bold border border-white/10">
                          ⏱️ {item.duration} dk
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-[10px] font-bold border border-white/10">
                          🔥 {item.calories} kcal
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-black/40 text-blue-300 text-[10px] font-bold border border-white/10">
                          💪 {item.exercises?.length || 0} Hareket
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIKLANAN PRESET MODALI */}
      {selectedPreset && (
        <PresetWorkoutModal
          workout={selectedPreset}
          onClose={() => setSelectedPreset(null)}
        />
      )}
    </div>
  );
}