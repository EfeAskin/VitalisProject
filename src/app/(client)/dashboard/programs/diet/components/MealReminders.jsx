"use client";

import React from "react";
import { Bell, Clock } from "lucide-react";

export default function MealReminders() {
  return (
    <div className="bg-amber-950/25 border border-amber-500/40 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(245,158,11,0.18)] hover:border-amber-400/70 hover:shadow-[0_0_45px_rgba(245,158,11,0.3)] transition-all duration-500 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Bell className="w-6 h-6 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </div>
          <div>
            <h4 className="font-black text-base text-white tracking-wide">Günlük Öğün Hatırlatıcıları</h4>
            <p className="text-xs text-amber-100/70 font-medium">Metabolik saatinize uygun bildirimler</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 bg-[#11142D]/80 rounded-2xl border border-amber-500/20 text-xs backdrop-blur-md shadow-inner">
            <span className="font-bold text-white flex items-center gap-2.5 tracking-wide">
              <Clock className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" /> Sabah Kahvaltısı Zamanı
            </span>
            <span className="text-amber-300 font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">08:30</span>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#11142D]/80 rounded-2xl border border-amber-500/20 text-xs backdrop-blur-md shadow-inner">
            <span className="font-bold text-white flex items-center gap-2.5 tracking-wide">
              <Clock className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" /> Öğle Yemeği & Hidrasyon
            </span>
            <span className="text-amber-300 font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">13:30</span>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#11142D]/80 rounded-2xl border border-amber-500/20 text-xs backdrop-blur-md shadow-inner">
            <span className="font-bold text-white flex items-center gap-2.5 tracking-wide">
              <Clock className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" /> Akşam Yemeği Kapanışı
            </span>
            <span className="text-amber-300 font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">19:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}