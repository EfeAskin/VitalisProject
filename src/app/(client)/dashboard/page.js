"use client";

import React, { useState, useEffect } from 'react';

// Bileşenlerin İçe Aktarılması
import WelcomeCard from './components/WelcomeCard';
import DailyTasks from './components/DailyTasks';
import WaterTracker from './components/WaterTracker';
import CoachCard from './components/CoachCard';
import NutritionTracker from './components/NutritionTracker';
import ClientDietProgram from './components/clientdietprogram';
import WeeklyWorkout from './components/WeeklyWorkout';
import WeightChart from './components/WeightChart';
import UpcomingSession from './components/UpcomingSession';
import RecommendedPros from './components/RecommendedPros';
import AIVitalisChat from './components/AIVitalisChat';
import BodyAnalysisModal from './components/BodyAnalysisModal';

// Yeni Eklenen Estetik Bileşenler
import CaloriesBurnedCard from './components/CaloriesBurnedCard';
import DailyStepsCard from './components/DailyStepsCard';

export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Adım girildiğinde Kalori kartının otomatik yenilenmesini sağlayan tetikleyici
  const [calorieRefreshKey, setCalorieRefreshKey] = useState(0);

  const [userData, setUserData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    role: "client"
  });

  useEffect(() => {
    const cachedFirst = localStorage.getItem("first_name") || localStorage.getItem("firstName");
    const cachedLast = localStorage.getItem("last_name") || localStorage.getItem("lastName") || "";
    const token = localStorage.getItem("access_token");
    
    if (cachedFirst) {
      setUserData(prev => ({
        ...prev,
        firstName: cachedFirst,
        lastName: cachedLast,
        role: localStorage.getItem("role") || "client"
      }));
    }

    async function fetchUserData() {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: headers,
        });

        if (res.ok) {
          const data = await res.json();
          const userObj = data.user || data;

          const firstName = userObj.first_name || userObj.firstName || "";
          const lastName = userObj.last_name || userObj.lastName || "";
          const userId = userObj.id || userObj.user_id || null;

          if (firstName || userId) {
            setUserData({
              id: userId,
              firstName: firstName,
              lastName: lastName,
              role: userObj.role || "client"
            });

            if (firstName) localStorage.setItem("first_name", firstName);
            if (lastName) localStorage.setItem("last_name", lastName);
            if (userId) localStorage.setItem("user_id", userId);
          }
        }
      } catch (err) {
        console.error("Dashboard kullanıcı verisi çekilemedi:", err);
      }
    }

    fetchUserData();
  }, []);

  const [waterLevel, setWaterLevel] = useState(2.0);
  
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Sabah Kardiyosu (45 dk)', priority: 'Yüksek', checked: false },
    { id: 2, text: '2.5 Litre Su Tüketimi', priority: 'Orta', checked: true },
    { id: 3, text: 'Öğle Yemeği (Yüksek Proteinli Tavuk & Pilav)', priority: 'Orta', checked: false },
    { id: 4, text: 'Günün Ağırlık Antrenmanını Bitir', priority: 'Yüksek', checked: false }
  ]);

  const [workoutProgress, setWorkoutProgress] = useState([
    { day: 'Pzt', completed: true, isToday: false },
    { day: 'Sal', completed: false, isToday: true },
    { day: 'Çar', completed: false, isToday: false },
    { day: 'Per', completed: false, isToday: false },
    { day: 'Cum', completed: false, isToday: false },
    { day: 'Cmt', completed: false, isToday: false },
    { day: 'Paz', completed: false, isToday: false },
  ]);

  const [macroData, setMacroData] = useState([
    { name: 'Protein', value: 140, color: '#10B981' }, 
    { name: 'Karbonhidrat', value: 180, color: '#2563eb' },
    { name: 'Yağ', value: 60, color: '#d97706' },
  ]);

  const [weightHistory, setWeightHistory] = useState([
    { name: 'Nisan', kilo: 82, yag: 18 },
    { name: 'Mayıs', kilo: 79.5, yag: 16.5 },
    { name: 'Haziran', kilo: 77, yag: 15 },
    { name: 'Temmuz', kilo: 75.2, yag: 14.2 },
  ]);

  const [measurementModal, setMeasurementModal] = useState(false);

  const updateMeasurementGraph = async (analysisData) => {
    if (!analysisData) return;

    const newFatRate = Number(analysisData.bodyFat || analysisData.body_fat || 0);
    const currentWeight = Number(analysisData.kilo || analysisData.weight || 0);

    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentMonthName = months[new Date().getMonth()];

    setWeightHistory(prev => {
      const existingIdx = prev.findIndex(item => item.name === currentMonthName);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = { name: currentMonthName, kilo: currentWeight, yag: newFatRate };
        return updated;
      }
      return [...prev, { name: currentMonthName, kilo: currentWeight, yag: newFatRate }];
    });

    setRefreshKey(prev => prev + 1);
  };

  const handleStepLogged = () => {
    setCalorieRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11142D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11142D] text-slate-100 antialiased font-sans transition-colors duration-300">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {error && (
          <div className="mb-6 bg-rose-950/50 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl text-sm backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)] font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sol Kolon */}
          <div className="lg:col-span-3 space-y-6">
            <WelcomeCard name={userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : ""} />
            <DailyTasks tasks={tasks} setTasks={setTasks} />
            <WaterTracker waterLevel={waterLevel} setWaterLevel={setWaterLevel} />
            <CoachCard />
          </div>

          {/* Orta Kolon */}
          <div className="lg:col-span-6 space-y-6">
            <NutritionTracker 
              macroData={macroData} 
              setMacroData={setMacroData} 
              onAddKcal={() => {}} 
            />

            <ClientDietProgram clientId={userData.id} />

            <WeeklyWorkout workoutProgress={workoutProgress} setWorkoutProgress={setWorkoutProgress} />
            
            {/* userId parametresi eklendi */}
            <WeightChart 
              userId={userData.id}
              weightHistory={weightHistory} 
              onOpenModal={() => setMeasurementModal(true)} 
              refreshKey={refreshKey}
            />
          </div>

          {/* Sağ Kolon */}
          <div className="lg:col-span-3 space-y-6">
            <UpcomingSession />

            <CaloriesBurnedCard refreshTrigger={calorieRefreshKey} />
            <DailyStepsCard onStepLogged={handleStepLogged} />

            <RecommendedPros />
            <AIVitalisChat />
          </div>

        </div>
      </main>

      {/* userId parametresi eklendi */}
      <BodyAnalysisModal 
        userId={userData.id}
        isOpen={measurementModal} 
        onClose={() => setMeasurementModal(false)} 
        onSave={updateMeasurementGraph} 
      />

    </div>
  );
}