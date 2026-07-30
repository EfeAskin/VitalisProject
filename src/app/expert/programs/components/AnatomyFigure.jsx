"use client";
// src/app/expert/programs/components/AnatomyFigure.jsx
// Premium, detaylı anatomik insan figürü (Ön + Arka).
// Her kas bölgesi bağımsız bir <path id="..."> — muscleData.js içindeki svgIds ile eşleşir.

import React, { useMemo } from "react";

const BASE = "#1E293B";      // pasif kas rengi
const BASE_LINE = "#0B1120"; // ince ayraç çizgisi
const SKIN = "#161F32";      // vücut siluet zemini (pasif bölgeler)

export default function AnatomyFigure({
  highlightedIds = new Set(),
  dimmedIds = new Set(),
  onMuscleClick,
  activeView = "both", // "front" | "back" | "both"
}) {
  const showFront = activeView !== "back";
  const showBack = activeView !== "front";

  const fillFor = (id) => {
    if (highlightedIds.has(id)) return "url(#muscleGradient)";
    if (dimmedIds.has(id)) return "#7C3A12";
    return BASE;
  };

  const glowFor = (id) => (highlightedIds.has(id) ? "url(#glow)" : "none");

  const commonProps = (id, label) => ({
    id,
    fill: fillFor(id),
    stroke: BASE_LINE,
    strokeWidth: 1,
    style: {
      filter: glowFor(id),
      cursor: onMuscleClick ? "pointer" : "default",
      transition: "fill 300ms ease, filter 300ms ease",
    },
    onClick: onMuscleClick ? () => onMuscleClick(id) : undefined,
    "data-muscle": label,
  });

  const Defs = useMemo(
    () => (
      <defs>
        <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="skinVignette" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#1B2740" />
          <stop offset="100%" stopColor="#0B1120" />
        </radialGradient>
      </defs>
    ),
    []
  );

  return (
    <div className="flex flex-row items-start justify-center gap-3 w-full">
      {showFront && (
        <FigureShell label="ÖN GÖRÜNÜM">
          <svg viewBox="0 0 220 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {Defs}
            <rect x="0" y="0" width="220" height="520" fill="url(#skinVignette)" opacity="0.4" />

            {/* Kafa & Boyun (pasif) */}
            <circle cx="110" cy="34" r="22" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <path d="M100,54 L120,54 L124,72 L96,72 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Ön Omuz */}
            <path {...commonProps("shoulder_front_l", "Ön Omuz")} d="M74,72 Q46,74 38,100 Q36,116 50,124 Q64,102 78,90 Z" />
            <path {...commonProps("shoulder_front_r", "Ön Omuz")} d="M146,72 Q174,74 182,100 Q184,116 170,124 Q156,102 142,90 Z" />

            {/* Yan Omuz (ön sliver) */}
            <path {...commonProps("shoulder_side_l", "Yan Omuz")} d="M38,100 Q30,114 36,130 L50,124 Q42,112 38,100 Z" />
            <path {...commonProps("shoulder_side_r", "Yan Omuz")} d="M182,100 Q190,114 184,130 L170,124 Q178,112 182,100 Z" />

            {/* Göğüs - Üst / Orta / Alt */}
            <path {...commonProps("chest_upper_l", "Üst Göğüs")} d="M78,80 Q95,78 108,84 L108,112 Q92,110 78,104 Z" />
            <path {...commonProps("chest_upper_r", "Üst Göğüs")} d="M142,80 Q125,78 112,84 L112,112 Q128,110 142,104 Z" />
            <path {...commonProps("chest_middle_l", "Orta Göğüs")} d="M78,104 Q94,110 108,112 L108,144 Q90,142 76,132 Z" />
            <path {...commonProps("chest_middle_r", "Orta Göğüs")} d="M142,104 Q126,110 112,112 L112,144 Q130,142 144,132 Z" />
            <path {...commonProps("chest_lower_l", "Alt Göğüs")} d="M76,132 Q90,142 108,144 L108,176 Q86,172 72,158 Q73,144 76,132 Z" />
            <path {...commonProps("chest_lower_r", "Alt Göğüs")} d="M144,132 Q130,142 112,144 L112,176 Q134,172 148,158 Q147,144 144,132 Z" />

            {/* Karın - Üst / Alt / Yan */}
            <rect {...commonProps("abs_upper_l", "Üst Karın")} x="96" y="188" width="12" height="21" rx="3" />
            <rect {...commonProps("abs_upper_r", "Üst Karın")} x="112" y="188" width="12" height="21" rx="3" />
            <rect {...commonProps("abs_lower_l", "Alt Karın")} x="96" y="212" width="12" height="21" rx="3" />
            <rect {...commonProps("abs_lower_r", "Alt Karın")} x="112" y="212" width="12" height="21" rx="3" />
            <path {...commonProps("abs_bottom", "Alt Karın")} d="M97,236 L123,236 L118,268 L110,278 L102,268 Z" />
            <path {...commonProps("obliques_l", "Yan Karın")} d="M82,190 Q75,222 80,262 L94,258 Q89,222 94,192 Z" />
            <path {...commonProps("obliques_r", "Yan Karın")} d="M138,190 Q145,222 140,262 L126,258 Q131,222 126,192 Z" />

            {/* Kalça bağlantısı (pasif) */}
            <path d="M90,284 L130,284 L134,304 L86,304 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Biceps */}
            <path {...commonProps("biceps_l", "Biceps")} d="M50,124 Q38,150 34,190 Q33,208 42,214 Q52,190 54,150 Q54,134 50,124 Z" />
            <path {...commonProps("biceps_r", "Biceps")} d="M170,124 Q182,150 186,190 Q187,208 178,214 Q168,190 166,150 Q166,134 170,124 Z" />

            {/* Ön Kol */}
            <path {...commonProps("forearm_front_l", "Ön Kol")} d="M42,214 Q34,250 32,290 Q32,300 40,306 Q48,280 48,240 Q48,224 42,214 Z" />
            <path {...commonProps("forearm_front_r", "Ön Kol")} d="M178,214 Q186,250 188,290 Q188,300 180,306 Q172,280 172,240 Q172,224 178,214 Z" />

            {/* Eller (pasif) */}
            <ellipse cx="37" cy="314" rx="7" ry="9" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <ellipse cx="183" cy="314" rx="7" ry="9" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Quadriceps */}
            <path {...commonProps("quad_l", "Quadriceps")} d="M87,304 Q76,338 74,382 Q72,412 79,428 L102,426 Q99,382 100,340 Q100,320 96,304 Z" />
            <path {...commonProps("quad_r", "Quadriceps")} d="M133,304 Q144,338 146,382 Q148,412 141,428 L118,426 Q121,382 120,340 Q120,320 124,304 Z" />

            {/* Diz (pasif) */}
            <path d="M78,428 L102,428 L102,442 L78,442 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <path d="M118,428 L142,428 L142,442 L118,442 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Baldır (ön) */}
            <path {...commonProps("calf_front_l", "Baldır")} d="M80,444 Q74,474 78,506 L96,506 Q94,474 96,444 Z" />
            <path {...commonProps("calf_front_r", "Baldır")} d="M140,444 Q146,474 142,506 L124,506 Q126,474 124,444 Z" />

            {/* Ayaklar (pasif) */}
            <path d="M74,506 L100,506 L104,516 L70,516 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <path d="M120,506 L146,506 L150,516 L116,516 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
          </svg>
        </FigureShell>
      )}

      {showBack && (
        <FigureShell label="ARKA GÖRÜNÜM">
          <svg viewBox="0 0 220 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {Defs}
            <rect x="0" y="0" width="220" height="520" fill="url(#skinVignette)" opacity="0.4" />

            {/* Kafa & Boyun (pasif) */}
            <circle cx="110" cy="34" r="22" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <path d="M96,58 L124,58 L128,74 L92,74 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Trapez */}
            <path {...commonProps("traps_l", "Trapez")} d="M110,58 L82,72 Q70,90 76,108 L110,100 Z" />
            <path {...commonProps("traps_r", "Trapez")} d="M110,58 L138,72 Q150,90 144,108 L110,100 Z" />

            {/* Arka Omuz */}
            <path {...commonProps("shoulder_rear_l", "Arka Omuz")} d="M74,72 Q46,74 38,100 Q36,116 50,124 Q64,102 78,90 Z" />
            <path {...commonProps("shoulder_rear_r", "Arka Omuz")} d="M146,72 Q174,74 182,100 Q184,116 170,124 Q156,102 142,90 Z" />

            {/* Yan Omuz (arka sliver) */}
            <path {...commonProps("shoulder_side_back_l", "Yan Omuz")} d="M38,100 Q30,114 36,130 L50,124 Q42,112 38,100 Z" />
            <path {...commonProps("shoulder_side_back_r", "Yan Omuz")} d="M182,100 Q190,114 184,130 L170,124 Q178,112 182,100 Z" />

            {/* Orta Sırt */}
            <path {...commonProps("mid_back_l", "Orta Sırt")} d="M92,110 Q90,140 92,168 L106,166 L106,112 Z" />
            <path {...commonProps("mid_back_r", "Orta Sırt")} d="M128,110 Q130,140 128,168 L114,166 L114,112 Z" />

            {/* Kanatlar (Lats) */}
            <path {...commonProps("lats_l", "Kanatlar")} d="M78,108 Q60,132 58,170 Q58,202 70,226 Q86,216 92,190 L92,120 Q86,112 78,108 Z" />
            <path {...commonProps("lats_r", "Kanatlar")} d="M142,108 Q160,132 162,170 Q162,202 150,226 Q134,216 128,190 L128,120 Q134,112 142,108 Z" />

            {/* Alt Bel */}
            <path {...commonProps("lower_back", "Alt Bel")} d="M92,226 Q110,234 128,226 L124,270 Q110,278 96,270 Z" />

            {/* Triceps */}
            <path {...commonProps("triceps_l", "Triceps")} d="M50,124 Q38,150 34,190 Q33,208 42,214 Q52,190 54,150 Q54,134 50,124 Z" />
            <path {...commonProps("triceps_r", "Triceps")} d="M170,124 Q182,150 186,190 Q187,208 178,214 Q168,190 166,150 Q166,134 170,124 Z" />

            {/* Ön Kol (arka yüz) */}
            <path {...commonProps("forearm_back_l", "Ön Kol")} d="M42,214 Q34,250 32,290 Q32,300 40,306 Q48,280 48,240 Q48,224 42,214 Z" />
            <path {...commonProps("forearm_back_r", "Ön Kol")} d="M178,214 Q186,250 188,290 Q188,300 180,306 Q172,280 172,240 Q172,224 178,214 Z" />

            {/* Eller (pasif) */}
            <ellipse cx="37" cy="314" rx="7" ry="9" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <ellipse cx="183" cy="314" rx="7" ry="9" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Kalça / Glute */}
            <path {...commonProps("glutes_l", "Glute")} d="M86,270 Q76,288 78,308 Q90,318 104,312 L106,272 Q96,268 86,270 Z" />
            <path {...commonProps("glutes_r", "Glute")} d="M134,270 Q144,288 142,308 Q130,318 116,312 L114,272 Q124,268 134,270 Z" />

            {/* Hamstring */}
            <path {...commonProps("hamstring_l", "Hamstring")} d="M78,312 Q72,346 74,384 Q76,410 84,426 L100,422 Q96,382 98,342 Q98,324 94,312 Z" />
            <path {...commonProps("hamstring_r", "Hamstring")} d="M142,312 Q148,346 146,384 Q144,410 136,426 L120,422 Q124,382 122,342 Q122,324 126,312 Z" />

            {/* Diz (pasif) */}
            <path d="M78,428 L102,428 L102,442 L78,442 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <path d="M118,428 L142,428 L142,442 L118,442 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />

            {/* Baldır (arka) */}
            <path {...commonProps("calf_back_l", "Baldır")} d="M80,444 Q74,474 78,506 L96,506 Q94,474 96,444 Z" />
            <path {...commonProps("calf_back_r", "Baldır")} d="M140,444 Q146,474 142,506 L124,506 Q126,474 124,444 Z" />

            {/* Ayaklar (pasif) */}
            <path d="M74,506 L100,506 L104,516 L70,516 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
            <path d="M120,506 L146,506 L150,516 L116,516 Z" fill={SKIN} stroke={BASE_LINE} strokeWidth="1" />
          </svg>
        </FigureShell>
      )}
    </div>
  );
}

function FigureShell({ label, children }) {
  return (
    <div className="relative w-full max-w-[130px] flex flex-col items-center">
      <span className="text-[8px] font-black tracking-[0.15em] text-slate-500 mb-1.5 uppercase">{label}</span>
      <div className="relative w-full aspect-[220/520] rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-40 pointer-events-none" />
        <div className="relative z-10 w-full h-full p-1.5">{children}</div>
      </div>
    </div>
  );
}