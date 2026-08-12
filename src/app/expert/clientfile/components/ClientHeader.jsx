"use client";

import React from "react";
import { ArrowLeft, MessageSquare, Sparkles, Clock, ShieldCheck } from "lucide-react";

export default function ClientHeader({ client, onBack }) {
  return (
    <div className="relative z-10 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3.5 bg-slate-950/80 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-2xl border border-slate-800/80 hover:border-slate-700/80 shadow-inner hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group flex-shrink-0"
          title="Listeye Geri Dön"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-orange-400 transition-colors" />
        </button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-heading font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              DANIŞAN DOSYASI #{client.id}
            </span>
            <span className="px-2.5 py-0.5 bg-slate-950/80 border border-slate-800/80 text-slate-300 text-[11px] font-semibold rounded-full flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              Kalan: <strong className="text-white font-mono">{client.package_days_left || 90}</strong> Gün
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-black tracking-tight text-white drop-shadow-sm">
            {client.first_name} {client.last_name}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-4 py-2.5 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 font-heading font-extrabold text-xs rounded-xl border border-slate-800/80 hover:border-slate-700 flex items-center gap-2 transition-all duration-300 shadow-inner hover:scale-[1.02] active:scale-[0.98]">
          <MessageSquare className="w-4 h-4 text-orange-400" />
          <span>Mesaj Gönder</span>
        </button>
        <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black text-xs rounded-xl flex items-center gap-2 shadow-[0_0_25px_rgba(249,115,22,0.35)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          <Sparkles className="w-4 h-4" />
          <span>Programı Güncelle</span>
        </button>
      </div>
    </div>
  );
}