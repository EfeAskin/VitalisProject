"use client";
// src/app/expert/marketplace/components/LeaderboardPanel.jsx
import React, { useMemo, useState } from "react";
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Store,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const EXPERTS = [
  { rank: 1, name: "Elif Yıldız", initials: "EY", role: "Diyetisyen", points: 4820, trend: "same" },
  { rank: 2, name: "Kaan Demir", initials: "KD", role: "PT", points: 4390, trend: "up" },
  { rank: 3, name: "Zeynep Aksoy", initials: "ZA", role: "Diyetisyen", points: 3980, trend: "up" },
  { rank: 4, name: "Mert Şahin", initials: "MŞ", role: "PT", points: 3110, trend: "down" },
  { rank: 5, name: "Ömer Faruk Gürün", initials: "ÖG", role: "PT", points: 1840, trend: "up", isYou: true },
  { rank: 6, name: "Ayşe Kara", initials: "AK", role: "Diyetisyen", points: 1620, trend: "same" },
  { rank: 7, name: "Burak Yalçın", initials: "BY", role: "PT", points: 1405, trend: "down" },
  { rank: 8, name: "Selin Öztürk", initials: "SÖ", role: "Diyetisyen", points: 1120, trend: "up" },
];

const FILTERS = [
  { id: "all", label: "Tüm Uzmanlar" },
  { id: "PT", label: "Personal Trainer" },
  { id: "Diyetisyen", label: "Diyetisyen" },
];

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={13} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)]" />;
  if (trend === "down") return <TrendingDown size={13} className="text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.45)]" />;
  return <Minus size={13} className="text-slate-500" />;
};

const PODIUM_STYLE = {
  1: {
    height: "h-32",
    border: "border-amber-400/80",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.35)]",
    medal: "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.65)]",
    avatarBg: "bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 ring-2 ring-amber-300/50",
    pillarGradient: "from-amber-500/25 via-slate-900/90 to-slate-950/95 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]",
    rankBadge: "text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]",
  },
  2: {
    height: "h-24",
    border: "border-cyan-400/60",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.25)]",
    medal: "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]",
    avatarBg: "bg-gradient-to-tr from-slate-600 via-cyan-600 to-slate-400 ring-2 ring-cyan-400/40",
    pillarGradient: "from-cyan-500/20 via-slate-900/90 to-slate-950/95 border-cyan-500/30 shadow-[0_0_18px_rgba(34,211,238,0.10)]",
    rankBadge: "text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]",
  },
  3: {
    height: "h-20",
    border: "border-orange-500/60",
    glow: "shadow-[0_0_20px_rgba(234,88,12,0.25)]",
    medal: "text-orange-400 drop-shadow-[0_0_8px_rgba(234,88,12,0.65)]",
    avatarBg: "bg-gradient-to-tr from-orange-700 via-amber-600 to-orange-500 ring-2 ring-orange-500/40",
    pillarGradient: "from-orange-500/20 via-slate-900/90 to-slate-950/95 border-orange-500/30 shadow-[0_0_18px_rgba(234,88,12,0.10)]",
    rankBadge: "text-orange-400 drop-shadow-[0_0_10px_rgba(234,88,12,0.4)]",
  },
};

