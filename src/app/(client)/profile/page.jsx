"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import ProfileSidebar from "./components/ProfileSidebar";
import PersonalInfoTab from "./components/PersonalInfoTab";
import SubscriptionsTab from "./components/SubscriptionsTab";
import Navbar from "../dashboard/components/navbar";// Proje yapınıza göre @ alias kullanımı

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

  // FastAPI Canlı Profil Verisini Çekme
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

  // 1. YÜKLENİYOR DURUMU
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs font-bold tracking-widest text-slate-400 animate-pulse">
          CANLI PROFİL VERİLERİ YÜKLENİYOR...
        </p>
      </div>
    );
  }

  // 2. OTURUM YOK VEYA VERİ ÇEKİLEMEYEN DURUM
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
          ⚠️
        </div>
        <h3 className="text-lg font-bold">Profil Bilgileri Alınamadı</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Oturum süreniz dolmuş olabilir veya veritabanı bağlantısında geçici bir aksama yaşandı. Lütfen tekrar giriş yapın.
        </p>
      </div>
    );
  }

  // 3. CANLI VERİ BAŞARIYLA YÜKLENDİĞİNDEKİ SAYFA (Navbar Eklendi)
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Üst Kısım Sabit Navbar */}
      <Navbar userData={user} />

      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start flex-grow">
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

          {activeTab === "subscriptions" && (
            <SubscriptionsTab />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <p className="text-sm font-semibold tracking-wider animate-pulse">YÜKLENİYOR...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}