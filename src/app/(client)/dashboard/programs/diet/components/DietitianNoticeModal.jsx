"use client";

import React from "react";
import { Award, CheckCircle2 } from "lucide-react";

export default function DietitianNoticeModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11142D]/60 backdrop-blur-xl p-4">
      {/* Modal Box */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 max-w-md w-full p-8 rounded-[2rem] space-y-6 relative backdrop-blur-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in duration-300">
        
        {/* Icon Header */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mx-auto shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <Award className="w-10 h-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white tracking-wide">Diyetisyen Modülü & Reçete Onayı</h3>
          <p className="text-sm text-emerald-100/70 leading-relaxed font-medium">
            Vitalis-OS Pazaryeri üzerinden uzman diyetisyenlerle birebir anlaşarak kan tahlillerinize göre %100 özelleştirilmiş beslenme programı alabilirsiniz.
          </p>
        </div>

        {/* Feature List */}
        <div className="bg-[#11142D]/50 p-5 rounded-2xl border border-emerald-500/20 text-xs space-y-3 shadow-inner">
          <div className="flex items-center gap-3 text-emerald-300 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Birebir Whatsapp & Sesli Görüşme
          </div>
          <div className="flex items-center gap-3 text-emerald-300 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Haftalık Reçete Güncellemesi
          </div>
          <div className="flex items-center gap-3 text-emerald-300 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Supplement & Makro İncelemesi
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-[#11142D] hover:bg-emerald-950/50 border border-emerald-500/20 text-emerald-200 font-black rounded-2xl text-xs transition-all duration-300"
          >
            KAPAT
          </button>
          <button 
            onClick={() => {
              onClose();
              window.location.href = "/dashboard/marketplace";
            }}
            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-xs transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95"
          >
            PAZARYERİNE GİT
          </button>
        </div>
      </div>
    </div>
  );
}