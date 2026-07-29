"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, MessageSquare, Headphones, ShieldCheck } from "lucide-react";

import AppointmentsTab from "./components/AppointmentsTab";
import MessagesTab from "./components/MessagesTab";
import SupportTab from "./components/SupportTab";

function ContactContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("appointments");

  // URL'den gelen ?tab= parametresini yakalama (örn: ?tab=messages veya ?tab=support)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (["appointments", "messages", "support"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 flex flex-col">
      
      {/* 🚀 ÜST BANNER & SWITCHER KONTROL MERKEZİ */}
      <div className="w-full px-6 pt-8 pb-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/90 border border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black tracking-widest rounded-full uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> EXPERT COMMAND & MANAGEMENT
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white pt-1">
              İletişim & Randevu Yönetimi
            </h1>
            <p className="text-xs text-slate-400 max-w-lg">
              Danışanlarınızla canlı görüşmelerinizi takip edin, danışan mesajlarını yanıtlayın ve platform yönetimi ile teknik destek taleplerinizi yönetin.
            </p>
          </div>

          {/* 🎛️ TAB SWITCHER BUTONLARI */}
          <div className="relative flex bg-slate-950 p-1.5 rounded-2xl w-full md:w-[480px] shadow-inner border border-slate-800 z-10">
            
            {/* Randevularım */}
            <button 
              onClick={() => setActiveTab("appointments")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                activeTab === "appointments" 
                  ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-102" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              RANDEVULARIM
            </button>

            {/* Mesajlar */}
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                activeTab === "messages" 
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] scale-102" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              MESAJLAR
            </button>

            {/* Canlı Destek / Ticket */}
            <button 
              onClick={() => setActiveTab("support")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                activeTab === "support" 
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,235,0.4)] scale-102" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Headphones className="w-4 h-4" />
              CANLI DESTEK
            </button>

          </div>

        </div>
      </div>

      {/* ================= ANA İÇERİK DİNAMİK ALANI ================= */}
      <div className="max-w-6xl mx-auto px-6 w-full flex-grow mt-2">
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "support" && <SupportTab />}
      </div>

    </div>
  );
}

export default function UnifiedContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <p className="text-sm font-semibold tracking-wider animate-pulse">İLETİŞİM MERKEZİ YÜKLENİYOR...</p>
      </div>
    }>
      <ContactContent />
    </Suspense>
  );
}