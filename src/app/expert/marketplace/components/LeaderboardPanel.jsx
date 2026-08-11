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
  if (trend === "up") return <TrendingUp size={13} className="text-emerald-400" />;
  if (trend === "down") return <TrendingDown size={13} className="text-red-400" />;
  return <Minus size={13} className="text-slate-500" />;
};

const PODIUM_STYLE = {
  1: { height: "h-28", border: "border-[#EA580C]", glow: "shadow-[0_0_25px_rgba(234,88,12,0.35)]", medal: "text-[#EA580C]" },
  2: { height: "h-20", border: "border-slate-500", glow: "shadow-[0_0_15px_rgba(148,163,184,0.2)]", medal: "text-slate-300" },
  3: { height: "h-16", border: "border-amber-700", glow: "shadow-[0_0_15px_rgba(180,83,9,0.2)]", medal: "text-amber-600" },
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
    <div className="space-y-5">
      {/* Filtre */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
              filter === f.id
                ? "bg-[#EA580C] text-white border-[#EA580C] shadow-[0_0_12px_rgba(234,88,12,0.35)]"
                : "bg-[#111827] text-slate-400 border-slate-700 hover:border-slate-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Podyum */}
      {top3.length === 3 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map((expert) => {
              const style = PODIUM_STYLE[expert.rank] || PODIUM_STYLE[3];
              return (
                <div key={expert.rank} className="flex flex-col items-center gap-2 w-28">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-full bg-[#182134] border-2 ${style.border} ${style.glow} flex items-center justify-center text-white font-black text-sm`}
                    >
                      {expert.initials}
                    </div>
                    <Medal size={16} className={`absolute -bottom-1 -right-1 ${style.medal}`} />
                  </div>
                  <p className="text-xs font-bold text-white text-center truncate w-full">{expert.name}</p>
                  <p className="text-[10px] text-slate-500">{expert.points} puan</p>
                  <div
                    className={`w-full ${style.height} bg-gradient-to-t from-[#182134] to-[#0B1120] border ${style.border} border-b-0 rounded-t-lg flex items-start justify-center pt-2`}
                  >
                    <span className="text-lg font-black text-slate-600">#{expert.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sıralama Listesi */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={15} className="text-[#EA580C]" />
          <h3 className="text-sm font-bold text-white">Genel Sıralama</h3>
        </div>

        <div className="space-y-2">
          {(top3.length === 3 ? rest : filtered).map((expert) => (
            <div
              key={expert.rank}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                expert.isYou
                  ? "bg-[#EA580C]/10 border-[#EA580C]/40 shadow-[0_0_15px_rgba(234,88,12,0.12)]"
                  : "bg-[#182134] border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-500 w-6 text-center">#{expert.rank}</span>
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-black">
                  {expert.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    {expert.name}
                    {expert.isYou && (
                      <span className="text-[9px] font-black bg-[#EA580C] text-white px-1.5 py-0.5 rounded-full">SEN</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{expert.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-[#EA580C]">{expert.points}</span>
                <TrendIcon trend={expert.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Çapraz Navigasyon */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate?.("showcase")}
          className="flex items-center justify-between bg-[#111827] border border-slate-800 hover:border-[#EA580C]/50 rounded-xl px-4 py-3 transition-colors group"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white">
            <Store size={14} className="text-[#EA580C]" /> Vitrinim & İlanlarım
          </span>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-[#EA580C]" />
        </button>
        <button
          onClick={() => onNavigate?.("badges")}
          className="flex items-center justify-between bg-[#111827] border border-slate-800 hover:border-[#EA580C]/50 rounded-xl px-4 py-3 transition-colors group"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white">
            <Award size={14} className="text-[#EA580C]" /> Rozetlerim & Puanım
          </span>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-[#EA580C]" />
        </button>
      </div>
    </div>
  );
}