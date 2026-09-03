"use client";

import React, { useState, useEffect } from "react";
import WelcomeCard from "./components/WelcomeCard";
import StatsGrid from "./components/StatsGrid";
import AppointmentsSidebar from "./components/AppointmentsSidebar";
import ClientPortfolio from "./components/ClientPortfolio";
import QuickActions from "./components/QuickActions";
import ExpertMotivationCard from "./components/ExpertMotivationCard";
import ExpertShowcaseWidget from "./components/ExpertShowcaseWidget";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExpertDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("jwt");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        // 1. Kullanıcı Bilgilerini Çek
        const userRes = await fetch("/api/auth/me", { headers, credentials: "include" });
        let currentUser = null;
        if (userRes.ok) {
          const uData = await userRes.json();
          currentUser = uData.user || uData;
          setUserData(currentUser);
        }

        const specialistId = 
          currentUser?.id || 
          currentUser?.user_id || 
          currentUser?.specialist_id || 
          localStorage.getItem("user_id") || 
          localStorage.getItem("specialist_id") || 
          "7";

        // 2. Dashboard Verilerini Çek
        const dashRes = await fetch(`/api/expert-clients/dashboard/${specialistId}`, { headers, credentials: "include" });
        if (dashRes.ok) {
          const dData = await dashRes.json();
          setDashboardData(dData);
        }
      } catch (error) {
        console.error("Dashboard verileri çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Danışan detay sayfasına yönlendirme fonksiyonu (Doğru rotaya bağlandı)
  const handleSelectClient = (clientId) => {
    router.push(`/expert/clientfile/${clientId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-slate-300 text-sm font-bold animate-pulse">Vitalis Komuta Merkezi Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || { 
    activeClients: dashboardData?.active_clients?.length || 0, 
    newClients: 0, 
    rating: 0, 
    monthlyEarnings: 0, 
    earningsChange: 0 
  };
  
  const appointments = dashboardData?.appointments || [];
  const clients = dashboardData?.active_clients || dashboardData?.clients || [];
  const role = userData?.role || "trainer";

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-orange-500/30">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* SOL & ORTA BÖLÜM (12 Kolonun ilk 9'u) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Üst Satır: Karşılama Kartı ve Motivasyon Kartı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WelcomeCard user={userData} />
              <ExpertMotivationCard />
            </div>

            {/* İstatistik Şeridi */}
            <StatsGrid stats={stats} role={role} />

            {/* Alt Satır: Hızlı Araçlar ve Danışan Portföyü */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4 flex flex-col">
                <QuickActions role={role} />
              </div>
              <div className="lg:col-span-8 flex flex-col">
                <ClientPortfolio clients={clients} role={role} onSelectClient={handleSelectClient} />
              </div>
            </div>

          </div>

          {/* SAĞ BÖLÜM (12 Kolonun son 3'ü - Randevular ve Uzman Vitrini Widget'ı) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <AppointmentsSidebar appointments={appointments} role={role} />
            <ExpertShowcaseWidget />
          </div>

        </div>

      </div>
    </div>
  );
}