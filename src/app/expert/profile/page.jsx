"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, RefreshCw, LogIn } from "lucide-react";

import ProfileSidebar from "./components/ProfileSidebar";
import PersonalInfoTab from "./components/PersonalInfoTab";
import SubscriptionsTab from "./components/SubscriptionsTab";

function ProfileContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // URL'deki ?tab=deger parametresini dinleme
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (["personal", "subscriptions"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // FastAPI Canlı Uzman Profil Verisini Çekme
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        console.warn("Oturum token'ı bulunamadı.");
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/expert/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.error("Uzman profil verisi çekilemedi, durum:", res.status);
        setUser(null);
      }
    } catch (err) {
      console.error("FastAPI uzman profil çekme hatası:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  // 1. YÜKLENİYOR DURUMU
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {/* Arka plan parlama efekti */}
        <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
        <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

        <div className="relative z-10 flex flex-col items-center gap-3 bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-xs font-heading font-black tracking-widest text-slate-300 uppercase animate-pulse mt-2">
            Uzman Profil Verileri Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  // 2. OTURUM YOK VEYA VERİ ÇEKİLEMEYEN DURUM
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-8 max-w-md w-full space-y-6 text-center backdrop-blur-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-heading font-black text-white">
              Profil Bilgileri Alınamadı
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Oturum süreniz dolmuş olabilir veya veritabanı bağlantısında
              geçici bir aksama yaşandı. Lütfen tekrar giriş yapın veya sayfayı
              yenileyin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={fetchUserProfile}
              className="flex-1 px-4 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-heading font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Tekrar Dene</span>
            </button>

            <a
              href="/login"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-orange-600/20"
            >
              <LogIn size={14} />
              <span>Giriş Yap</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. CANLI VERİ BAŞARIYLA YÜKLENDİĞİNDEKİ SAYFA
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Arka plan yumuşak ışıklar */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start flex-grow relative z-10">
        {/* SOL SABİT MENÜ */}
        <ProfileSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onUpdateUser={handleUpdateUser}
        />

        {/* SAĞ DİNAMİK İÇERİK ALANI */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === "personal" && (
            <PersonalInfoTab user={user} onUpdateUser={handleUpdateUser} />
          )}

          {activeTab === "subscriptions" && <SubscriptionsTab />}
        </div>
      </div>
    </div>
  );
}

export default function ExpertProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-heading font-black tracking-widest text-slate-400 animate-pulse">
            YÜKLENİYOR...
          </p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}