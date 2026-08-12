"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

import ProfileSidebar from "./components/ProfileSidebar";
import PersonalInfoTab from "./components/PersonalInfoTab";
import SubscriptionsTab from "./components/SubscriptionsTab";
import Navbar from "../dashboard/components/navbar";

function ProfileContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (["personal", "subscriptions"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        
        if (!token) {
          console.warn("Oturum token'ı bulunamadı.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/client/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("Profil verisi çekilemedi, durum:", res.status);
        }
      } catch (err) {
        console.error("FastAPI profil çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  const handleUpdateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#11142D] text-amber-100 flex flex-col items-center justify-center gap-4">
        <div className="relative w-20 h-20 flex items-center justify-center">
           <div className="absolute inset-0 border-4 border-[#D4AF37]/30 rounded-full animate-ping"></div>
           <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
        </div>
        <p className="text-[10px] font-black tracking-[0.3em] text-[#D4AF37] animate-pulse uppercase">
          KİMLİK DOĞRULANIYOR...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#11142D] flex flex-col items-center justify-center gap-6 p-6">
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white">Profil Verilerine Erişilemedi</h3>
          <p className="text-xs text-rose-200/60 max-w-sm leading-relaxed">
            Oturum süreniz dolmuş olabilir veya veritabanı bağlantısında geçici bir aksama yaşandı. Lütfen tekrar giriş yapın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#11142D] text-white font-sans selection:bg-[#D4AF37]/30">
      <Navbar userData={user} />

      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[320px] shrink-0 sticky top-8">
            <ProfileSidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onUpdateUser={handleUpdateUser}
            />
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="bg-[#1A1816] border border-[#D4AF37]/40 p-6 rounded-[2rem] backdrop-blur-xl flex items-center gap-4 shadow-[0_10px_30px_rgba(212,175,55,0.15)]">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                  <h1 className="text-xl font-black text-white tracking-wide uppercase">Profil & Ayarlar</h1>
                  <p className="text-[10px] text-[#D4AF37]/80 font-bold uppercase tracking-widest mt-0.5">VITALIS GÜVENLİ DİJİTAL KİMLİK</p>
              </div>
          </div>

          <div className="min-h-[500px]">
              {activeTab === "personal" && (
                <PersonalInfoTab user={user} onUpdateUser={handleUpdateUser} />
              )}

              {activeTab === "subscriptions" && (
                <SubscriptionsTab />
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ClientProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#11142D] text-[#D4AF37] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}