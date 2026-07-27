"use client";
import React from 'react';
import { Search, Sparkles, SlidersHorizontal, UserCheck, Stethoscope, Dumbbell } from 'lucide-react';

export default function MarketplaceHeader({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  sortBy,
  setSortBy 
}) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 mb-8 space-y-6">
      
      {/* Üst Başlık & Slogan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#0A3A25]/5 border border-[#0A3A25]/10 px-3 py-1 rounded-full mb-2">
            <Sparkles size={12} className="text-[#C5A880] fill-[#C5A880]" />
            <span className="text-[10px] font-extrabold text-[#0A3A25] uppercase tracking-wider">Vitalis Premium Market</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace & Uzman Keşfi</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sertifikalı antrenörler, uzman diyetisyenler ve onaylı supplement ürünleri tek çatıda.
          </p>
        </div>

        {/* Sıralama Seçeneği */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#10B981] transition-all cursor-pointer"
          >
            <option value="popular">En Popülerler</option>
            <option value="rating">En Yüksek Puanlı</option>
            <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
          </select>
        </div>
      </div>

      {/* Kategori Switcher (Tab Bar) */}
      <div className="flex flex-wrap bg-slate-100/80 p-1.5 rounded-2xl gap-1">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'all' 
              ? 'bg-[#0A3A25] text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sparkles size={13} className={activeTab === 'all' ? 'text-[#C5A880]' : ''} />
          <span>Tümü</span>
        </button>

        <button 
          onClick={() => setActiveTab('trainer')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'trainer' 
              ? 'bg-[#0A3A25] text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Dumbbell size={13} className={activeTab === 'trainer' ? 'text-[#10B981]' : ''} />
          <span>Antrenör Bul</span>
        </button>

        <button 
          onClick={() => setActiveTab('dietitian')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'dietitian' 
              ? 'bg-[#0A3A25] text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Stethoscope size={13} className={activeTab === 'dietitian' ? 'text-[#C5A880]' : ''} />
          <span>Diyetisyen Bul</span>
        </button>

        <button 
          onClick={() => setActiveTab('supplement')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'supplement' 
              ? 'bg-[#0A3A25] text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UserCheck size={13} className={activeTab === 'supplement' ? 'text-[#10B981]' : ''} />
          <span>Supplement & Ekipman</span>
        </button>
      </div>

      {/* Arama Barı */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Uzman ismi, uzmanlık alanı, marka veya supplement ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs outline-none focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 text-slate-800 placeholder-slate-400 transition-all font-medium"
        />
      </div>
    </div>
  );
}