"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, MessageSquare, Headphones, Sparkles, ShieldCheck } from "lucide-react";

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
    <div className="w-full min-h-screen bg-[#11142D] text-slate-100 font-sans pb-12 sm:pb-20 flex flex-col">
      
      {/* 🚀 ÜST BANNER & SWITCHER KONTROL MERKEZİ */}
      <div className="w-full px-3 sm:px-6 pt-4 sm:pt-8 pb-4 sm:pb-6 transition-all duration-300">
        {/* 
          Ana Dış Kapsayıcı Kart (Outer Box):
          - Lacivert #11142D sayfa zemininden kolayca ayırt edilen Derin Obsidyen-Zümrüt (`bg-[#0B1310]/95`).
          - Gözü yormayan koyu premium cam stili.
          - Neon Zümrüt & Amber kenarlıklar, projeksiyonda ve mobilde kusursuz okunabilirlik sağlayan tipografi.
        */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0B1310]/95 border-2 border-emerald-500/40 hover:border-emerald-400/70 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-2xl relative overflow-hidden transition-all duration-300">
          
          {/* Neon Işıltılı Arka Plan Atmosfer Efekti */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left z-10 w-full md:w-auto">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> VITALIS VIP COMMAND & SUPPORT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white pt-1 drop-shadow-md">
              İletişim & Randevu Merkezi
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-100/70 max-w-lg leading-relaxed">
              Sertifikalı diyetisyenlerinizle canlı görüşmeler planlayın, AI asistanınızla veya uzmanlarla mesajlaşın ve teknik destek taleplerinizi yönetin.
            </p>
          </div>

          {/* 🎛️ TAB SWITCHER BUTONLARI (MOBİL UYUMLU) */}
          <div className="relative flex bg-[#060B09] p-1.5 sm:p-2 rounded-2xl w-full md:w-auto shadow-inner border-2 border-emerald-950 z-10 gap-1.5 overflow-x-auto no-scrollbar">
            
            {/* Randevularım */}
            <button 
              onClick={() => setActiveTab("appointments")}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 cursor-pointer touch-manipulation whitespace-nowrap ${
                activeTab === "appointments" 
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300" 
                  : "text-emerald-300/60 hover:text-white hover:bg-[#0E1A16]"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>RANDEVULARIM</span>
            </button>

            {/* Mesajlar */}
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex-1 min-w-[100px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 cursor-pointer touch-manipulation whitespace-nowrap ${
                activeTab === "messages" 
                  ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-300" 
                  : "text-emerald-300/60 hover:text-white hover:bg-[#0E1A16]"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>MESAJLAR</span>
            </button>

            {/* Canlı Destek / Ticket */}
            <button 
              onClick={() => setActiveTab("support")}
              className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 cursor-pointer touch-manipulation whitespace-nowrap ${
                activeTab === "support" 
                  ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-300" 
                  : "text-emerald-300/60 hover:text-white hover:bg-[#0E1A16]"
              }`}
            >
              <Headphones className="w-4 h-4 shrink-0" />
              <span>CANLI DESTEK</span>
            </button>

          </div>

        </div>
      </div>

      {/* ================= ANA İÇERİK DİNAMİK ALANI ================= */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 w-full flex-grow mt-2">
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
      <div className="min-h-screen bg-[#11142D] text-emerald-400 flex items-center justify-center p-4">
        <div className="bg-[#0B1310]/95 p-6 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <p className="text-xs font-black tracking-widest text-white uppercase animate-pulse">
            İLETİŞİM MERKEZİ YÜKLENİYOR...
          </p>
        </div>
      </div>
    }>
      <ContactContent />
    </Suspense>
  );
}