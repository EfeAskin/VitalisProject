"use client";

import React, { useState } from "react";
import { FOOD_DATABASE, DIET_PROGRAMS } from "./data/dietData";

// Alt Bileşenlerin İçe Aktarılması
import DietHeroHeader from "./components/DietHeroHeader";
import DietProgramSelector from "./components/DietProgramSelector";
import FoodCalorieSearch from "./components/FoodCalorieSearch";
import WaterTracker from "./components/WaterTracker";
import MealReminders from "./components/MealReminders";
import DietPrecautions from "./components/DietPrecautions";
import MeasurementHistory from "./components/MeasurementHistory";
import DietitianNoticeModal from "./components/DietitianNoticeModal";

export default function DietTab() {
  // Kullanıcı Biyometrik Bilgileri State'i (FastAPI / Neon DB Entegrasyonuna Hazır)
  const [profile, setProfile] = useState({
    height: 182,
    weight: 78.5,
    gender: "Erkek",
    goal: "Kas Kütlesi & Minimal Yağ"
  });

  // Seçili Diyet Programı
  const [selectedDietKey, setSelectedDietKey] = useState("balanced");
  const currentDiet = DIET_PROGRAMS[selectedDietKey];

  // Kalori Öğren Arama State'i
  const [searchQuery, setSearchQuery] = useState("");

  // Su Tüketimi Hatırlatıcı State'i
  const [waterMl, setWaterMl] = useState(2250);
  const targetWaterMl = 3500;

  // Öğün Tamamlama State'i
  const [completedMeals, setCompletedMeals] = useState([0]);

  // Diyetisyen Randevu Modal Uyarısı
  const [showDietitianNotice, setShowDietitianNotice] = useState(false);

  // Kalori Arama Filtreleme Fonksiyonu
  const filteredFoods = FOOD_DATABASE.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMeal = (index) => {
    if (completedMeals.includes(index)) {
      setCompletedMeals(completedMeals.filter(i => i !== index));
    } else {
      setCompletedMeals([...completedMeals, index]);
    }
  };

  const addWater = () => {
    if (waterMl < targetWaterMl) {
      setWaterMl(prev => Math.min(prev + 250, targetWaterMl));
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn font-sans text-slate-100 p-1 md:p-2 bg-transparent relative">
      
      {/* Üst Dekoratif Cyber-Lüks Işık Efekti */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. HERO BANNER & BİYOMETRİK BİLGİ ÖZETİ */}
      <div className="relative z-10 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-2xl shadow-[0_0_35px_rgba(16,185,129,0.15)] transition-all duration-500 hover:border-emerald-400/50">
        <DietHeroHeader 
          profile={profile} 
          onOpenDietitianNotice={() => setShowDietitianNotice(true)} 
        />
      </div>

      {/* 2. DİYET PROGRAMI SEÇİMİ VE ÖĞÜN REÇETESİ */}
      <div className="relative z-10 rounded-3xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-2xl shadow-[0_0_35px_rgba(245,158,11,0.15)] transition-all duration-500 hover:border-amber-400/50">
        <DietProgramSelector 
          selectedDietKey={selectedDietKey}
          setSelectedDietKey={setSelectedDietKey}
          currentDiet={currentDiet}
          completedMeals={completedMeals}
          toggleMeal={toggleMeal}
          onOpenDietitianNotice={() => setShowDietitianNotice(true)}
        />
      </div>

      {/* 3. 1 PORSİYON KALORİ ÖĞREN ARAMA MOTORU */}
      <div className="relative z-10 rounded-3xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-2xl shadow-[0_0_35px_rgba(168,85,247,0.15)] transition-all duration-500 hover:border-purple-400/50">
        <FoodCalorieSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredFoods={filteredFoods}
        />
      </div>

      {/* 4. GÜNLÜK HATIRLATICILAR & SU TÜKETİM TAKİBİ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-950/25 backdrop-blur-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-500 hover:border-cyan-400/50">
          <WaterTracker 
            waterMl={waterMl}
            addWater={addWater}
            targetWaterMl={targetWaterMl}
          />
        </div>
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all duration-500 hover:border-rose-400/50">
          <MealReminders />
        </div>
      </div>

      {/* 5. DİKKAT EDİLMESİ GEREKEN HUSUSLAR & ÖLÇÜM TABLOSU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-500 hover:border-amber-400/50">
          <DietPrecautions />
        </div>
        <div className="lg:col-span-2 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500 hover:border-emerald-400/50">
          <MeasurementHistory 
            onOpenDietitianNotice={() => setShowDietitianNotice(true)}
          />
        </div>
      </div>

      {/* DİYETİSYEN KİRALAMA & PAZARYERİ UYARI MODALI */}
      <DietitianNoticeModal 
        show={showDietitianNotice}
        onClose={() => setShowDietitianNotice(false)}
      />

    </div>
  );
}