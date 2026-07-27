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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all hover:shadow-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10B981]" /> Form & Vücut Analiz Trendi
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Zaman içerisindeki gelişim ve değişim grafikleriniz (Son 6 Ay - Neon DB Live)</p>
        </div>
        <button 
          onClick={onOpenModal}
          className="text-xs bg-[#0A3A25] hover:bg-[#10B981] text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-[#C5A880]/20 flex items-center gap-1.5"
        >
          Ölçüm Güncelle
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'all' 
              ? 'bg-[#0A3A25] text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Genel Bakış
        </button>
        <button 
          onClick={() => setActiveTab('kilo')}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'kilo' 
              ? 'bg-[#10B981] text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Kilo (kg)
        </button>
        <button 
          onClick={() => setActiveTab('yag')}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'yag' 
              ? 'bg-[#C5A880] text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Yağ Oranı (%)
        </button>
        <button 
          onClick={() => setActiveTab('lbm')}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            activeTab === 'lbm' 
              ? 'bg-[#2563eb] text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Kas/Yağsız Kütle (LBM)
        </button>
      </div>

      {/* Grafik Alanı */}
      <div className="h-56 w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 gap-2 text-xs text-slate-500 font-semibold rounded-xl">
            <Loader2 className="animate-spin text-[#10B981]" size={18} /> Veriler yükleniyor...
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorKilo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorYag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A880" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C5A880" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLbm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              axisLine={false} 
              tickLine={false} 
              domain={activeTab === 'yag' ? getYDomain('yag') : getYDomain('kilo')} 
            />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            
            {(activeTab === 'all' || activeTab === 'kilo') && (
              <Area 
                type="monotone" 
                dataKey="kilo" 
                name="Kilo (kg)" 
                stroke="#10B981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorKilo)" 
                dot={{ r: 7, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 9 }} 
                isAnimationActive={false}
                connectNulls
              />
            )}
            {(activeTab === 'all' || activeTab === 'yag') && (
              <Area 
                type="monotone" 
                dataKey="yag" 
                name="Yağ Oranı (%)" 
                stroke="#C5A880" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorYag)" 
                dot={{ r: 7, fill: '#C5A880', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 9 }} 
                isAnimationActive={false}
                connectNulls
              />
            )}
            {(activeTab === 'all' || activeTab === 'lbm') && (
              <Area 
                type="monotone" 
                dataKey="lbm" 
                name="Yağsız Kütle (kg)" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorLbm)" 
                dot={{ r: 7, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 9 }} 
                isAnimationActive={false}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alt Bölüm: Son Ölçüm İndikatör Kartları */}
      <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
        <div className="bg-[#10B981]/5 p-3 rounded-xl border border-[#10B981]/10">
          <span className="text-[9px] text-[#0A5C36] font-bold flex items-center gap-1 mb-1">
            <Activity size={12} /> Son Kilo
          </span>
          <span className="text-sm font-black text-slate-800">
            {latestData && (latestData.kilo ?? latestData.weight) !== undefined ? (latestData.kilo ?? latestData.weight) : '--'} <span className="text-[10px] font-normal text-slate-500">kg</span>
          </span>
        </div>

        <div className="bg-[#C5A880]/10 p-3 rounded-xl border border-[#C5A880]/20">
          <span className="text-[9px] text-[#8C724D] font-bold flex items-center gap-1 mb-1">
            <Percent size={12} /> Yağ Oranı
          </span>
          <span className="text-sm font-black text-slate-800">
            {latestData && (latestData.yag ?? latestData.body_fat) !== undefined ? `%${latestData.yag ?? latestData.body_fat}` : '--'}
          </span>
        </div>

        <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100">
          <span className="text-[9px] text-blue-600 font-bold flex items-center gap-1 mb-1">
            <Flame size={12} /> Yağsız Kütle
          </span>
          <span className="text-sm font-black text-slate-800">
            {latestData && latestData.lbm !== undefined ? `${latestData.lbm} kg` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}