"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Percent, Flame, Activity, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightChart({ onOpenModal, userId, refreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rawHistory, setRawHistory] = useState([]);

  const getEffectiveUserId = useCallback(() => {
    if (userId && !isNaN(Number(userId))) return Number(userId);

    if (typeof window !== 'undefined') {
      const directId = localStorage.getItem('user_id') || localStorage.getItem('userId') || localStorage.getItem('client_id');
      if (directId && !isNaN(Number(directId))) return Number(directId);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.id || parsed.user_id || parsed.client_id)) {
            return Number(parsed.id || parsed.user_id || parsed.client_id);
          }
        } catch (e) {
          console.error("User object parse hatası:", e);
        }
      }
    }
    return 3; 
  }, [userId]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const targetUserId = getEffectiveUserId();
      let response = await fetch(`http://localhost:8000/api/user/${targetUserId}/analysis/history`);
      
      if (!response.ok) {
        response = await fetch(`/api/user/${targetUserId}/analysis/history`);
      }

      if (response.ok) {
        const data = await response.json();
        setRawHistory(Array.isArray(data) ? data : []);
      } else {
        setRawHistory([]);
      }
    } catch (error) {
      console.error("Geçmiş veriler alınırken hata oluştu:", error);
      setRawHistory([]);
    } finally {
      setLoading(false);
    }
  }, [getEffectiveUserId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  const turkishMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const now = new Date();
  const last6Months = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      monthName: turkishMonths[d.getMonth()],
      monthIndex: d.getMonth(),
      year: d.getFullYear()
    });
  }

  const chartData = last6Months.map(m => {
    const matchingEntries = rawHistory.filter(item => {
      if (item.measured_at) {
        const itemDate = new Date(item.measured_at);
        if (!isNaN(itemDate.getTime())) {
          return itemDate.getMonth() === m.monthIndex;
        }
      }
      if (item.name) {
        return item.name.trim().toLowerCase() === m.monthName.toLowerCase();
      }
      return false;
    });

    const found = matchingEntries.length > 0 ? matchingEntries[matchingEntries.length - 1] : null;

    if (found) {
      const kiloVal = found.kilo ?? found.weight ?? null;
      const yagVal = found.yag ?? found.body_fat ?? null;
      const lbmVal = found.lbm ?? null;

      return {
        name: m.monthName,
        kilo: kiloVal !== null ? Number(kiloVal) : null,
        yag: yagVal !== null ? Number(yagVal) : null,
        lbm: lbmVal !== null ? Number(lbmVal) : null
      };
    } else {
      return {
        name: m.monthName,
        kilo: null,
        yag: null,
        lbm: null
      };
    }
  });

  const latestData = rawHistory.length > 0 ? rawHistory[rawHistory.length - 1] : null;

  const getYDomain = (dataKey) => {
    const validValues = chartData.map(d => d[dataKey]).filter(v => v !== null && !isNaN(v));
    if (validValues.length === 0) return [0, 100];
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    if (min === max) {
      return [Math.max(0, Math.floor(min - 10)), Math.ceil(max + 10)];
    }
    return [Math.max(0, Math.floor(min * 0.85)), Math.ceil(max * 1.15)];
  };

  return (
    <div className="bg-[#0D2017]/85 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 hover:border-emerald-400/50 shadow-[0_15px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> 
            Form & Vücut Analiz Trendi
          </h3>
          <p className="text-[11px] text-emerald-200/70 font-medium mt-0.5">
            Zaman içerisindeki gelişim ve değişim grafikleriniz (Son 6 Ay - Neon DB Live)
          </p>
        </div>
        <button 
          onClick={onOpenModal}
          className="text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 border border-amber-300/40 flex items-center gap-1.5 cursor-pointer"
        >
          Ölçüm Güncelle
        </button>
      </div>

      {/* Tab Bar - Koyu Kehribar/Siyah Zemin */}
      <div className="flex bg-[#07130D] p-1.5 rounded-2xl border border-emerald-500/20 w-fit gap-1 flex-wrap sm:flex-nowrap">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all duration-300 ${
            activeTab === 'all' 
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.6)]' 
              : 'text-emerald-200/60 hover:text-white'
          }`}
        >
          Genel Bakış
        </button>
        <button 
          onClick={() => setActiveTab('kilo')}
          className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all duration-300 ${
            activeTab === 'kilo' 
              ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.6)]' 
              : 'text-emerald-200/60 hover:text-white'
          }`}
        >
          Kilo (kg)
        </button>
        <button 
          onClick={() => setActiveTab('yag')}
          className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all duration-300 ${
            activeTab === 'yag' 
              ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
              : 'text-emerald-200/60 hover:text-white'
          }`}
        >
          Yağ Oranı (%)
        </button>
        <button 
          onClick={() => setActiveTab('lbm')}
          className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all duration-300 ${
            activeTab === 'lbm' 
              ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]' 
              : 'text-emerald-200/60 hover:text-white'
          }`}
        >
          Kas/Yağsız Kütle (LBM)
        </button>
      </div>

      {/* Grafik Alanı */}
      <div className="h-60 w-full relative pt-2">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#07130D]/90 backdrop-blur-md z-10 gap-2 text-xs text-emerald-300 font-bold rounded-2xl border border-emerald-500/30">
            <Loader2 className="animate-spin text-emerald-400" size={20} /> Veriler yükleniyor...
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorKilo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorYag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLbm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16, 185, 129, 0.15)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A7F3D0', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis 
              tick={{ fontSize: 11, fill: '#A7F3D0', fontWeight: 700 }} 
              axisLine={false} 
              tickLine={false} 
              domain={activeTab === 'yag' ? getYDomain('yag') : getYDomain('kilo')} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#07130D', 
                borderRadius: '16px', 
                border: '1px solid rgba(16, 185, 129, 0.4)', 
                fontSize: '12px', 
                color: '#fff',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8)' 
              }} 
            />
            
            {(activeTab === 'all' || activeTab === 'kilo') && (
              <Area 
                type="monotone" 
                dataKey="kilo" 
                name="Kilo (kg)" 
                stroke="#10B981" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#colorKilo)" 
                dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#07130D' }} 
                activeDot={{ r: 8, fill: '#34D399', strokeWidth: 3, stroke: '#fff' }} 
                isAnimationActive={false}
                connectNulls
              />
            )}
            {(activeTab === 'all' || activeTab === 'yag') && (
              <Area 
                type="monotone" 
                dataKey="yag" 
                name="Yağ Oranı (%)" 
                stroke="#F59E0B" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#colorYag)" 
                dot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#07130D' }} 
                activeDot={{ r: 8, fill: '#FBBF24', strokeWidth: 3, stroke: '#fff' }} 
                isAnimationActive={false}
                connectNulls
              />
            )}
            {(activeTab === 'all' || activeTab === 'lbm') && (
              <Area 
                type="monotone" 
                dataKey="lbm" 
                name="Yağsız Kütle (kg)" 
                stroke="#F97316" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#colorLbm)" 
                dot={{ r: 6, fill: '#F97316', strokeWidth: 2, stroke: '#07130D' }} 
                activeDot={{ r: 8, fill: '#FB923C', strokeWidth: 3, stroke: '#fff' }} 
                isAnimationActive={false}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alt Bölüm: Neon Kartlar (Koyu Kehribar & Zümrüt Zeminler) */}
      <div className="grid grid-cols-3 gap-3 border-t border-emerald-500/20 pt-5">
        <div className="bg-[#071D14] p-3.5 rounded-2xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="text-[10px] text-emerald-300 font-extrabold flex items-center gap-1 mb-1">
            <Activity size={13} className="text-emerald-400" /> Son Kilo
          </span>
          <span className="text-base font-black text-white">
            {latestData && (latestData.kilo ?? latestData.weight) !== undefined ? (latestData.kilo ?? latestData.weight) : '--'} <span className="text-xs font-bold text-emerald-300/70">kg</span>
          </span>
        </div>

        <div className="bg-[#1C160C] p-3.5 rounded-2xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1 mb-1">
            <Percent size={13} className="text-amber-400" /> Yağ Oranı
          </span>
          <span className="text-base font-black text-white">
            {latestData && (latestData.yag ?? latestData.body_fat) !== undefined ? `%${latestData.yag ?? latestData.body_fat}` : '--'}
          </span>
        </div>

        <div className="bg-[#201309] p-3.5 rounded-2xl border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
          <span className="text-[10px] text-orange-300 font-extrabold flex items-center gap-1 mb-1">
            <Flame size={13} className="text-orange-400" /> Yağsız Kütle
          </span>
          <span className="text-base font-black text-white">
            {latestData && latestData.lbm !== undefined ? `${latestData.lbm} kg` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}