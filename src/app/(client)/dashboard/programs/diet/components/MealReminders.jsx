"use client";

import React from "react";
import { Bell, Clock } from "lucide-react";

export default function MealReminders() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-base text-white">Günlük Öğün Hatırlatıcıları</h4>
          <p className="text-xs text-slate-400">Metabolik saatinize uygun bildirimler</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Sabah Kahvaltısı Zamanı
          </span>
          <span className="text-slate-400 font-extrabold">08:30</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Öğle Yemeği & Hidrasyon
          </span>
          <span className="text-slate-400 font-extrabold">13:30</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Akşam Yemeği Kapanışı
          </span>
          <span className="text-slate-400 font-extrabold">19:00</span>
        </div>
      </div>
    </div>
  );
}