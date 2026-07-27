"use client";
import React, { useState, useEffect } from 'react';
import { Droplets, RefreshCw, Plus, Settings, X, Check } from 'lucide-react';

export default function WaterTracker() {
  const [waterLevel, setWaterLevel] = useState(0.0);
  const [target, setTarget] = useState(2.5);
  const [loading, setLoading] = useState(true);

  // Modal ve Hedef Güncelleme State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarget, setNewTarget] = useState('2.5');
  const [isSaving, setIsSaving] = useState(false);

  // 1. Sayfa açıldığında Neon DB'den bugünkü su verisini çek
  useEffect(() => {
    async function fetchWaterData() {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/water/today', {
          method: 'GET',
          credentials: 'include',
          headers: headers,
        });

        if (res.ok) {
          const data = await res.json();
          const fetchedConsumed = Number(data.water_consumed || 0.0);
          const fetchedTarget = Number(data.water_target || 2.5);

          setWaterLevel(fetchedConsumed);
          setTarget(fetchedTarget);
          setNewTarget(fetchedTarget.toString());
        }
      } catch (err) {
        console.error("Su verisi Neon DB'den çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWaterData();
  }, []);

  // 2. Su Ekleme ve Neon DB'ye Yazma
  const addWater = async (amount) => {
    const updatedValue = Math.min(Number((waterLevel + amount).toFixed(2)), 10.0);
    setWaterLevel(updatedValue); // Arayüzü anında güncelle

    try {
      const token = localStorage.getItem("access_token");
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/water/update', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({ amount: updatedValue })
      });

      if (res.ok) {
        const data = await res.json();
        setWaterLevel(Number(data.water_consumed));
        setTarget(Number(data.water_target));
      }
    } catch (err) {
      console.error("Su miktarı Neon DB'ye kaydedilemedi:", err);
    }
  };

  // 3. Sıfırlama
  const handleReset = async () => {
    setWaterLevel(0.0);

    try {
      const token = localStorage.getItem("access_token");
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/water/reset', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
      });
    } catch (err) {
      console.error("Su sıfırlama hatası:", err);
    }
  };

  // 4. Yeni Hedef Kaydetme (Backend Entegrasyonu)
  const handleSaveTarget = async (e) => {
    e.preventDefault();
    const parsedTarget = parseFloat(newTarget);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/water/set-target', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({ target: parsedTarget })
      });

      if (res.ok) {
        const data = await res.json();
        setTarget(Number(data.water_target));
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Su hedefi güncellenemedi:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const percentage = Math.min((waterLevel / target) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 transition-all hover:shadow-md relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Droplets size={14} className="text-[#0284C7] animate-pulse" /> Su Tüketimi
        </h3>

        {/* Sağ Üst İkon Buton Grubu */}
        <div className="flex items-center gap-1">
          {/* ⭐ İstedigin Damla + Çark Birleşik İkonu (Hedef Düzenleme) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-slate-400 hover:text-[#0284C7] transition-colors p-1.5 rounded-lg hover:bg-sky-50 relative group"
            title="Su Hedefini Değiştir"
          >
            <div className="relative flex items-center justify-center">
              <Droplets size={14} className="text-slate-400 group-hover:text-[#0284C7] transition-colors" />
              <Settings 
                size={9} 
                className="absolute -bottom-1 -right-1 text-slate-500 group-hover:text-[#0284C7] bg-white rounded-full p-[0.5px] border border-slate-200/80 transition-colors" 
              />
            </div>
          </button>

          {/* Sıfırlama Butonu */}
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50/50"
            title="Sıfırla"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Bardak Tasarımı */}
      <div className="relative h-28 bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden flex flex-col justify-center items-center">
        <div className="relative z-10 text-center">
          <span className={`text-3xl font-black tracking-tight transition-colors duration-350 ${percentage >= 100 ? 'text-[#C5A880]' : 'text-[#0284C7]'}`}>
            {waterLevel.toFixed(2)}L
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Hedef: {target} Litre</span>
        </div>
        
        {/* Dalga / Su Seviyesi Arka Planı */}
        <div 
          className={`absolute bottom-0 left-0 w-full transition-all duration-500 ease-out 
            ${percentage >= 100 
              ? 'bg-gradient-to-t from-[#C5A880]/20 to-[#C5A880]/10' 
              : 'bg-gradient-to-t from-[#0284C7]/20 to-[#38BDF8]/10' 
            }`} 
          style={{ height: `${percentage}%` }}
        >
          {percentage > 0 && (
            <div className={`absolute top-0 left-0 right-0 h-1 animate-pulse 
              ${percentage >= 100 ? 'bg-[#C5A880]/30' : 'bg-[#38BDF8]/30'}`} 
            />
          )}
        </div>

        {/* Hedef Tamamlandı Rozeti */}
        {percentage >= 100 && (
          <div className="absolute top-2 right-2 bg-[#C5A880]/10 text-[#C5A880] text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-[#C5A880]/20">
            HEDEF TAMAM
          </div>
        )}
      </div>

      {/* Hızlı Ekleme Buton Grubu */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button 
          onClick={() => addWater(0.25)}
          className="flex items-center justify-center gap-0.5 text-[10px] bg-sky-50/60 hover:bg-sky-100/80 text-[#0284C7] font-bold py-2.5 rounded-xl transition-all"
        >
          <Plus size={10} />250ml
        </button>
        <button 
          onClick={() => addWater(0.50)}
          className="flex items-center justify-center gap-0.5 text-[10px] bg-sky-50/60 hover:bg-sky-100/80 text-[#0284C7] font-bold py-2.5 rounded-xl transition-all"
        >
          <Plus size={10} />500ml
        </button>
        <button 
          onClick={() => addWater(0.75)}
          className="flex items-center justify-center gap-0.5 text-[10px] bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-[#0284C7]/15"
        >
          <Plus size={10} />750ml
        </button>
      </div>

      {/* ⭐ Hedef Değiştirme Mini Modalı (Pop-Up) */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl z-30 p-4 flex flex-col justify-center animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Droplets size={14} className="text-[#0284C7]" /> Su Hedefini Güncelle
            </span>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSaveTarget} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Yeni Günlük Hedef (Litre)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="8.0"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl outline-none focus:border-[#0284C7]"
                placeholder="Örn: 3.0"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-1/2 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-1/2 text-[10px] font-bold text-white bg-[#0284C7] hover:bg-[#0369a1] py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                {isSaving ? '...' : <><Check size={12} /> Kaydet</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}