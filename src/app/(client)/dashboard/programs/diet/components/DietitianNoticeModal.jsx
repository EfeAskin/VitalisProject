"use client";

import React from "react";
import { Award, CheckCircle2 } from "lucide-react";

export default function DietitianNoticeModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-emerald-500/30 max-w-md w-full p-6 rounded-3xl space-y-4 relative animate-scaleUp">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mx-auto">
          <Award className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black text-white">Diyetisyen Modülü & Reçete Onayı</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Vitalis-OS Pazaryeri üzerinden uzman diyetisyenlerle birebir anlaşarak kan tahlillerinize göre %100 özelleştirilmiş beslenme programı alabilirsiniz.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Birebir Whatsapp & Sesli Görüşme
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Haftalık Reçete Güncellemesi
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Supplement & Makro İncelemesi
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            KAPAT
          </button>
          <button 
            onClick={() => {
              onClose();
              window.location.href = "/dashboard/marketplace";
            }}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            PAZARYERİNE GİT
          </button>
        </div>
      </div>
    </div>
  );
}