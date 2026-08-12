"use client";

import React from "react";
import { Target, X, Info, Scale } from "lucide-react";

export default function TargetWeightModal({
  isOpen,
  onClose,
  targetWeightInput,
  setTargetWeightInput,
  client = {},
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#131738]/95 border border-slate-700/80 rounded-3xl p-6 md:p-7 w-full max-w-md space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative animate-in zoom-in-95 duration-150">
        
        {/* Üst Başlık & Kapat Butonu */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-heading font-black text-white tracking-tight">
                Hedef Kilo Belirle
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Danışanın ideal ve hedef kilo değerlerini güncelleyin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-full transition-all cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* İdeal Kilo Bilgi Kartı */}
        <div className="bg-[#0B0D1B]/95 p-4 rounded-2xl border border-slate-800/90 space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Info size={14} className="text-orange-400 shrink-0" />
            <span>Sistem Hesaplamalı Bilgi:</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Scale size={13} className="text-slate-500" /> Tahmini İideal Kilo
            </span>
            <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              {client?.ideal_weight ? `${client.ideal_weight} kg` : "Ölçüm Yok"}
            </span>
          </div>
        </div>

        {/* Hedef Kilo Giriş Alanı */}
        <div className="space-y-2">
          <label className="text-xs font-heading font-bold text-slate-300 block">
            Yeni Hedef Kilo (kg)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              step="0.1"
              value={targetWeightInput}
              onChange={(e) => setTargetWeightInput(e.target.value)}
              placeholder="Örn: 76.5"
              className="w-full bg-[#0B0D1B]/95 border border-slate-800/90 text-white text-sm font-mono p-3.5 pr-12 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all placeholder:text-slate-600 shadow-inner"
            />
            <span className="absolute right-4 text-xs font-mono font-bold text-slate-500 pointer-events-none">
              kg
            </span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-heading font-bold rounded-xl border border-slate-800 transition-all duration-200 cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-heading font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 cursor-pointer"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}