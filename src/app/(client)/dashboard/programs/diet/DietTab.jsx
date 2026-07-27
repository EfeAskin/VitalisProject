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
    <div className="space-y-10 animate-fadeIn font-sans text-slate-100">
      
      {/* 1. HERO BANNER & BİYOMETRİK BİLGİ ÖZETİ */}
      <DietHeroHeader 
        profile={profile} 
        onOpenDietitianNotice={() => setShowDietitianNotice(true)} 
      />

      {/* 2. DİYET PROGRAMI SEÇİMİ VE ÖĞÜN REÇETESİ */}
      <DietProgramSelector 
        selectedDietKey={selectedDietKey}
        setSelectedDietKey={setSelectedDietKey}
        currentDiet={currentDiet}
        completedMeals={completedMeals}
        toggleMeal={toggleMeal}
        onOpenDietitianNotice={() => setShowDietitianNotice(true)}
      />

      {/* 3. 1 PORSİYON KALORİ ÖĞREN ARAMA MOTORU */}
      <FoodCalorieSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredFoods={filteredFoods}
      />

      {/* 4. GÜNLÜK HATIRLATICILAR & SU TÜKETİM TAKİBİ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTracker 
          waterMl={waterMl}
          addWater={addWater}
          targetWaterMl={targetWaterMl}
        />
        <MealReminders />
      </div>

      {/* 5. DİKKAT EDİLMESİ GEREKEN HUSUSLAR & ÖLÇÜM TABLOSU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DietPrecautions />
        <MeasurementHistory 
          onOpenDietitianNotice={() => setShowDietitianNotice(true)}
        />
      </div>

      {/* DİYETİSYEN KİRALAMA & PAZARYERİ UYARI MODALI */}
      <DietitianNoticeModal 
        show={showDietitianNotice}
        onClose={() => setShowDietitianNotice(false)}
      />

    </div>
  );
}