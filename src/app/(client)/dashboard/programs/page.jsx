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
  TrendingUp, 
  ArrowRight,
  Sparkles
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
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300",
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
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 flex flex-col">
      
      {/* 🛠️ SUB-HEADER SWITCHER CONTAINER (DİYET - HUB - ANTRENMAN) */}
      <div className="w-full px-6 py-6 transition-all duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          
          <div className="relative flex bg-slate-900 p-1.5 rounded-full w-full sm:w-[420px] shadow-2xl border border-slate-800 backdrop-blur-md">
            
            {/* Diyet Butonu */}
            <button 
              onClick={() => setActiveTab("diet")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
                activeTab === "diet" 
                  ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Apple className="w-4 h-4" />
              DİYET
            </button>

            {/* Hub Butonu */}
            <button 
              onClick={() => setActiveTab("hub")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
                activeTab === "hub" 
                  ? "bg-blue-500 text-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              HUB
            </button>

            {/* Antrenmanlar Butonu */}
            <button 
              onClick={() => setActiveTab("workout")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
                activeTab === "workout" 
                  ? "bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              ANTRENMAN
            </button>
          </div>
        </div>
      </div>

      {/* ================= ANA İÇERİK ALANI ================= */}
      <div className="max-w-5xl mx-auto px-6 pt-2 flex-grow w-full">
        
        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-900 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ================= 1. TAB: DİYET ================= */}
        {activeTab === "diet" && <DietTab />}

        {/* ================= 2. TAB: ELİT & LÜKS HUB (ÖZET MERKEZİ) ================= */}
        {activeTab === "hub" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Üst Karşılama ve Canlı İstatistik Kartları */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 gap-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black tracking-widest rounded-full uppercase">
                    VITALIS COMMAND CENTER
                  </span>
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white pt-2">
                  Hoş Geldin, {hubData.userName} <span className="text-blue-500">⚡</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Beslenme ve antrenman disiplinini tek ekrandan yönet, formunu zirveye taşı.
                </p>
              </div>
              
              {/* Seri & Görev Metrikleri */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl text-center shadow-inner">
                  <p className="text-[9px] text-slate-500 font-extrabold tracking-wider">SERİ</p>
                  <span className="text-xl font-black text-blue-400 flex items-center justify-center gap-1 mt-1">
                    {hubData.streak} <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl text-center shadow-inner">
                  <p className="text-[9px] text-slate-500 font-extrabold tracking-wider">GÖREV</p>
                  <span className="text-xl font-black text-white mt-1 block">
                    {hubData.completedTasks} / {hubData.totalTasks}
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl text-center shadow-inner">
                  <p className="text-[9px] text-slate-500 font-extrabold tracking-wider">LİDERLİK</p>
                  <span className="text-xl font-black text-yellow-400 mt-1 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" /> {hubData.leadershipRank}
                  </span>
                </div>
              </div>
            </div>

            {/* İki Sütunlu Elit Hub Bileşenleri (Diyet Dünyası & Antrenman Dünyası Birleşimi) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SOL KISIM: Günlük Görevler & Su Takibi (Diyet & Spor Sentezi) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> GÜNLÜK HİBRİT GÖREVLER
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
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
                            ? "bg-emerald-500/5 border-emerald-500/30 text-slate-300" 
                            : "bg-slate-950 border-slate-800 text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                          )}
                          <div>
                            <p className={`text-xs font-bold ${task.completed ? "line-through text-slate-400" : "text-white"}`}>
                              {task.title}
                            </p>
                            <span className="text-[10px] text-slate-500 font-semibold">{task.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hızlı Su Takibi Widget */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">SU HD</p>
                      <p className="text-xs font-black text-white">{hubData.waterCurrent}L / {hubData.waterTarget}L</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHubData(p => ({ ...p, waterCurrent: Math.min(p.waterTarget, +(p.waterCurrent + 0.25).toFixed(2)) }))}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-slate-950 font-black text-[10px] rounded-xl transition-all shadow-lg shadow-blue-500/20"
                  >
                    + 250 ML EKLE
                  </button>
                </div>
              </div>

              {/* SAĞ KISIM: Aktif Program & Kalori / Beslenme Dengesi */}
              <div className="space-y-6 flex flex-col justify-between">
                
                {/* Aktif Program Özet Kartı */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <img src={hubData.activeProgram.imageUrl} alt="Program" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent z-0" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 uppercase">
                        AKTİF PROGRAM
                      </span>
                      <span className="text-xs font-bold text-slate-400">{hubData.activeProgram.duration}</span>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white">{hubData.activeProgram.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{hubData.activeProgram.workouts}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="w-full bg-slate-950 rounded-full h-2 mr-4 overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full" style={{ width: `${hubData.activeProgram.progress}%` }} />
                      </div>
                      <button 
                        onClick={() => setActiveTab("workout")}
                        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs rounded-xl tracking-wider transition-all shadow-lg shadow-orange-500/20 shrink-0 flex items-center gap-1.5"
                      >
                        <span>DEVAM ET</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Günlük Kalori & Beslenme Özeti */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> MAKRO & KALORİ ÖZETİ
                    </span>
                    <button 
                      onClick={() => setActiveTab("diet")}
                      className="text-[10px] font-bold text-[#C5A880] hover:underline flex items-center gap-1"
                    >
                      Diyete Git <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[9px] font-extrabold text-slate-500">ALINAN KALORİ</p>
                      <p className="text-lg font-black text-emerald-400 mt-1">{hubData.dailyCalories} <span className="text-xs text-slate-400 font-normal">kcal</span></p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[9px] font-extrabold text-slate-500">HEDEF KALORİ</p>
                      <p className="text-lg font-black text-white mt-1">{hubData.targetCalories} <span className="text-xs text-slate-400 font-normal">kcal</span></p>
                    </div>
                  </div>
                </div>

              </div>

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
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <p className="text-sm font-semibold tracking-wider animate-pulse">YÜKLENİYOR...</p>
      </div>
    }>
      <HubContent />
    </Suspense>
  );
}