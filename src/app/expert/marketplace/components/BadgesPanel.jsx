"use client";
// src/app/expert/marketplace/components/BadgesPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

const TIERS = [
  { name: "Bronz Uzman", min: 0 },
  { name: "Gümüş Uzman", min: 500 },
  { name: "Altın Uzman", min: 1500 },
  { name: "Platin Uzman", min: 3500 },
  { name: "Elmas Uzman", min: 7000 },
];

const DEFAULT_BADGE_CATEGORIES = [
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

export default function BadgesPanel({ onNavigate, user, specialistId }) {
  const [filter, setFilter] = useState("all"); // all | earned | locked
  const [currentUser, setCurrentUser] = useState(user || null);
  const [badgeCategories, setBadgeCategories] = useState(DEFAULT_BADGE_CATEGORIES);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Oturum bilgilerini alma
  useEffect(() => {
    if (!user) {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const parsed = JSON.parse(userJson);
          setCurrentUser(parsed);
        } catch (e) {
          console.error("User session parse hatası:", e);
        }
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  // Rozet ve Puan verisini çekme
  useEffect(() => {
    fetchBadgesData();
  }, [currentUser, specialistId]);

  const fetchBadgesData = async () => {
    setLoading(true);
    const activeUserId = specialistId || currentUser?.id;

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(activeUserId ? { "X-User-Id": String(activeUserId) } : {}),
      };

      const res = await fetch("/api/expert/marketplace/badges", { headers });
      if (res.ok) {
        const data = await res.json();
        setUserPoints(data.points ?? currentUser?.points ?? 1840);
        if (Array.isArray(data.categories)) {
          setBadgeCategories(data.categories);
        }
      } else {
        setUserPoints(currentUser?.points ?? 1840);
      }
    } catch (err) {
      console.error("Badges veri yükleme hatası:", err);
      setUserPoints(currentUser?.points ?? 1840);
    } finally {
      setLoading(false);
    }
  };

  const currentTierIndex = useMemo(() => {
    let idx = 0;
    TIERS.forEach((t, i) => {
      if (userPoints >= t.min) idx = i;
    });
    return idx;
  }, [userPoints]);

  const currentTier = TIERS[currentTierIndex];
  const nextTier = TIERS[currentTierIndex + 1];
  const progressPct = nextTier
    ? Math.min(100, ((userPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  const totalBadges = badgeCategories.flatMap((c) => c.badges).length;
  const earnedBadges = badgeCategories.flatMap((c) => c.badges).filter((b) => b.earned).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-300 gap-3 font-medium">
        <Loader2 className="animate-spin text-amber-500" size={24} />
        <span>Rozet ve seviye verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seviye / Puan Kartı */}
      <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-amber-500/25 rounded-3xl p-6 shadow-[0_0_25px_rgba(245,158,11,0.08)] hover:border-amber-400/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.13)] transition-all duration-500">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_0_25px_rgba(234,88,12,0.45)] ring-2 ring-amber-400/30 shrink-0">
              <Crown size={30} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>
            <div>
              <p className="text-[10px] font-heading font-black tracking-[0.2em] text-amber-400/90 uppercase">
                Mevcut Seviye
              </p>
              <h2 className="text-xl font-heading font-black text-white mt-0.5">{currentTier.name}</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {earnedBadges}/{totalBadges} rozet kazanıldı
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-sm w-full">
            <div className="flex justify-between text-[11px] font-heading font-extrabold text-slate-300 mb-2">
              <span>{userPoints} Puan</span>
              <span className="text-amber-400">
                {nextTier ? `${nextTier.min} Puan · ${nextTier.name}` : "Maksimum Seviye"}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900/80 border border-slate-700/50 rounded-full p-0.5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextTier && (
              <p className="text-[10px] font-bold text-slate-400 mt-2">
                {nextTier.name} seviyesine <span className="text-amber-400">{nextTier.min - userPoints}</span> puan kaldı
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

      {/* Rozet Kategorileri */}
      {badgeCategories.map((category) => {
        const visibleBadges = category.badges.filter((b) => {
          if (filter === "earned") return b.earned;
          if (filter === "locked") return !b.earned;
          return true;
        });
        if (visibleBadges.length === 0) return null;

        return (
          <div
            key={category.id}
            className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-violet-500/25 rounded-3xl p-6 shadow-[0_0_25px_rgba(139,92,246,0.08)] hover:border-violet-400/40 hover:shadow-[0_0_35px_rgba(139,92,246,0.13)] transition-all duration-500"
          >
            <div className="absolute -top-32 right-0 w-80 h-80 bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

            <p className="text-[10px] font-heading font-black tracking-[0.2em] text-violet-400 uppercase mb-4 relative z-10">
              {category.label}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
              {visibleBadges.map((badge) => {
                const Icon = badge.icon || Trophy;
                return (
                  <div
                    key={badge.id}
                    className={`relative rounded-2xl border p-4 flex flex-col items-center text-center gap-2.5 backdrop-blur-xl transition-all duration-300 group ${
                      badge.earned
                        ? "bg-slate-900/90 border-orange-500/40 shadow-[0_0_20px_rgba(234,88,12,0.12)] hover:border-orange-400/60 hover:shadow-[0_0_25px_rgba(234,88,12,0.22)]"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 shadow-[0_0_12px_rgba(0,0,0,0.15)]"
                    }`}
                  >
                    {badge.earned && (
                      <CheckCircle2 size={16} className="absolute top-3 right-3 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                    {!badge.earned && <Lock size={14} className="absolute top-3 right-3 text-slate-600" />}

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                        badge.earned
                          ? "bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.2)]"
                          : "bg-slate-800/60 border border-slate-700/50 text-slate-500"
                      }`}
                    >
                      <Icon size={22} className={badge.earned ? "drop-shadow-[0_0_6px_rgba(234,88,12,0.4)]" : ""} />
                    </div>

                    <div>
                      <h4 className={`text-xs font-heading font-extrabold ${badge.earned ? "text-white" : "text-slate-400"}`}>
                        {badge.label}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-400 leading-snug mt-1">{badge.desc}</p>
                    </div>

                    {!badge.earned && badge.progress && (
                      <div className="w-full mt-auto pt-1">
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            style={{ width: `${(badge.progress.current / badge.progress.target) * 100}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-heading font-bold text-amber-400/90 mt-1.5">
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
          onClick={() => onNavigate?.("leaderboard")}
          className="relative overflow-hidden flex items-center justify-between bg-slate-800/40 backdrop-blur-2xl border border-amber-500/20 hover:border-amber-400/40 shadow-[0_0_18px_rgba(245,158,11,0.06)] hover:shadow-[0_0_25px_rgba(245,158,11,0.14)] rounded-2xl p-4 transition-all duration-300 group"
        >
          <span className="flex items-center gap-2.5 text-xs font-heading font-extrabold text-slate-300 group-hover:text-white transition-colors">
            <Trophy size={16} className="text-amber-400 drop-shadow-[0_0_7px_rgba(245,158,11,0.45)]" />
            Liderlik Tablosu
          </span>
          <ChevronRight size={15} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
}