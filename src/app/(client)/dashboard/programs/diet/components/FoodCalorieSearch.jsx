"use client";

import React from "react";
import { Search } from "lucide-react";

export default function FoodCalorieSearch({ searchQuery, setSearchQuery, filteredFoods }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            MİKRO & MAKRO SORGULAMA
          </span>
          <h4 className="text-xl font-black text-white mt-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            1 Porsiyon Kalori Öğren
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Tüketmeyi planladığın veya merak ettiğin yiyeceklerin 1 porsiyonluk kalori ve makro değerlerini anında görüntüle.
          </p>
        </div>

        {/* Arama İnputu */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yemek veya besin adı yazın (örn: Somon, Tavuk...)"
            className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Besin Arama Sonuçları Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl hover:border-blue-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {food.category}
                </span>
                <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                  {food.kcal} kcal
                </span>
              </div>
              <h5 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">{food.name}</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">{food.portion}</p>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-900 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block">PROT</span>
                  <span className="text-xs font-black text-slate-200">{food.protein}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block">KARB</span>
                  <span className="text-xs font-black text-slate-200">{food.carb}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block">YAĞ</span>
                  <span className="text-xs font-black text-slate-200">{food.fat}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            Aramanıza uygun besin bulunamadı. Diyetisyeninizden özel besin eklemesini isteyebilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}
