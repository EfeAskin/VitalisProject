"use client";

import React, { useEffect, useState } from "react";
import {
  Footprints,
  Check,
  Loader2,
  ArrowUpRight,
  Target,
  Edit2,
} from "lucide-react";

export default function DailyStepsCard({
  initialSteps = 0,
  stepTarget = 10000,
  onStepLogged,
}) {
  const [stepsInput, setStepsInput] = useState("");
  const [currentSteps, setCurrentSteps] = useState(0);
  const [targetSteps, setTargetSteps] = useState(10000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState("10000");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchTodaySteps = async () => {
    try {
      setLoading(true);

      const savedTarget = localStorage.getItem("vitalis_step_target");

      if (savedTarget && !isNaN(parseInt(savedTarget, 10))) {
        setTargetSteps(parseInt(savedTarget, 10));
        setTempTarget(savedTarget);
      } else if (stepTarget) {
        setTargetSteps(stepTarget);
        setTempTarget(String(stepTarget));
      }

      const res = await fetch("/api/client/daily/calories-summary", {
        method: "GET",
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();

        const serverSteps = Number(json?.breakdown?.steps || 0);

        setCurrentSteps(serverSteps);
        setStepsInput(serverSteps > 0 ? String(serverSteps) : "");
      } else {
        const fallback = Number(initialSteps) || 0;

        setCurrentSteps(fallback);
        setStepsInput(fallback > 0 ? String(fallback) : "");
      }
    } catch (err) {
      console.error("Adım verisi yüklenirken hata:", err);

      const fallback = Number(initialSteps) || 0;

      setCurrentSteps(fallback);
      setStepsInput(fallback > 0 ? String(fallback) : "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySteps();
  }, [initialSteps]);

  const handleSaveSteps = async (e) => {
    e.preventDefault();

    if (saving) return;

    const trimmedSteps = stepsInput.trim();

    if (!trimmedSteps) return;

    const numSteps = Number(trimmedSteps);

    if (!Number.isFinite(numSteps) || numSteps < 0) return;

    try {
      setSaving(true);
      setSuccess(false);

      const res = await fetch("/api/client/daily/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steps: numSteps,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Adım sayısı kaydedilemedi.";

        try {
          const errorData = await res.json();

          if (typeof errorData?.detail === "string") {
            errorMessage = errorData.detail;
          }
        } catch {}

        throw new Error(errorMessage);
      }

      setCurrentSteps(numSteps);
      setStepsInput(String(numSteps));
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 2000);

      if (onStepLogged) {
        onStepLogged();
      }
    } catch (err) {
      console.error("Adım kaydedilirken hata:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();

    const newTarget = parseInt(tempTarget, 10);

    if (!isNaN(newTarget) && newTarget > 0) {
      setTargetSteps(newTarget);

      localStorage.setItem(
        "vitalis_step_target",
        String(newTarget)
      );
    }

    setIsEditingTarget(false);
  };

  const progressPercent =
    targetSteps > 0
      ? Math.min(
          Math.max(
            Math.round((currentSteps / targetSteps) * 100),
            0
          ),
          100
        )
      : 0;

  return (
    <>
      <style>{`
        /* =========================================================
           PREMIUM WALKING ANIMATIONS
           ========================================================= */

        @keyframes premiumWalkLeft {
          0%,
          100% {
            transform: translate3d(0, 0, 0)
              scale(0.94)
              rotate(-2deg);
            opacity: 0.48;
          }

          25% {
            transform: translate3d(-1px, -2px, 0)
              scale(1.02)
              rotate(-4deg);
            opacity: 0.82;
          }

          50% {
            transform: translate3d(0, 0, 0)
              scale(0.97)
              rotate(-1deg);
            opacity: 0.58;
          }

          75% {
            transform: translate3d(1px, -1px, 0)
              scale(1)
              rotate(-3deg);
            opacity: 0.72;
          }
        }

        @keyframes premiumWalkRight {
          0%,
          50%,
          100% {
            transform: translate3d(0, 0, 0)
              scale(0.94)
              rotate(2deg);
            opacity: 0.42;
          }

          70% {
            transform: translate3d(1px, -2px, 0)
              scale(1.02)
              rotate(4deg);
            opacity: 0.86;
          }

          85% {
            transform: translate3d(0, 0, 0)
              scale(0.98)
              rotate(1deg);
            opacity: 0.62;
          }
        }

        @keyframes premiumTrail {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }

          15% {
            opacity: 0;
          }

          35% {
            opacity: 0.42;
          }

          55% {
            opacity: 0.65;
          }

          75% {
            opacity: 0.18;
          }

          100% {
            transform: translateX(280%);
            opacity: 0;
          }
        }

        @keyframes premiumStepAura {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.42;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.62;
          }
        }

        @keyframes premiumProgressGlow {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }

          30% {
            opacity: 0;
          }

          50% {
            opacity: 0.65;
          }

          70% {
            opacity: 0;
          }

          100% {
            transform: translateX(180%);
            opacity: 0;
          }
        }

        @keyframes premiumSuccess {
          0% {
            transform: scale(0.82);
            opacity: 0;
          }

          55% {
            transform: scale(1.08);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .premium-step-left {
          animation: premiumWalkLeft 2.2s ease-in-out infinite;
          transform-origin: center center;
        }

        .premium-step-right {
          animation: premiumWalkRight 2.2s ease-in-out infinite;
          animation-delay: -1.1s;
          transform-origin: center center;
        }

        .premium-walking-trail {
          animation: premiumTrail 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .premium-step-aura {
          animation: premiumStepAura 4s ease-in-out infinite;
        }

        .premium-progress-glow {
          animation: premiumProgressGlow 4.2s ease-in-out infinite;
        }

        .premium-success {
          animation: premiumSuccess 350ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .premium-step-left,
          .premium-step-right,
          .premium-walking-trail,
          .premium-step-aura,
          .premium-progress-glow,
          .premium-success {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="
          relative group overflow-hidden rounded-3xl
          bg-gradient-to-b
          from-zinc-950
          via-zinc-900
          to-black
          p-6
          border border-emerald-500/30
          shadow-[0_10px_40px_rgba(16,185,129,0.14)]
          backdrop-blur-xl
          transition-all duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          hover:-translate-y-[2px]
          hover:border-emerald-500/50
          hover:shadow-[0_18px_55px_rgba(16,185,129,0.22)]
        "
      >
        {/* YÜRÜYÜŞ ARKA PLAN ANİMASYONU */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div
            className="
              premium-step-aura
              absolute
              -top-16
              -right-14
              w-52
              h-52
              bg-emerald-500/8
              rounded-full
              blur-3xl
              transition-all duration-1000
              group-hover:bg-emerald-400/12
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-emerald-500/20
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              w-2/5
              h-px
              bg-gradient-to-r
              from-transparent
              via-emerald-400/80
              to-transparent
              premium-walking-trail
              blur-[1px]
            "
          />
        </div>

        {/* BAŞLIK */}
        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="
                relative flex items-center justify-center
                w-11 h-11 rounded-2xl
                bg-gradient-to-br
                from-emerald-500/22
                to-teal-600/10
                border border-emerald-500/35
                shadow-[0_0_22px_rgba(16,185,129,0.18)]
                transition-all duration-700
                group-hover:border-emerald-400/50
                group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]
              "
            >
              <div className="flex items-center gap-1">
                <Footprints
                  className="
                    w-5 h-5
                    text-emerald-400
                    premium-step-left
                    -scale-x-100
                  "
                />

                <Footprints
                  className="
                    w-5 h-5
                    text-teal-300
                    premium-step-right
                  "
                />
              </div>

              <span
                className="
                  absolute inset-1
                  rounded-[14px]
                  bg-emerald-400/8
                  blur-md
                  transition-all duration-700
                  group-hover:bg-emerald-400/12
                "
              />
            </div>

            <div>
              <h3 className="text-sm font-extrabold tracking-wide text-zinc-100 uppercase">
                Günlük Adım Sayısı
              </h3>

              {isEditingTarget ? (
                <form
                  onSubmit={handleSaveTarget}
                  className="flex items-center gap-1 mt-0.5"
                >
                  <input
                    type="number"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    className="
                      w-20
                      bg-zinc-950
                      border border-emerald-500/50
                      rounded-lg
                      px-1.5 py-0.5
                      text-[11px]
                      text-white
                      focus:outline-none
                      focus:border-emerald-400/80
                      focus:ring-1
                      focus:ring-emerald-500/20
                      transition-all duration-300
                    "
                    autoFocus
                  />

                  <button
                    type="submit"
                    className="
                      text-[10px]
                      bg-emerald-500
                      hover:bg-emerald-400
                      text-black
                      px-1.5 py-0.5
                      rounded-lg
                      font-bold
                      transition-all duration-300
                      active:scale-95
                    "
                  >
                    KAYDET
                  </button>
                </form>
              ) : (
                <div
                  onClick={() => setIsEditingTarget(true)}
                  className="
                    flex items-center gap-1
                    text-[11px]
                    font-semibold
                    text-emerald-400
                    cursor-pointer
                    transition-all duration-400
                    hover:text-emerald-300
                  "
                  title="Hedefi Değiştir"
                >
                  <Target className="w-3 h-3 text-emerald-400" />

                  <span>
                    Hedef: {targetSteps.toLocaleString()} Adım
                  </span>

                  <Edit2 className="w-2.5 h-2.5 text-zinc-400 ml-0.5 transition-transform duration-400 hover:rotate-12" />
                </div>
              )}
            </div>
          </div>

          <span
            className="
              text-xs
              font-black
              text-emerald-400
              bg-emerald-500/10
              border border-emerald-500/25
              px-3 py-1
              rounded-full
              shadow-[0_0_14px_rgba(16,185,129,0.12)]
              transition-all duration-500
              group-hover:bg-emerald-500/15
            "
          >
            %{progressPercent}
          </span>
        </div>

        {/* İLERLEME ÇUBUĞU */}
        <div
          className="
            relative z-10
            w-full
            bg-zinc-800/75
            rounded-full
            h-2.5
            my-3
            overflow-hidden
            p-0.5
            border border-zinc-700/50
          "
        >
          <div
            className="
              relative
              bg-gradient-to-r
              from-emerald-500
              via-teal-400
              to-emerald-300
              h-full
              rounded-full
              transition-[width]
              duration-1000
              ease-[cubic-bezier(0.22,1,0.36,1)]
              shadow-[0_0_12px_rgba(16,185,129,0.4)]
              overflow-hidden
            "
            style={{
              width: `${progressPercent}%`,
            }}
          >
            <div
              className="
                absolute
                inset-y-0
                left-0
                w-1/3
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                premium-progress-glow
              "
            />
          </div>
        </div>

        {/* INPUT VE KAYDET */}
        <form
          onSubmit={handleSaveSteps}
          className="relative z-10 mt-4 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              step="1"
              value={stepsInput}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "" || /^\d+$/.test(value)) {
                  setStepsInput(value);
                }
              }}
              placeholder={
                loading
                  ? "Yükleniyor..."
                  : "Bugünkü adım sayısı..."
              }
              disabled={loading}
              className="
                w-full
                bg-zinc-950/80
                border border-zinc-800/80
                rounded-xl
                px-3.5 py-2
                text-sm
                text-white
                placeholder-zinc-500
                focus:outline-none
                focus:border-emerald-500/60
                focus:ring-2
                focus:ring-emerald-500/10
                transition-all duration-500
                font-medium
                hover:border-zinc-700
              "
            />
          </div>

          <button
            type="submit"
            disabled={
              saving ||
              loading ||
              !stepsInput.trim()
            }
            className="
              group/save
              flex items-center justify-center
              gap-1.5
              px-4 py-2
              rounded-xl
              bg-gradient-to-r
              from-emerald-500
              to-teal-500
              hover:from-emerald-400
              hover:to-teal-400
              text-zinc-950
              font-extrabold
              text-xs
              shadow-[0_8px_24px_rgba(16,185,129,0.18)]
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-all duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:-translate-y-[1px]
              hover:shadow-[0_10px_28px_rgba(16,185,129,0.26)]
              active:translate-y-0
              active:scale-[0.97]
            "
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : success ? (
              <Check className="w-4 h-4 text-zinc-950 premium-success" />
            ) : (
              <>
                Kaydet

                <ArrowUpRight
                  className="
                    w-3.5 h-3.5
                    transition-transform duration-500
                    group-hover/save:translate-x-0.5
                    group-hover/save:-translate-y-0.5
                  "
                />
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}