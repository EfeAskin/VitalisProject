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
    <div className="bg-[#0E1B1B]/90 backdrop-blur-xl rounded-3xl p-5 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] transition-all duration-300 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
          <Droplets size={16} className="text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" /> Su Tüketimi
        </h3>

        {/* Sağ Üst İkon Buton Grubu */}
        <div className="flex items-center gap-1">
          {/* ⭐ İstedigin Damla + Çark Birleşik İkonu (Hedef Düzenleme) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-slate-400 hover:text-cyan-300 transition-all p-1.5 rounded-xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 relative group cursor-pointer"
            title="Su Hedefini Değiştir"
          >
            <div className="relative flex items-center justify-center">
              <Droplets size={15} className="text-slate-400 group-hover:text-cyan-300 transition-colors" />
              <Settings 
                size={9} 
                className="absolute -bottom-1 -right-1 text-slate-300 group-hover:text-cyan-300 bg-[#0E1B1B] rounded-full p-[0.5px] border border-cyan-500/40 transition-colors" 
              />
            </div>
          </button>

          {/* Sıfırlama Butonu */}
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-rose-400 transition-all p-1.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 cursor-pointer"
            title="Sıfırla"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Bardak Tasarımı */}
      <div className="relative h-28 bg-[#081212]/90 border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col justify-center items-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.7)]">
        <div className="relative z-10 text-center">
          <span className={`text-3xl font-black tracking-tight transition-colors duration-350 ${
            percentage >= 100 
              ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]' 
              : 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]'
          }`}>
            {waterLevel.toFixed(2)}L
          </span>
          <span className="text-[10px] text-cyan-200/70 block mt-0.5 font-bold tracking-wide">
            Hedef: {target} Litre
          </span>
        </div>
        
        {/* Dalga / Su Seviyesi Arka Planı */}
        <div 
          className={`absolute bottom-0 left-0 w-full transition-all duration-500 ease-out 
            ${percentage >= 100 
              ? 'bg-gradient-to-t from-amber-500/40 via-amber-400/20 to-amber-300/10' 
              : 'bg-gradient-to-t from-cyan-600/40 via-cyan-500/25 to-sky-400/15' 
            }`} 
          style={{ height: `${percentage}%` }}
        >
          {percentage > 0 && (
            <div className={`absolute top-0 left-0 right-0 h-1 animate-pulse 
              ${percentage >= 100 ? 'bg-amber-400 shadow-[0_0_10px_#F59E0B]' : 'bg-cyan-400 shadow-[0_0_10px_#06B6D4]'}`} 
            />
          )}
        </div>

        {/* Hedef Tamamlandı Rozeti */}
        {percentage >= 100 && (
          <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
            HEDEF TAMAM
          </div>
        )}
      </div>

      {/* Hızlı Ekleme Buton Grubu */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button 
          onClick={() => addWater(0.25)}
          className="flex items-center justify-center gap-1 text-[10px] bg-[#081212] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 font-extrabold py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <Plus size={11} />250ml
        </button>
        <button 
          onClick={() => addWater(0.50)}
          className="flex items-center justify-center gap-1 text-[10px] bg-[#081212] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 font-extrabold py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <Plus size={11} />500ml
        </button>
        <button 
          onClick={() => addWater(0.75)}
          className="flex items-center justify-center gap-1 text-[10px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer"
        >
          <Plus size={11} />750ml
        </button>
      </div>

      {/* ⭐ Hedef Değiştirme Mini Modalı (Pop-Up) */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-[#0E1B1B]/95 backdrop-blur-md rounded-2xl z-30 p-4 flex flex-col justify-center border border-cyan-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5 tracking-wide">
              <Droplets size={14} className="text-cyan-400" /> Su Hedefini Güncelle
            </span>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSaveTarget} className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold text-cyan-200/70 block mb-1 uppercase tracking-wider">
                Yeni Günlük Hedef (Litre)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="8.0"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-[#081212] border border-cyan-500/40 text-white font-bold text-xs px-3 py-2 rounded-xl outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder-slate-500 transition-all"
                placeholder="Örn: 3.0"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-1/2 text-[10px] font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 py-2 rounded-xl border border-slate-600/40 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-1/2 text-[10px] font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1 cursor-pointer"
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