"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  Activity, 
  Users, 
  Award, 
  Heart, 
  CheckCircle2,
  Globe,
  Lock
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ active_members: 1250, expert_count: 50, system_uptime: "%99.9" });

  // Canlı istatistikleri Neon DB'den çekme


  // Bülten Abonelik İşlemi
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/platform/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Tebrikler! VIP bültenimize başarıyla katıldınız.' });
        setEmail('');
      } else {
        setStatusMsg({ type: 'error', text: data.detail || 'Bir hata oluştu.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Sunucuyla bağlantı kurulamadı.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#1c1815] text-slate-300 border-t border-[#C5A880]/40 pt-16 pb-12 pt-20 relative overflow-hidden font-sans">
      
      {/* Arka plan lüks ışık efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#C5A880]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Üst Kısım: Canlı İstatistik Barı */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center border border-[#C5A880]/20">
              <Users size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{stats.active_members}+</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif Üye</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center border border-[#C5A880]/20">
              <Award size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{stats.expert_count}+</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sertifikalı Uzman & Diyetisyen</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center border border-[#C5A880]/20">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{stats.system_uptime}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kesintisiz Sistem Çalışma Oranı</p>
            </div>
          </div>
        </div>

        {/* Ana Footer İçerik Izgarası */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Kolon 1 & 2: Marka ve Misyon */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Vitalis-OS" className="w-10 h-10 object-contain" />
              <div className="flex items-center font-black text-xl tracking-wider">
                <span className="text-white">VITALIS</span>
                <span className="text-[#C5A880] font-light">-OS</span>
              </div>
              <span className="bg-[#C5A880]/10 text-[#C5A880] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-widest border border-[#C5A880]/20">
                ENTERPRISE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Yapay zeka destekli biyometrik analizler, profesyonel antrenör ve diyetisyen ağlarıyla donatılmış yeni nesil elit sağlık ve performans işletim sistemi.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <ShieldCheck size={16} className="text-[#C5A880]" /> 256-bit SSL Güvenli Altyapı
              <span className="text-slate-700">•</span>
              <Lock size={14} className="text-[#C5A880]" /> KVKK Uyumlu
            </div>
          </div>

          {/* Kolon 3: Hızlı Bağlantılar */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="/dashboard" className="hover:text-[#C5A880] transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/programs" className="hover:text-[#C5A880] transition-colors">Programlarım (Hub)</Link></li>
              <li><Link href="/dashboard/marketplace" className="hover:text-[#C5A880] transition-colors">Marketplace & Uzmanlar</Link></li>
              <li><Link href="/expert/dashboard" className="hover:text-[#C5A880] transition-colors">Uzman Paneli</Link></li>
            </ul>
          </div>

          {/* Kolon 4: Destek & Kurumsal */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
              Kurumsal
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="#" className="hover:text-[#C5A880] transition-colors">Hakkımızda</Link></li>
              <li><Link href="#" className="hover:text-[#C5A880] transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="#" className="hover:text-[#C5A880] transition-colors">Kullanım Şartları</Link></li>
              <li><Link href="#" className="hover:text-[#C5A880] transition-colors">İletişim & Destek</Link></li>
            </ul>
          </div>

          {/* Kolon 5: Bülten / Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
              VIP Bülten
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Bilimsel beslenme ipuçları ve antrenman stratejileri doğrudan e-postanıza gelsin.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="E-posta adresiniz..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs px-4 py-3 rounded-xl outline-none focus:border-[#C5A880] transition-colors pr-10"
                />
                <button type="submit" disabled={isSubmitting} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C5A880] hover:text-white p-1.5 transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>

              {statusMsg && (
                <p className={`text-[10px] font-bold ${statusMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {statusMsg.text}
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Alt Kısım: Telif ve Sosyal Haklar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 VITALIS-OS. Tüm hakları saklıdır. Performans Yönetim Sistemi.</p>
          
          <div className="flex items-center gap-6 font-medium">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe size={13} className="text-[#C5A880]" /> Türkçe (TR)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              Designed with <Heart size={12} className="text-rose-500 fill-rose-500" /> for Peak Performance
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}