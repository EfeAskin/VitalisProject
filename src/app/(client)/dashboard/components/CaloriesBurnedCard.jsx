"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  Info,
  X,
  Zap,
  Activity,
  HeartPulse,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function CaloriesBurnedCard({ refreshTrigger = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const loadCalories = async () => {
    try {
      setLoading(true);
      setFetchError(false);

      const res = await fetch("/api/client/daily/calories-summary", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        let errorMessage = "Kalori özeti çekilemedi.";

        try {
          const errorData = await res.json();

          if (typeof errorData?.detail === "string") {
            errorMessage = errorData.detail;
          } else if (typeof errorData?.message === "string") {
            errorMessage = errorData.message;
          }
        } catch {
          // JSON okuma hatasında varsayılan mesaj kalır
        }

        throw new Error(errorMessage);
      }

      const json = await res.json();

      const safeData = {
        status: typeof json?.status === "string" ? json.status : "success",
        date: typeof json?.date === "string" ? json.date : "",

        total_burned: Number.isFinite(Number(json?.total_burned))
          ? Number(json.total_burned)
          : 0,

        breakdown: {
          bmr: Number.isFinite(Number(json?.breakdown?.bmr))
            ? Number(json.breakdown.bmr)
            : 0,

          workout_calories: Number.isFinite(
            Number(json?.breakdown?.workout_calories)
          )
            ? Number(json.breakdown.workout_calories)
            : 0,

          steps: Number.isFinite(Number(json?.breakdown?.steps))
            ? Number(json.breakdown.steps)
            : 0,

          step_calories: Number.isFinite(
            Number(json?.breakdown?.step_calories)
          )
            ? Number(json.breakdown.step_calories)
            : 0,
        },
      };

      setData(safeData);
    } catch (err) {
      console.error("Kalori özeti çekilirken hata oluştu:", err);

      setFetchError(true);

      setData({
        status: "error",
        total_burned: 0,
        breakdown: {
          bmr: 0,
          workout_calories: 0,
          steps: 0,
          step_calories: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    loadCalories();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  useEffect(() => {
    if (!showModal) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const totalBurned = Number.isFinite(Number(data?.total_burned))
    ? Number(data?.total_burned)
    : 0;

  const bmr = Number.isFinite(Number(data?.breakdown?.bmr))
    ? Number(data?.breakdown?.bmr)
    : 0;

  const workoutCalories = Number.isFinite(
    Number(data?.breakdown?.workout_calories)
  )
    ? Number(data?.breakdown?.workout_calories)
    : 0;

  const steps = Number.isFinite(Number(data?.breakdown?.steps))
    ? Number(data.breakdown.steps)
    : 0;

  const stepCalories = Number.isFinite(
    Number(data?.breakdown?.step_calories)
  )
    ? Number(data.breakdown.step_calories)
    : 0;

  return (
    <>
      <style>{`
        /* =========================================================
           PREMIUM CALORIE ANIMATIONS
           ========================================================= */

        @keyframes premiumFireOuter {
          0% {
            transform: translate3d(0, 0, 0)
              scaleX(1)
              scaleY(1)
              rotate(-1deg);
            opacity: 0.68;
          }

          20% {
            transform: translate3d(1px, -2px, 0)
              scaleX(0.96)
              scaleY(1.07)
              rotate(1deg);
            opacity: 0.78;
          }

          45% {
            transform: translate3d(-2px, -5px, 0)
              scaleX(1.025)
              scaleY(1.12)
              rotate(-1.5deg);
            opacity: 0.72;
          }

          70% {
            transform: translate3d(2px, -3px, 0)
              scaleX(0.94)
              scaleY(1.05)
              rotate(1deg);
            opacity: 0.8;
          }

          100% {
            transform: translate3d(-1px, -1px, 0)
              scaleX(1.015)
              scaleY(1.02)
              rotate(-0.5deg);
            opacity: 0.7;
          }
        }

        @keyframes premiumFireMiddle {
          0% {
            transform: translate3d(0, 0, 0)
              scaleX(1)
              scaleY(1)
              rotate(1deg);
            opacity: 0.72;
          }

          25% {
            transform: translate3d(-2px, -4px, 0)
              scaleX(0.93)
              scaleY(1.1)
              rotate(-2deg);
            opacity: 0.86;
          }

          50% {
            transform: translate3d(1px, -7px, 0)
              scaleX(1.04)
              scaleY(1.16)
              rotate(1.5deg);
            opacity: 0.76;
          }

          75% {
            transform: translate3d(-1px, -3px, 0)
              scaleX(0.96)
              scaleY(1.07)
              rotate(-1deg);
            opacity: 0.9;
          }

          100% {
            transform: translate3d(1px, -1px, 0)
              scaleX(1)
              scaleY(1.03)
              rotate(0deg);
            opacity: 0.74;
          }
        }

        @keyframes premiumFireCore {
          0% {
            transform: translate3d(0, 0, 0)
              scaleX(1)
              scaleY(1);
            opacity: 0.78;
          }

          30% {
            transform: translate3d(1px, -4px, 0)
              scaleX(0.91)
              scaleY(1.13);
            opacity: 0.92;
          }

          55% {
            transform: translate3d(-1px, -7px, 0)
              scaleX(1.06)
              scaleY(1.18);
            opacity: 0.84;
          }

          80% {
            transform: translate3d(1px, -3px, 0)
              scaleX(0.95)
              scaleY(1.08);
            opacity: 0.95;
          }

          100% {
            transform: translate3d(0, -1px, 0)
              scaleX(1)
              scaleY(1.03);
            opacity: 0.8;
          }
        }

        @keyframes premiumEmberOne {
          0% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0;
          }

          15% {
            opacity: 0.85;
          }

          50% {
            transform: translate3d(8px, -30px, 0) scale(0.72);
            opacity: 0.62;
          }

          80% {
            transform: translate3d(-3px, -55px, 0) scale(0.35);
            opacity: 0.25;
          }

          100% {
            transform: translate3d(6px, -70px, 0) scale(0.05);
            opacity: 0;
          }
        }

        @keyframes premiumEmberTwo {
          0% {
            transform: translate3d(0, 0, 0) scale(0.6);
            opacity: 0;
          }

          18% {
            opacity: 0.9;
          }

          45% {
            transform: translate3d(-9px, -34px, 0) scale(0.7);
            opacity: 0.58;
          }

          75% {
            transform: translate3d(4px, -65px, 0) scale(0.25);
            opacity: 0.2;
          }

          100% {
            transform: translate3d(-4px, -88px, 0) scale(0);
            opacity: 0;
          }
        }

        @keyframes premiumEmberThree {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }

          20% {
            opacity: 0.8;
          }

          50% {
            transform: translate3d(-5px, -27px, 0) scale(0.6);
            opacity: 0.55;
          }

          78% {
            transform: translate3d(7px, -50px, 0) scale(0.22);
            opacity: 0.15;
          }

          100% {
            transform: translate3d(2px, -66px, 0) scale(0);
            opacity: 0;
          }
        }

        @keyframes premiumAura {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.48;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.7;
          }
        }

        @keyframes premiumFlameIcon {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          35% {
            transform: translateY(-1px) scale(1.025);
          }

          65% {
            transform: translateY(1px) scale(0.985);
          }
        }

        @keyframes premiumModalIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.965);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes premiumBackdropIn {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes premiumShimmer {
          0% {
            transform: translateX(-140%);
            opacity: 0;
          }

          20% {
            opacity: 0;
          }

          45% {
            opacity: 0.5;
          }

          65% {
            opacity: 0;
          }

          100% {
            transform: translateX(160%);
            opacity: 0;
          }
        }

        .premium-fire-outer {
          animation: premiumFireOuter 2.9s ease-in-out infinite;
          transform-origin: bottom center;
          will-change: transform, opacity;
        }

        .premium-fire-middle {
          animation: premiumFireMiddle 2.15s ease-in-out infinite;
          animation-delay: -0.45s;
          transform-origin: bottom center;
          will-change: transform, opacity;
        }

        .premium-fire-core {
          animation: premiumFireCore 1.65s ease-in-out infinite;
          animation-delay: -0.2s;
          transform-origin: bottom center;
          will-change: transform, opacity;
        }

        .premium-ember-one {
          animation: premiumEmberOne 3.8s ease-out infinite;
        }

        .premium-ember-two {
          animation: premiumEmberTwo 4.6s ease-out infinite;
          animation-delay: -1.8s;
        }

        .premium-ember-three {
          animation: premiumEmberThree 3.4s ease-out infinite;
          animation-delay: -2.4s;
        }

        .premium-aura {
          animation: premiumAura 4.5s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .premium-flame-icon {
          animation: premiumFlameIcon 2.4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .premium-modal-backdrop {
          animation: premiumBackdropIn 280ms ease-out forwards;
        }

        .premium-modal-panel {
          animation: premiumModalIn 360ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .premium-shimmer {
          animation: premiumShimmer 4.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .premium-fire-outer,
          .premium-fire-middle,
          .premium-fire-core,
          .premium-ember-one,
          .premium-ember-two,
          .premium-ember-three,
          .premium-aura,
          .premium-flame-icon,
          .premium-modal-backdrop,
          .premium-modal-panel,
          .premium-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      {/* KART KONTEYNERİ */}
      <div
        className="
          relative group overflow-hidden rounded-3xl
          bg-gradient-to-b from-zinc-950 via-zinc-900 to-black
          p-6
          border border-orange-500/30
          shadow-[0_10px_40px_rgba(249,115,22,0.14)]
          backdrop-blur-xl
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          hover:-translate-y-[2px]
          hover:border-orange-500/50
          hover:shadow-[0_18px_55px_rgba(249,115,22,0.22)]
        "
      >
        {/* ŞÖMİNE ATEŞİ ARKA PLAN KATMANI */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {/* Premium sıcak aura */}
          <div
            className="
              premium-aura
              absolute -bottom-12 right-[-10%] left-[-10%]
              h-48
              bg-gradient-to-t
              from-red-600/25
              via-orange-500/12
              to-transparent
              blur-3xl
              transition-opacity duration-700
            "
          />

          {/* Ek yumuşak sıcaklık katmanı */}
          <div
            className="
              absolute bottom-[-20px] right-[-15px]
              w-56 h-56
              rounded-full
              bg-orange-500/8
              blur-[70px]
              opacity-70
              transition-all duration-1000
              group-hover:bg-orange-400/12
              group-hover:opacity-90
            "
          />

          {/* Gerçekçi Çok Katmanlı Alev Şekilleri */}
          <div className="absolute bottom-0 right-5 w-36 h-36 flex items-end justify-center opacity-80">
            {/* Dış Kırmızı Alev */}
            <div
              className="
                premium-fire-outer
                absolute bottom-0
                w-28 h-30
                bg-gradient-to-t
                from-red-700/80
                via-orange-600/65
                to-transparent
                rounded-t-[55%]
                blur-[4px]
              "
            />

            {/* Orta Turuncu Alev */}
            <div
              className="
                premium-fire-middle
                absolute bottom-0
                w-20 h-24
                bg-gradient-to-t
                from-orange-500/85
                via-amber-500/75
                to-transparent
                rounded-t-[60%]
                blur-[2px]
              "
            />

            {/* İç Sarı Sıcak Çekirdek */}
            <div
              className="
                premium-fire-core
                absolute bottom-0
                w-12 h-16
                bg-gradient-to-t
                from-yellow-300/90
                via-amber-200/85
                to-transparent
                rounded-t-[65%]
                blur-[0.5px]
              "
            />
          </div>

          {/* Közler */}
          <div className="absolute bottom-7 right-16 w-2 h-2 bg-yellow-300 rounded-full premium-ember-one shadow-[0_0_12px_rgba(253,224,71,0.8)]" />

          <div className="absolute bottom-5 right-10 w-2 h-2 bg-orange-400 rounded-full premium-ember-two shadow-[0_0_14px_rgba(251,146,60,0.75)]" />

          <div className="absolute bottom-9 right-24 w-1.5 h-1.5 bg-red-400 rounded-full premium-ember-three shadow-[0_0_10px_rgba(248,113,113,0.75)]" />
        </div>

        {/* Başlık ve İkon */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="
                relative flex items-center justify-center
                w-11 h-11 rounded-2xl
                bg-gradient-to-br
                from-orange-500/25
                via-red-600/15
                to-amber-500/10
                border border-orange-500/35
                shadow-[0_0_24px_rgba(249,115,22,0.22)]
                transition-all duration-700
                group-hover:border-orange-400/50
                group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]
              "
            >
              <Flame className="w-6 h-6 text-amber-400 premium-flame-icon" />

              <span
                className="
                  absolute inset-1
                  rounded-[14px]
                  bg-orange-400/10
                  blur-md
                  opacity-50
                  transition-all duration-700
                  group-hover:opacity-80
                "
              />
            </div>

            <div>
              <h3 className="text-sm font-extrabold tracking-wide text-zinc-100 uppercase">
                Harcanan Kalori
              </h3>

              <p className="text-[11px] font-semibold text-orange-400/85">
                Günlük Enerji Tüketimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={loadCalories}
              className="
                group/refresh
                p-2 rounded-xl
                bg-zinc-800/65
                border border-zinc-700/50
                text-zinc-300
                hover:text-orange-400
                hover:bg-orange-500/5
                hover:border-orange-500/30
                transition-all duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:shadow-[0_0_18px_rgba(249,115,22,0.12)]
                active:scale-95
              "
              title="Yenile"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 transition-transform duration-500 ${
                  loading ? "animate-spin text-orange-400" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="
                p-2 rounded-xl
                bg-zinc-800/65
                border border-zinc-700/50
                text-zinc-300
                hover:text-orange-400
                hover:bg-orange-500/5
                hover:border-orange-500/30
                transition-all duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:shadow-[0_0_18px_rgba(249,115,22,0.12)]
                active:scale-95
              "
              title="Kalori Dökümü"
              aria-label="Kalori dökümünü aç"
            >
              <Info className="w-4 h-4 transition-transform duration-500 hover:rotate-6" />
            </button>
          </div>
        </div>

        {/* Ana Sayaç Alanı */}
        <div className="relative z-10 flex items-baseline gap-2 my-2">
          {loading ? (
            <div
              className="
                h-10 w-36
                bg-gradient-to-r
                from-zinc-800/70
                via-zinc-700/60
                to-zinc-800/70
                rounded-xl
                animate-pulse
              "
            />
          ) : (
            <div className="relative overflow-hidden rounded-xl">
              <span
                className="
                  absolute inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent
                  -translate-x-full
                  premium-shimmer
                  pointer-events-none
                "
              />

              <span
                className="
                  relative
                  text-4xl
                  font-black
                  tracking-tight
                  bg-gradient-to-r
                  from-yellow-200
                  via-orange-400
                  to-red-500
                  bg-clip-text
                  text-transparent
                  drop-shadow-[0_2px_12px_rgba(249,115,22,0.3)]
                "
              >
                {totalBurned.toLocaleString()}
              </span>
            </div>
          )}

          <span
            className="
              text-xs font-black
              text-orange-400
              uppercase tracking-widest
              bg-orange-500/10
              px-2.5 py-1
              rounded-md
              border border-orange-500/25
              shadow-[0_0_14px_rgba(249,115,22,0.06)]
            "
          >
            Kcal
          </span>
        </div>

        {/* Uyarı Mesajı */}
        {fetchError && (
          <div
            className="
              relative z-10 my-2
              flex items-center gap-1.5
              text-[11px]
              text-orange-300
              bg-orange-500/10
              border border-orange-500/25
              px-3 py-1.5
              rounded-xl
              transition-all duration-500
            "
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-orange-400" />

            <span>
              Veriler güncelleniyor... (Varsayılan değer gösteriliyor)
            </span>
          </div>
        )}

        {/* İlerleme ve Alt Bilgi */}
        <div
          className="
            relative z-10
            mt-4 pt-3
            border-t border-zinc-800/70
            flex items-center justify-between
            text-xs text-zinc-400
          "
        >
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />

            BMR + Egzersiz + Adım
          </span>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="
              text-orange-400
              font-bold
              text-[11px]
              transition-all duration-500
              hover:text-orange-300
              hover:tracking-[0.02em]
              hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.35)]
            "
          >
            Detaylı Döküm →
          </button>
        </div>
      </div>

      {/* DETAY MODALI */}
      {showModal && (
        <div
          className="
            premium-modal-backdrop
            fixed inset-0 z-50
            flex items-center justify-center
            p-4
            bg-black/75
            backdrop-blur-xl
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="calories-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="
              premium-modal-panel
              relative
              w-full max-w-md
              max-h-[90vh]
              overflow-y-auto
              bg-gradient-to-b
              from-zinc-900
              via-zinc-900
              to-zinc-950
              border border-orange-500/30
              rounded-3xl
              p-6
              shadow-[0_25px_80px_rgba(249,115,22,0.18)]
            "
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="
                absolute top-5 right-5
                p-2 rounded-full
                bg-zinc-800/70
                border border-zinc-700/40
                text-zinc-400
                hover:text-white
                hover:bg-zinc-700/70
                transition-all duration-400
                hover:rotate-90
                active:scale-90
              "
              aria-label="Modalı kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pr-10">
              <div
                className="
                  p-3 rounded-2xl
                  bg-orange-500/10
                  border border-orange-500/25
                  shadow-[0_0_22px_rgba(249,115,22,0.12)]
                "
              >
                <Flame className="w-6 h-6 text-orange-500 premium-flame-icon" />
              </div>

              <div>
                <h2
                  id="calories-modal-title"
                  className="text-lg font-bold text-white"
                >
                  Kalori Harcama Dökümü
                </h2>

                <p className="text-xs text-zinc-400">
                  Bugün harcanan toplam enerjinin kaynağı
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="
                  flex items-center justify-between
                  p-3.5 rounded-2xl
                  bg-zinc-800/50
                  border border-zinc-700/40
                  transition-all duration-500
                  hover:bg-zinc-800/75
                  hover:border-rose-400/20
                  hover:translate-x-0.5
                "
              >
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-5 h-5 text-rose-400" />

                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Bazal Metabolizma (BMR)
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      Vücudun temel yaşamsal harcaması
                    </p>
                  </div>
                </div>

                <span className="text-sm font-bold text-white">
                  +{bmr.toLocaleString()} Kcal
                </span>
              </div>

              <div
                className="
                  flex items-center justify-between
                  p-3.5 rounded-2xl
                  bg-zinc-800/50
                  border border-zinc-700/40
                  transition-all duration-500
                  hover:bg-zinc-800/75
                  hover:border-orange-400/20
                  hover:translate-x-0.5
                "
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-orange-400" />

                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Tamamlanan Antrenmanlar
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      Hazır ve Koç Programları
                    </p>
                  </div>
                </div>

                <span className="text-sm font-bold text-orange-400">
                  +{workoutCalories.toLocaleString()} Kcal
                </span>
              </div>

              <div
                className="
                  flex items-center justify-between
                  p-3.5 rounded-2xl
                  bg-zinc-800/50
                  border border-zinc-700/40
                  transition-all duration-500
                  hover:bg-zinc-800/75
                  hover:border-emerald-400/20
                  hover:translate-x-0.5
                "
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400" />

                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Günlük Atılan Adımlar
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      {steps.toLocaleString()} Adım
                    </p>
                  </div>
                </div>

                <span className="text-sm font-bold text-emerald-400">
                  +{stepCalories.toLocaleString()} Kcal
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">
                Bugünkü Net Harcanan
              </span>

              <span className="text-2xl font-black text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.25)]">
                {totalBurned.toLocaleString()} Kcal
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}