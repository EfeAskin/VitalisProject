"use client";
import React, { useState, useEffect } from 'react';

// Bileşenlerin İçe Aktarılması
import WelcomeCard from './components/WelcomeCard';
import DailyTasks from './components/DailyTasks';
import WaterTracker from './components/WaterTracker';
import CoachCard from './components/CoachCard';
import NutritionTracker from './components/NutritionTracker';
import WeeklyWorkout from './components/WeeklyWorkout';
import WeightChart from './components/WeightChart';
import UpcomingSession from './components/UpcomingSession';
import RecommendedPros from './components/RecommendedPros';
import AIVitalisChat from './components/AIVitalisChat';
import BodyAnalysisModal from './components/BodyAnalysisModal';

export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    role: "client"
  });

  useEffect(() => {
    const cachedFirst = localStorage.getItem("first_name") || localStorage.getItem("firstName");
    const cachedLast = localStorage.getItem("last_name") || localStorage.getItem("lastName") || "";
    const token = localStorage.getItem("access_token");
    
    if (cachedFirst) {
      setUserData({
        firstName: cachedFirst,
        lastName: cachedLast,
        role: localStorage.getItem("role") || "client"
      });
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

          if (firstName) {
            setUserData({
              firstName: firstName,
              lastName: lastName,
              role: userObj.role || "client"
            });

            localStorage.setItem("first_name", firstName);
            localStorage.setItem("last_name", lastName);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C5A880]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] bg-slate-950 antialiased font-sans transition-colors duration-300">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-3 space-y-6">
            <WelcomeCard name={userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : ""} />
            <DailyTasks tasks={tasks} setTasks={setTasks} />
            <WaterTracker waterLevel={waterLevel} setWaterLevel={setWaterLevel} />
            <CoachCard />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <NutritionTracker 
              macroData={macroData} 
              setMacroData={setMacroData} 
              onAddKcal={() => {}} 
            />
            <WeeklyWorkout workoutProgress={workoutProgress} setWorkoutProgress={setWorkoutProgress} />
            <WeightChart 
              weightHistory={weightHistory} 
              onOpenModal={() => setMeasurementModal(true)} 
              refreshKey={refreshKey}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <UpcomingSession />
            <RecommendedPros />
            <AIVitalisChat />
          </div>

        </div>
      </main>

      <BodyAnalysisModal 
        isOpen={measurementModal} 
        onClose={() => setMeasurementModal(false)} 
        onSave={updateMeasurementGraph} 
      />

    </div>
  );
}