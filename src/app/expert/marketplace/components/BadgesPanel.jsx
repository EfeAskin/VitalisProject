"use client";
// src/app/expert/marketplace/components/BadgesPanel.jsx
import React, { useMemo, useState } from "react";
import {
  Crown,
  Users,
  Flame,
  Star,
  Lock,
  CheckCircle2,
  MessageCircle,
  Clock,
  Dumbbell,
  Apple,
  Trophy,
  Store,
  ChevronRight,
} from "lucide-react";

const TIERS = [
  { name: "Bronz Uzman", min: 0 },
  { name: "Gümüş Uzman", min: 500 },
  { name: "Altın Uzman", min: 1500 },
  { name: "Platin Uzman", min: 3500 },
  { name: "Elmas Uzman", min: 7000 },
];

const CURRENT_POINTS = 1840;

const BADGE_CATEGORIES = [
  {
    id: "clients",
    label: "Danışan Başarıları",
    badges: [
      { id: "c1", label: "İlk Danışan", desc: "İlk danışanını kabul ettin", icon: Users, earned: true },
      { id: "c2", label: "10 Danışan Kulübü", desc: "Aynı anda 10 aktif danışana ulaş", icon: Users, earned: true },
      { id: "c3", label: "25 Danışan Kulübü", desc: "Aynı anda 25 aktif danışana ulaş", icon: Users, earned: false, progress: { current: 18, target: 25 } },
      { id: "c4", label: "Sadakat Ustası", desc: "Bir danışanı 12 aydır kesintisiz koçluk yapıyorsun", icon: Flame, earned: false, progress: { current: 7, target: 12 } },
    ],
  },
  {
    id: "content",
    label: "İçerik & Program Başarıları",
    badges: [
      { id: "p1", label: "Şablon Ustası", desc: "50 antrenman/beslenme şablonu oluştur", icon: Dumbbell, earned: true },
      { id: "p2", label: "Beslenme Uzmanı", desc: "100 beslenme planı hazırla", icon: Apple, earned: false, progress: { current: 62, target: 100 } },
      { id: "p3", label: "Hızlı Yanıt", desc: "30 gün boyunca mesajlara 1 saatten kısa sürede yanıt ver", icon: Clock, earned: true },
    ],
  },
  {
    id: "community",
    label: "Topluluk & İtibar Başarıları",
    badges: [
      { id: "t1", label: "5 Yıldız Seri", desc: "Üst üste 20 danışandan 5 yıldız al", icon: Star, earned: true },
      { id: "t2", label: "Yorum Şampiyonu", desc: "100 danışan yorumuna ulaş", icon: MessageCircle, earned: false, progress: { current: 86, target: 100 } },
      { id: "t3", label: "Vitrin Yıldızı", desc: "Profilin 1000 kez görüntülensin", icon: Store, earned: true },
    ],
  },
];

export default function BadgesPanel({ onNavigate }) {
  const [filter, setFilter] = useState("all"); // all | earned | locked

  const currentTierIndex = useMemo(() => {
    let idx = 0;
    TIERS.forEach((t, i) => {
      if (CURRENT_POINTS >= t.min) idx = i;
    });
    return idx;
  }, []);

  const currentTier = TIERS[currentTierIndex];
  const nextTier = TIERS[currentTierIndex + 1];
  const progressPct = nextTier
    ? Math.min(100, ((CURRENT_POINTS - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  const totalBadges = BADGE_CATEGORIES.flatMap((c) => c.badges).length;
  const earnedBadges = BADGE_CATEGORIES.flatMap((c) => c.badges).filter((b) => b.earned).length;

  return (
    <div className="space-y-5">
      {/* Seviye / Puan Kartı */}
      <div className="bg-gradient-to-br from-[#111827] to-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#EA580C]/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EA580C] to-orange-700 flex items-center justify-center shadow-[0_0_25px_rgba(234,88,12,0.5)]">
              <Crown size={28} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Mevcut Seviye</p>
              <h2 className="text-xl font-black text-white">{currentTier.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {earnedBadges}/{totalBadges} rozet kazanıldı
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-sm w-full">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
              <span>{CURRENT_POINTS} Puan</span>
              <span>{nextTier ? `${nextTier.min} Puan · ${nextTier.name}` : "Maksimum Seviye"}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EA580C] to-orange-400 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.6)] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextTier && (
              <p className="text-[10px] text-slate-500 mt-1.5">
                {nextTier.name} seviyesine {nextTier.min - CURRENT_POINTS} puan kaldı
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex items-center gap-2">
        {[
          { id: "all", label: "Tümü" },
          { id: "earned", label: "Kazanılanlar" },
          { id: "locked", label: "Devam Edenler" },
        ].map((f) => (
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

      {/* Rozet Kategorileri */}
      {BADGE_CATEGORIES.map((category) => {
        const visibleBadges = category.badges.filter((b) => {
          if (filter === "earned") return b.earned;
          if (filter === "locked") return !b.earned;
          return true;
        });
        if (visibleBadges.length === 0) return null;

        return (
          <div key={category.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4">{category.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.id}
                    className={`relative rounded-xl border p-4 flex flex-col items-center text-center gap-2 transition-all ${
                      badge.earned
                        ? "bg-gradient-to-b from-[#182134] to-[#0B1120] border-[#EA580C]/40 shadow-[0_0_15px_rgba(234,88,12,0.12)]"
                        : "bg-[#141b2c] border-slate-800"
                    }`}
                  >
                    {badge.earned && (
                      <CheckCircle2 size={14} className="absolute top-2.5 right-2.5 text-emerald-400" />
                    )}
                    {!badge.earned && <Lock size={13} className="absolute top-2.5 right-2.5 text-slate-600" />}

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        badge.earned ? "bg-[#EA580C]/15 text-[#EA580C]" : "bg-slate-800 text-slate-600"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <h4 className={`text-xs font-bold ${badge.earned ? "text-white" : "text-slate-400"}`}>
                      {badge.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-snug">{badge.desc}</p>

                    {!badge.earned && badge.progress && (
                      <div className="w-full mt-1">
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-600 rounded-full"
                            style={{ width: `${(badge.progress.current / badge.progress.target) * 100}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-600 mt-1 font-bold">
                          {badge.progress.current}/{badge.progress.target}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

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
          onClick={() => onNavigate?.("leaderboard")}
          className="flex items-center justify-between bg-[#111827] border border-slate-800 hover:border-[#EA580C]/50 rounded-xl px-4 py-3 transition-colors group"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white">
            <Trophy size={14} className="text-[#EA580C]" /> Liderlik Tablosu
          </span>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-[#EA580C]" />
        </button>
      </div>
    </div>
  );
}