export default function LeaderboardPanel({ onNavigate }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (filter === "all" ? EXPERTS : EXPERTS.filter((e) => e.role === filter)),
    [filter]
  );

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean); // 2-1-3 görsel sıra

  return (
    <div className="space-y-6">
      {/* Filtre */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs font-heading font-extrabold px-4 py-2 rounded-full border transition-all duration-300 active:scale-95 ${
              filter === f.id
                ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white border-orange-400/50 shadow-[0_0_18px_rgba(234,88,12,0.35)]"
                : "bg-slate-900/80 backdrop-blur-md text-slate-400 border-slate-700/80 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Podyum */}
      {top3.length === 3 && (
        <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-amber-500/25 rounded-3xl p-6 shadow-[0_0_25px_rgba(245,158,11,0.08)] hover:border-amber-400/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.13)] transition-all duration-500">
          <div className="absolute -top-28 -left-28 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex items-end justify-center gap-4 sm:gap-6 relative z-10 pt-4">
            {podiumOrder.map((expert) => {
              const style = PODIUM_STYLE[expert.rank] || PODIUM_STYLE[3];
              return (
                <div key={expert.rank} className="flex flex-col items-center gap-2.5 w-28 sm:w-32 group">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${style.avatarBg} ${style.glow} flex items-center justify-center text-white font-heading font-black text-base sm:text-lg shadow-lg group-hover:scale-105 transition-transform duration-300`}
                    >
                      {expert.initials}
                    </div>
                    <Medal size={18} className={`absolute -bottom-1 -right-1 ${style.medal}`} />
                  </div>

                  <div className="text-center w-full px-1">
                    <p className="text-xs font-heading font-extrabold text-white truncate">{expert.name}</p>
                    <p className="text-[10px] font-bold text-amber-400/90 mt-0.5">{expert.points} puan</p>
                  </div>

                  <div
                    className={`w-full ${style.height} bg-gradient-to-t ${style.pillarGradient} border backdrop-blur-md border-b-0 rounded-t-2xl flex items-start justify-center pt-3 transition-all duration-300 group-hover:border-amber-400/50`}
                  >
                    <span className={`font-heading text-xl font-black ${style.rankBadge}`}>
                      #{expert.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sıralama Listesi */}
      <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-violet-500/25 rounded-3xl p-6 shadow-[0_0_25px_rgba(139,92,246,0.08)] hover:border-violet-400/40 hover:shadow-[0_0_35px_rgba(139,92,246,0.13)] transition-all duration-500">
        <div className="absolute -top-32 right-0 w-80 h-80 bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-2 mb-5 relative z-10">
          <Trophy size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.65)]" />
          <h3 className="font-heading text-base font-extrabold text-white tracking-tight">Genel Sıralama</h3>
        </div>

        <div className="space-y-2.5 relative z-10">
          {(top3.length === 3 ? rest : filtered).map((expert) => (
            <div
              key={expert.rank}
              className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border backdrop-blur-xl transition-all duration-300 ${
                expert.isYou
                  ? "bg-slate-900/90 border-orange-500/40 shadow-[0_0_20px_rgba(234,88,12,0.15)] hover:border-orange-400/60"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xs font-heading font-black text-slate-400 w-6 text-center">
                  #{expert.rank}
                </span>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center text-white text-xs font-heading font-black shadow-md">
                  {expert.initials}
                </div>

                <div>
                  <p className="text-xs font-heading font-extrabold text-white flex items-center gap-2">
                    {expert.name}
                    {expert.isYou && (
                      <span className="text-[9px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.4)]">
                        SEN
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {expert.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="font-heading text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-sm">
                  {expert.points}
                </span>
                <TrendIcon trend={expert.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Çapraz Navigasyon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate?.("showcase")}
          className="relative overflow-hidden flex items-center justify-between bg-slate-800/40 backdrop-blur-2xl border border-orange-500/20 hover:border-orange-400/40 shadow-[0_0_18px_rgba(234,88,12,0.06)] hover:shadow-[0_0_25px_rgba(234,88,12,0.14)] rounded-2xl p-4 transition-all duration-300 group"
        >
          <span className="flex items-center gap-2.5 text-xs font-heading font-extrabold text-slate-300 group-hover:text-white transition-colors">
            <Store size={16} className="text-orange-400 drop-shadow-[0_0_7px_rgba(234,88,12,0.45)]" />
            Vitrinim & İlanlarım
          </span>
          <ChevronRight size={15} className="text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onNavigate?.("badges")}
          className="relative overflow-hidden flex items-center justify-between bg-slate-800/40 backdrop-blur-2xl border border-amber-500/20 hover:border-amber-400/40 shadow-[0_0_18px_rgba(245,158,11,0.06)] hover:shadow-[0_0_25px_rgba(245,158,11,0.14)] rounded-2xl p-4 transition-all duration-300 group"
        >
          <span className="flex items-center gap-2.5 text-xs font-heading font-extrabold text-slate-300 group-hover:text-white transition-colors">
            <Award size={16} className="text-amber-400 drop-shadow-[0_0_7px_rgba(245,158,11,0.45)]" />
            Rozetlerim & Puanım
          </span>
          <ChevronRight size={15} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
}