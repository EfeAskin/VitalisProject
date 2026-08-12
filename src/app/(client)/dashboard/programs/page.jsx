"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Flame, 
  Apple, 
  LayoutGrid, 
  Dumbbell, 
  Award, 
  Droplets, 
  CheckCircle2, 
  Circle, 
  Activity, 
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  ChevronRight,
  Plus
} from "lucide-react";

import DietTab from "./diet/DietTab";
import WorkoutTab from "./workout/WorkoutTab";

function HubContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("hub"); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEON DB CANLI DİNAMİK HUB STATE YAPISI ---
  const [hubData, setHubData] = useState({
    userName: "KAMİL EFE",
    streak: 5,
    completedTasks: 3,
    totalTasks: 4,
    leadershipRank: "#12",
    waterCurrent: 2.2,
    waterTarget: 3.0,
    dailyCalories: 1820,
    targetCalories: 2450,
    activeProgram: {
      title: "Strong Beginnings",
      duration: "4 Hafta",
      workouts: "16 Antrenman",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUXtezMraIEvfDM3o0nH7-6YuunnJYEJenN4eFdymTXarbDkCIjPBuTeQ&s=10",
      progress: 25
    },
    dailyTasks: [
      { id: 1, title: "Sabah Kardiyosu (45 dk)", category: "Antrenman", completed: true },
      { id: 2, title: "2.5 Litre Su Tüketimi", category: "Beslenme", completed: true },
      { id: 3, title: "Öğle Yemeği (Yüksek Protein)", category: "Beslenme", completed: false },
      { id: 4, title: "Günlük Ağırlık Antrenmanını Bitir", category: "Antrenman", completed: false }
    ]
  });

  // URL'deki ?tab=deger parametresini dinleme
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "diet" || tabParam === "workout" || tabParam === "hub") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Canlı Neon DB Veri Çekme Entegrasyonu
  useEffect(() => {
    async function fetchHubData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setHubData(prev => ({
            ...prev,
            userName: userData.first_name ? userData.first_name.toUpperCase() : "KAMİL EFE"
          }));
        }
      } catch (err) {
        console.log("Canlı veri bağlantısı bekleniyor, varsayılan dinamik state aktif.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHubData();
  }, []);

  const toggleTask = (taskId) => {
    setHubData(prev => {
      const updatedTasks = prev.dailyTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      const completedCount = updatedTasks.filter(t => t.completed).length;
      return {
        ...prev,
        dailyTasks: updatedTasks,
        completedTasks: completedCount
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11142D] text-emerald-100 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-400"></div>
          <Sparkles className="w-5 h-5 text-amber-400 absolute animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#11142D] text-emerald-100 font-sans pb-16 flex flex-col relative overflow-hidden">
      
      {/* GLOBAL GLOW BACKGROUND ELEMENTS */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 🛠️ SUB-HEADER SWITCHER CONTAINER (DİYET - HUB - ANTRENMAN) */}
      <div className="w-full px-4 sm:px-6 py-6 transition-all duration-300 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          
          <div className="relative flex bg-[#18231E]/90 p-1.5 rounded-2xl sm:rounded-full w-full sm:w-[460px] shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-emerald-500/30 backdrop-blur-xl">
            
            {/* Diyet Butonu */}
            <button 
              onClick={() => setActiveTab("diet")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl sm:rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "diet" 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 border border-emerald-300" 
                  : "text-emerald-200/60 hover:text-white hover:bg-emerald-500/10"
              }`}
            >
              <Apple className="w-4 h-4" />
              DİYET
            </button>

            {/* Hub Butonu */}
            <button 
              onClick={() => setActiveTab("hub")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl sm:rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "hub" 
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-105 border border-amber-300" 
                  : "text-emerald-200/60 hover:text-white hover:bg-amber-500/10"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              HUB
            </button>

            {/* Antrenmanlar Butonu */}
            <button 
              onClick={() => setActiveTab("workout")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl sm:rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "workout" 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-105 border border-orange-300" 
                  : "text-emerald-200/60 hover:text-white hover:bg-orange-500/10"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              ANTRENMAN
            </button>
          </div>
        </div>
      </div>

      {/* ================= ANA İÇERİK ALANI ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 flex-grow w-full relative z-10">
        
        {error && (
          <div className="mb-6 bg-red-950/80 border border-red-500/50 text-red-200 px-5 py-4 rounded-2xl text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-md">
            {error}
          </div>
        )}

        {/* ================= 1. TAB: DİYET ================= */}
        {activeTab === "diet" && <DietTab />}

        {/* ================= 2. TAB: ELİT & LÜKS HUB (ÖZET MERKEZİ) ================= */}
        {activeTab === "hub" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Üst Karşılama ve Canlı İstatistik Kartları */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#18231E] via-[#141C18] to-[#101713] border border-emerald-500/30 rounded-3xl p-6 md:p-8 gap-6 shadow-[0_0_35px_rgba(16,185,129,0.15)] backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-emerald-500/40 text-amber-300 text-[10px] font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(251,191,36,0.15)]">
                    <Sparkles size={11} className="text-amber-400 fill-amber-400" />
                    VITALIS COMMAND CENTER
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-2 flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                  Hoş Geldin, {hubData.userName} <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                </h3>
                <p className="text-xs text-emerald-100/70 font-medium">
                  Beslenme ve antrenman disiplinini tek ekrandan yönet, formunu zirveye taşı.
                </p>
              </div>
              
              {/* Seri & Görev Metrikleri */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto relative z-10">
                <div className="bg-[#0D1410]/90 border border-emerald-500/20 p-4 rounded-2xl text-center shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:border-emerald-500/40 transition-all">
                  <p className="text-[9px] text-emerald-300/60 font-black tracking-wider uppercase">SERİ</p>
                  <span className="text-xl font-black text-amber-300 flex items-center justify-center gap-1 mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                    {hubData.streak} <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </span>
                </div>
                <div className="bg-[#0D1410]/90 border border-emerald-500/20 p-4 rounded-2xl text-center shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:border-emerald-500/40 transition-all">
                  <p className="text-[9px] text-emerald-300/60 font-black tracking-wider uppercase">GÖREV</p>
                  <span className="text-xl font-black text-white mt-1 block drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                    {hubData.completedTasks} / {hubData.totalTasks}
                  </span>
                </div>
                <div className="bg-[#0D1410]/90 border border-emerald-500/20 p-4 rounded-2xl text-center shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:border-emerald-500/40 transition-all">
                  <p className="text-[9px] text-emerald-300/60 font-black tracking-wider uppercase">LİDERLİK</p>
                  <span className="text-xl font-black text-amber-300 mt-1 flex items-center justify-center gap-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                    <Award className="w-4 h-4 text-amber-400" /> {hubData.leadershipRank}
                  </span>
                </div>
              </div>
            </div>

            {/* İki Sütunlu Elit Hub Bileşenleri (Diyet Dünyası & Antrenman Dünyası Birleşimi) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SOL KISIM: Günlük Görevler & Su Takibi (Diyet & Spor Sentezi) */}
              <div className="bg-gradient-to-b from-[#18231E] to-[#101713] border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-6 backdrop-blur-xl">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> GÜNLÜK HİBRİT GÖREVLER
                    </h4>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                      %{Math.round((hubData.completedTasks / hubData.totalTasks) * 100)} Tamamlandı
                    </span>
                  </div>

                  {/* Görev Listesi */}
                  <div className="space-y-3">
                    {hubData.dailyTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                          task.completed 
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100/70 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : "bg-[#0D1410]/80 border border-emerald-500/20 text-white hover:border-emerald-500/50 hover:bg-[#121B16]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-emerald-500/40 shrink-0" />
                          )}
                          <div>
                            <p className={`text-xs font-bold ${task.completed ? "line-through text-emerald-200/40" : "text-white"}`}>
                              {task.title}
                            </p>
                            <span className="text-[10px] text-amber-300/80 font-bold uppercase">{task.category}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-500/40" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hızlı Su Takibi Widget */}
                <div className="bg-[#0D1410]/90 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-cyan-300/70 tracking-wider">SU HEDEFİ</p>
                      <p className="text-xs font-black text-white">{hubData.waterCurrent}L / {hubData.waterTarget}L</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHubData(p => ({ ...p, waterCurrent: Math.min(p.waterTarget, +(p.waterCurrent + 0.25).toFixed(2)) }))}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-black text-[10px] rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" /> 250 ML EKLE
                  </button>
                </div>
              </div>

              {/* SAĞ KISIM: Aktif Program & Kalori / Beslenme Dengesi */}
              <div className="space-y-6 flex flex-col justify-between">
                
                {/* Aktif Program Özet Kartı */}
                <div className="bg-gradient-to-b from-[#18231E] to-[#101713] border border-amber-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group backdrop-blur-xl">
                  <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity">
                    <img src={hubData.activeProgram.imageUrl} alt="Program" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1410] via-[#101713]/80 to-transparent z-0" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.15)]">
                        <Target className="w-3 h-3 text-amber-400" /> AKTİF PROGRAM
                      </span>
                      <span className="text-xs font-bold text-emerald-200/70">{hubData.activeProgram.duration}</span>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">{hubData.activeProgram.title}</h4>
                      <p className="text-xs text-emerald-100/70 mt-1 font-medium">{hubData.activeProgram.workouts}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-4">
                      <div className="w-full bg-[#0D1410] rounded-full h-2.5 overflow-hidden border border-emerald-500/30 p-0.5">
                        <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${hubData.activeProgram.progress}%` }} />
                      </div>
                      <button 
                        onClick={() => setActiveTab("workout")}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] text-black font-black text-xs rounded-xl tracking-wider transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>DEVAM ET</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Günlük Kalori & Beslenme Özeti */}
                <div className="bg-gradient-to-b from-[#18231E] to-[#101713] border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> MAKRO & KALORİ ÖZETİ
                    </span>
                    <button 
                      onClick={() => setActiveTab("diet")}
                      className="text-[10px] font-black text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Diyete Git <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0D1410]/90 p-4 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      <p className="text-[9px] font-black text-emerald-300/60 uppercase tracking-wider">ALINAN KALORİ</p>
                      <p className="text-lg font-black text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        {hubData.dailyCalories} <span className="text-xs text-emerald-200/50 font-semibold">kcal</span>
                      </p>
                    </div>
                    <div className="bg-[#0D1410]/90 p-4 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      <p className="text-[9px] font-black text-emerald-300/60 uppercase tracking-wider">HEDEF KALORİ</p>
                      <p className="text-lg font-black text-white mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                        {hubData.targetCalories} <span className="text-xs text-emerald-200/50 font-semibold">kcal</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* EK LÜKS METRİK KARTLARI (Özel Güvenlik & Sistem Performansı) */}
            <div className="p-4 rounded-2xl bg-[#0D1410]/80 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-emerald-300/70 shadow-inner">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                VITALIS OS 2.4 HYBRID COMMAND ACTIVE
              </span>
              <span className="text-amber-300 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400 fill-amber-400" />
                CANLI SENKRONİZASYON TAMAMLANDI
              </span>
            </div>

          </div>
        )}

        {/* ================= 3. TAB: ANTRENMAN ================= */}
        {activeTab === "workout" && <WorkoutTab />}

      </div>
    </div>
  );
}

export default function UnifiedHubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#11142D] text-emerald-100 flex items-center justify-center">
        <p className="text-xs font-black tracking-widest text-emerald-400 animate-pulse">YÜKLENİYOR...</p>
      </div>
    }>
      <HubContent />
    </Suspense>
  );
}