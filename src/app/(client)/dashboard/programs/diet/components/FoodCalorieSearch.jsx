"use client";

import React from "react";
import { Search } from "lucide-react";

export default function FoodCalorieSearch({ searchQuery, setSearchQuery, filteredFoods }) {
  return (
    <div className="bg-purple-950/25 border border-purple-500/40 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(168,85,247,0.18)] hover:border-purple-400/70 hover:shadow-[0_0_45px_rgba(168,85,247,0.3)] transition-all duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-purple-300 bg-purple-500/20 px-3.5 py-1.5 rounded-full border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)] backdrop-blur-md">
            MİKRO & MAKRO SORGULAMA
          </span>
          <h4 className="text-xl font-black text-white mt-3 flex items-center gap-2.5 tracking-wide">
            <Search className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            1 Porsiyon Kalori Öğren
          </h4>
          <p className="text-xs text-purple-100/70 mt-1 font-medium">
            Tüketmeyi planladığın veya merak ettiğin yiyeceklerin 1 porsiyonluk kalori ve makro değerlerini anında görüntüle.
          </p>
        </div>

        {/* Arama İnputu */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-purple-400/70 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yemek veya besin adı yazın (örn: Somon, Tavuk...)"
            className="w-full bg-[#11142D] border border-purple-500/30 text-white placeholder-purple-300/40 text-xs pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all shadow-inner font-medium"
          />
        </div>
      </div>

      {/* Besin Arama Sonuçları Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food, i) => (
            <div key={i} className="bg-[#11142D]/80 border border-purple-500/25 p-4.5 rounded-2xl hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all duration-300 group backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-extrabold text-purple-200/80 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  {food.category}
                </span>
                <span className="text-xs font-black text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  {food.kcal} kcal
                </span>
              </div>
              <h5 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors tracking-wide">{food.name}</h5>
              <p className="text-[11px] text-purple-200/60 mt-0.5 font-medium">{food.portion}</p>

              <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-purple-500/20 text-center">
                <div className="bg-purple-950/40 p-1.5 rounded-xl border border-purple-500/10">
                  <span className="text-[9px] font-bold text-purple-300/70 block">PROT</span>
                  <span className="text-xs font-black text-white">{food.protein}</span>
                </div>
                <div className="bg-purple-950/40 p-1.5 rounded-xl border border-purple-500/10">
                  <span className="text-[9px] font-bold text-purple-300/70 block">KARB</span>
                  <span className="text-xs font-black text-white">{food.carb}</span>
                </div>
                <div className="bg-purple-950/40 p-1.5 rounded-xl border border-purple-500/10">
                  <span className="text-[9px] font-bold text-purple-300/70 block">YAĞ</span>
                  <span className="text-xs font-black text-white">{food.fat}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-purple-200/60 text-xs bg-[#11142D]/40 rounded-2xl border border-purple-500/20 backdrop-blur-md">
            Aramanıza uygun besin bulunamadı. Diyetisyeninizden özel besin eklemesini isteyebilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}