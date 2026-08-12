"use client";

// src/app/expert/marketplace/page.jsx

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store, Award, Trophy } from "lucide-react";

import ShowcasePanel from "./components/ShowcasePanel";
import BadgesPanel from "./components/BadgesPanel";
import LeaderboardPanel from "./components/LeaderboardPanel";

const TABS = [
  {
    id: "showcase",
    label: "Vitrin & İlan Panom",
    icon: Store,
  },
  {
    id: "badges",
    label: "Rozetlerim & Puanım",
    icon: Award,
  },
  {
    id: "leaderboard",
    label: "Liderlik Tablosu",
    icon: Trophy,
  },
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
    <div className="min-h-screen text-slate-200 p-2 lg:p-4 space-y-6 font-sans text-sm">
      
      {/* ==========================================================
          ÜST HEADER
      ========================================================== */}
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-300 drop-shadow-sm">
          Uzman Vitrini
        </h1>

        <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
          Profilini sergile, ilanlarını yönet, rozet kazan ve platformdaki
          yerini gör.
        </p>
      </div>

      {/* ==========================================================
          GLASSMORPHIC TAB NAVİGASYONU
      ========================================================== */}
      <div
        className="
          flex
          bg-slate-900/40
          backdrop-blur-xl
          border-2 border-white/20
          p-1.5
          rounded-2xl
          gap-3
          overflow-x-auto
          shadow-[0_0_25px_rgba(15,23,42,0.45)]
        "
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex
                items-center
                gap-2.5
                px-5
                py-2.5
                rounded-xl
                text-xs
                font-heading
                font-bold
                transition-all
                duration-300
                relative

                ${
                  isActive
                    ? `
                      bg-gradient-to-r
                      from-slate-800/90
                      to-slate-900/90
                      text-white

                      shadow-[0_0_20px_rgba(234,88,12,0.3)]

                      border-2
                      border-white/30

                      hover:border-white/40
                    `
                    : `
                      text-slate-400
                      border-2
                      border-transparent
                      hover:text-slate-200
                      hover:bg-slate-800/30
                      hover:border-white/15
                    `
                }
              `}
            >
              <Icon
                size={15}
                className={
                  isActive
                    ? "text-orange-400 drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]"
                    : "text-slate-400"
                }
              />

              <span>{tab.label}</span>

              {isActive && (
                <span
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    -translate-x-1/2
                    w-12
                    h-0.5
                    bg-gradient-to-r
                    from-orange-500
                    to-amber-400
                    rounded-full
                    shadow-[0_0_10px_rgba(234,88,12,1)]
                  "
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ==========================================================
          TAB İÇERİKLERİ
      ========================================================== */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "showcase" && (
          <ShowcasePanel onNavigate={setActiveTab} />
        )}

        {activeTab === "badges" && (
          <BadgesPanel onNavigate={setActiveTab} />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardPanel onNavigate={setActiveTab} />
        )}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-white font-bold text-sm p-8">
          Arayüz Yükleniyor...
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}