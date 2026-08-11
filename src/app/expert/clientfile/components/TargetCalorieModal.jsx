"use client";

import React from "react";
import { Flame, X } from "lucide-react";

export default function TargetCalorieModal({
  isOpen,
  onClose,
  targetCalorieInput,
  setTargetCalorieInput,
  client,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Günlük Kalori Hedefini Değiştir
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Sistemin otomatik hesapladığı form koruma değeri:{" "}
          <strong className="text-white">
            {client.daily_calories || 2863} kcal
          </strong>
        </p>
        <input
          type="number"
          value={targetCalorieInput}
          onChange={(e) => setTargetCalorieInput(e.target.value)}
          placeholder="Yeni Günlük Kalori (Örn: 2400)"
          className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-amber-500"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}