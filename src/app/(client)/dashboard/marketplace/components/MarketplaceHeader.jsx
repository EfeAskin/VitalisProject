"use client";

import React from "react";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Stethoscope,
  Dumbbell,
  PackageCheck,
} from "lucide-react";

export default function MarketplaceHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="bg-gradient-to-b from-[#211D14] via-[#171713] to-[#10110F] rounded-3xl p-6 md:p-8 shadow-[0_0_45px_rgba(234,179,8,0.14)] border border-amber-400/30 mb-8 space-y-6 backdrop-blur-2xl relative overflow-hidden">

      {/* Premium Gold Ambient Glow */}
      <div className="absolute top-[-100px] right-[-80px] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-72 h-72 bg-yellow-500/7 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-72 h-32 bg-yellow-300/5 blur-3xl pointer-events-none" />

      {/* Üst Başlık */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>

          {/* Premium Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400/10 via-yellow-300/10 to-amber-500/10 border border-amber-400/30 px-3 py-1 rounded-full mb-2.5 shadow-[0_0_18px_rgba(234,179,8,0.18)]">
            <Sparkles
              size={12}
              className="text-amber-300 fill-amber-300 drop-shadow-[0_0_7px_rgba(251,191,36,0.75)]"
            />

            <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">
              Vitalis Premium Market
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]">
            Marketplace & Uzman Keşfi
          </h1>

          <p className="text-xs text-amber-100/65 font-medium mt-1">
            Sertifikalı antrenörler, uzman diyetisyenler ve onaylı supplement
            ürünleri tek çatıda.
          </p>
        </div>

        {/* Sıralama */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={14}
            className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0D0E0C]/85 border border-amber-400/25 rounded-xl px-3 py-2 text-xs font-bold text-amber-100 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <option value="popular" className="bg-[#171713] text-amber-100">
              En Popülerler
            </option>

            <option value="rating" className="bg-[#171713] text-amber-100">
              En Yüksek Puanlı
            </option>

            <option value="price_asc" className="bg-[#171713] text-amber-100">
              Fiyat: Düşükten Yükseğe
            </option>

            <option value="price_desc" className="bg-[#171713] text-amber-100">
              Fiyat: Yüksekten Düşüğe
            </option>
          </select>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap bg-[#0C0D0B]/90 p-1.5 rounded-2xl gap-1.5 border border-amber-400/15 shadow-inner relative z-10">

        {/* Tümü */}
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 min-w-[100px] py-2.5 px-3 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "all"
              ? "bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] text-[#17130A] shadow-[0_0_24px_rgba(245,158,11,0.42)] border border-yellow-200/50 font-black"
              : "text-amber-100/65 hover:text-amber-100 hover:bg-amber-400/8 font-bold border border-transparent"
          }`}
        >
          <Sparkles
            size={13}
            className={
              activeTab === "all"
                ? "text-[#17130A] fill-[#17130A]/20"
                : "text-amber-300"
            }
          />
          <span>Tümü</span>
        </button>

        {/* Antrenör */}
        <button
          onClick={() => setActiveTab("trainer")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "trainer"
              ? "bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] text-[#17130A] shadow-[0_0_24px_rgba(245,158,11,0.42)] border border-yellow-200/50 font-black"
              : "text-amber-100/65 hover:text-amber-100 hover:bg-amber-400/8 font-bold border border-transparent"
          }`}
        >
          <Dumbbell
            size={13}
            className={
              activeTab === "trainer"
                ? "text-[#17130A]"
                : "text-amber-300"
            }
          />
          <span>Antrenör Bul</span>
        </button>

        {/* Diyetisyen */}
        <button
          onClick={() => setActiveTab("dietitian")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "dietitian"
              ? "bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] text-[#17130A] shadow-[0_0_24px_rgba(245,158,11,0.42)] border border-yellow-200/50 font-black"
              : "text-amber-100/65 hover:text-amber-100 hover:bg-amber-400/8 font-bold border border-transparent"
          }`}
        >
          <Stethoscope
            size={13}
            className={
              activeTab === "dietitian"
                ? "text-[#17130A]"
                : "text-amber-300"
            }
          />
          <span>Diyetisyen Bul</span>
        </button>

        {/* Supplement */}
        <button
          onClick={() => setActiveTab("supplement")}
          className={`flex-1 min-w-[150px] py-2.5 px-3 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "supplement"
              ? "bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] text-[#17130A] shadow-[0_0_24px_rgba(245,158,11,0.42)] border border-yellow-200/50 font-black"
              : "text-amber-100/65 hover:text-amber-100 hover:bg-amber-400/8 font-bold border border-transparent"
          }`}
        >
          <PackageCheck
            size={13}
            className={
              activeTab === "supplement"
                ? "text-[#17130A]"
                : "text-amber-300"
            }
          />
          <span>Supplement & Ekipman</span>
        </button>
      </div>

      {/* Arama Barı */}
      <div className="relative z-10">
        <Search
          size={16}
          className="absolute left-4 top-3.5 text-amber-300/80 drop-shadow-[0_0_5px_rgba(251,191,36,0.45)]"
        />

        <input
          type="text"
          placeholder="Uzman ismi, uzmanlık alanı, marka veya supplement ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0C0D0B]/90 border border-amber-400/25 rounded-2xl text-xs outline-none focus:bg-[#14140F] focus:border-amber-300 focus:ring-2 focus:ring-amber-400/20 text-amber-50 placeholder-amber-200/35 transition-all font-medium shadow-[0_0_20px_rgba(0,0,0,0.35)]"
        />
      </div>
    </div>
  );
}