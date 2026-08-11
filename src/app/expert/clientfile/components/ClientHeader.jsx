"use client";

import React from "react";
import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";

export default function ClientHeader({ client, onBack }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#EA580C] uppercase bg-[#EA580C]/10 px-2.5 py-0.5 rounded-md border border-[#EA580C]/20">
              DANIŞAN DOSYASI #{client.id}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              • Kalan: {client.package_days_left || 90} Gün
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            {client.first_name} {client.last_name}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-2 transition-all">
          <MessageSquare className="w-4 h-4 text-[#EA580C]" />
          <span>Mesaj Gönder</span>
        </button>
        <button className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-[#EA580C]/20 transition-all">
          <Sparkles className="w-4 h-4" />
          <span>Programı Güncelle</span>
        </button>
      </div>
    </div>
  );
}