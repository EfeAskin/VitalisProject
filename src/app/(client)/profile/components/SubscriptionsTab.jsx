"use client";

import React from "react";
import { CreditCard, Award, CheckCircle2, ChevronRight } from "lucide-react";

export default function SubscriptionsTab() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-xl font-black text-white">Abonelikler & Hizmet Paketleri</h3>
        <p className="text-xs text-slate-400 mt-1">Aktif kişisel antrenör ve diyetisyen paketlerinizi görüntüleyin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Aktif Diyetisyen Paketi */}
        <div className="bg-slate-950 border border-emerald-500/30 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                AKTİF DİYETİSYEN PAKETİ
              </span>
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-lg font-black text-white">VIP Klinik Beslenme</h4>
            <p className="text-xs text-slate-400 mt-1">Dyt. Elif Yılmaz ile haftalık reçete güncellemeleri</p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold">Kalan Süre: 18 Gün</span>
            <button className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              Yenile <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Aktif Personal Trainer Paketi */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                TANIMSIZ PT PAKETİ
              </span>
              <CreditCard className="w-5 h-5 text-slate-500" />
            </div>
            <h4 className="text-lg font-black text-white">Birebir Koçluk Kirala</h4>
            <p className="text-xs text-slate-400 mt-1">Pazaryerindeki uzman antrenörleri inceleyin.</p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button 
              onClick={() => window.location.href = "/dashboard/marketplace"}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              PAZARYERİNE GİT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}