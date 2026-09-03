import React from 'react';
import { Users, TrendingUp, Star, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsGrid({ stats, role }) {
  const isTrainer = role === 'trainer';
  const themeColor = isTrainer ? 'text-[#EA580C]' : 'text-emerald-500';
  const themeBgHover = isTrainer ? 'hover:border-[#EA580C]/50' : 'hover:border-emerald-500/50';

  // Para birimi formatlayıcı
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Aktif Danışanlar */}
      <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 transition-all duration-300 ${themeBgHover} group relative overflow-hidden`}>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Aktif Danışan</p>
            <h3 className="text-3xl font-black text-white">{stats.activeClients}</h3>
          </div>
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Users size={20} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <TrendingUp size={14} />
          <span>Bu ay +{stats.newClients} yeni</span>
        </div>
      </div>

      {/* Bekleyen İncelemeler (Kaldırıldı, yerine Gelişim İstekleri/Hedefler konulabilir ama boş durmasın diye Portföy Uyumu eklendi) */}
      <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 transition-all duration-300 ${themeBgHover} group relative overflow-hidden`}>
        <div className={`absolute -right-6 -top-6 w-24 h-24 ${isTrainer ? 'bg-orange-500/10' : 'bg-emerald-500/10'} rounded-full blur-2xl transition-all`}></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Yeni İstekler</p>
            <h3 className="text-3xl font-black text-white">{stats.newClients}</h3>
          </div>
          <div className={`p-2.5 rounded-xl ${isTrainer ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Onay bekleyen katılımlar</span>
        </div>
      </div>

      {/* Uzman Puanı */}
      <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 transition-all duration-300 ${themeBgHover} group relative overflow-hidden`}>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Uzman Puanı</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-white">{stats.rating.toFixed(1)}</h3>
              <span className="text-slate-500 text-sm font-medium">/ 5.0</span>
            </div>
          </div>
          <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400">
            <Star size={20} className="fill-yellow-400/20" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Yakında aktif edilecek</span>
        </div>
      </div>

      {/* Aylık Kazanç */}
      <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 transition-all duration-300 ${themeBgHover} group relative overflow-hidden`}>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Aylık Kazanç</p>
            <h3 className="text-2xl font-black text-white truncate">{formatCurrency(stats.monthlyEarnings)}</h3>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
            <Wallet size={20} />
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${stats.earningsChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {stats.earningsChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>Geçen aya göre {Math.abs(stats.earningsChange)}% {stats.earningsChange >= 0 ? 'fazla' : 'az'}</span>
        </div>
      </div>
    </div>
  );
}