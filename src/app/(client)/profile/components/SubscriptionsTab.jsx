"use client";

import React from "react";
import { CreditCard, Award, CheckCircle2, ChevronRight } from "lucide-react";

export default function SubscriptionsTab() {
  return (
    <div className="bg-[#1A1816] border border-[#D4AF37]/30 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[120px] pointer-events-none"></div>

      <div className="border-b border-white/10 pb-4">
        <h3 className="text-xl font-black text-white tracking-wide">Abonelikler & Hizmet Paketleri</h3>
        <p className="text-[11px] font-medium text-white/60 tracking-[0.2em] mt-2 uppercase">Aktif kişisel antrenör ve diyetisyen paketlerinizi görüntüleyin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-[#221F1C] border border-[#D4AF37]/40 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative group hover:border-[#D4AF37] transition-all duration-500">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black tracking-[0.2em] text-[#D4AF37] bg-[#D4AF37]/10 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30 uppercase">
                AKTİF DİYETİSYEN PAKETİ
              </span>
              <div className="p-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-lg font-black text-white tracking-wide">VIP Klinik Beslenme</h4>
            <p className="text-xs text-white/60 mt-1 font-medium">Dyt. Elif Yılmaz ile haftalık reçete güncellemeleri</p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">Kalan Süre: <strong className="text-white">18 Gün</strong></span>
            <button className="text-[11px] font-bold text-[#D4AF37] hover:text-amber-300 transition-colors flex items-center gap-1 uppercase tracking-wider">
              Yenile <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-[#221F1C] border border-white/10 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-inner relative group hover:border-white/20 transition-all duration-500">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-black tracking-[0.2em] text-white/50 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 uppercase">
                TANIMSIZ PT PAKETİ
              </span>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/50">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-lg font-black text-white tracking-wide">Birebir Koçluk Kirala</h4>
            <p className="text-xs text-white/60 mt-1 font-medium">Pazaryerindeki uzman antrenörleri inceleyin.</p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={() => window.location.href = "/dashboard/marketplace"}
              className="w-full py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-black text-[10px] tracking-[0.2em] rounded-2xl transition-all border border-[#D4AF37] uppercase shadow-md shadow-amber-500/20"
            >
              PAZARYERİNE GİT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}