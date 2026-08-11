"use client";
// src/app/expert/marketplace/page.jsx
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store, Award, Trophy } from "lucide-react";
import ShowcasePanel from "./components/ShowcasePanel";
import BadgesPanel from "./components/BadgesPanel";
import LeaderboardPanel from "./components/LeaderboardPanel";

const TABS = [
  { id: "showcase", label: "Vitrin & İlan Panom", icon: Store },
  { id: "badges", label: "Rozetlerim & Puanım", icon: Award },
  { id: "leaderboard", label: "Liderlik Tablosu", icon: Trophy },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === tabParam) ? tabParam : "showcase"
  );

  useEffect(() => {
    if (TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 lg:p-6 space-y-6 font-sans text-sm">
      {/* Üst Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Uzman Vitrini</h1>
        <p className="text-xs text-slate-400 mt-1">
          Profilini sergile, ilanlarını yönet, rozet kazan ve platformdaki yerini gör.
        </p>
      </div>

      {/* Tab Navigasyonu */}
      <div className="flex border-b border-slate-800 gap-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-xs font-bold whitespace-nowrap transition-all relative ${
                isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={14} className={isActive ? "text-[#EA580C]" : ""} />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#EA580C] to-orange-400 rounded-t-full shadow-[0_-2px_8px_rgba(234,88,12,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab İçerikleri */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "showcase" && <ShowcasePanel onNavigate={setActiveTab} />}
        {activeTab === "badges" && <BadgesPanel onNavigate={setActiveTab} />}
        {activeTab === "leaderboard" && <LeaderboardPanel onNavigate={setActiveTab} />}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1120] p-8 text-white font-bold text-sm">Arayüz Yükleniyor...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}