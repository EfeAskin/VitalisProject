"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import SetRole from '@/components/auth/SetRole';
import ClientLogin from '@/components/auth/ClientLogin';
import ClientRegister from '@/components/auth/ClientRegister';
import AdminLogin from '@/components/auth/AdminLogin';
import AdminRegister from '@/components/auth/AdminRegister';

export default function AuthPortal() {
  const router = useRouter();
  const [view, setView] = useState('set-role');

  // Sadece bu sayfadayken arayüz kaydırmasını (scroll) tamamen dondurur
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleAccess = () => {
    router.push('/dashboard');
  };

  return (
    <div 
      style={{ zoom: 1 }} 
      className="fixed inset-0 z-50 flex items-center justify-center font-sans select-none bg-slate-950 overflow-hidden"
    >
      
      {/* 1. SPOR & SAĞLIK TEMALI ARKA PLAN GÖRSELİ */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600')` 
        }}
      />

      {/* 2. ÇOK KATMANLI DİNAMİK ARKA PLAN FİLTRELERİ */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-700" />
      
      <div 
        className={`absolute inset-0 bg-[#00A859] transition-opacity duration-700 pointer-events-none mix-blend-multiply ${
          view === 'client-login' || view === 'client-register' ? 'opacity-45' : 'opacity-0'
        }`} 
      />

      <div 
        className={`absolute inset-0 bg-[#A80000] transition-opacity duration-700 pointer-events-none mix-blend-multiply ${
          view === 'admin-login' || view === 'admin-register' ? 'opacity-55' : 'opacity-0'
        }`} 
      />

      {/* 3. DİNAMİK SEÇİLEN AUTH BİLEŞENİ (Kusursuz Ekran Ortası) */}
      <div className="relative z-10 w-full max-w-[440px] px-4 flex flex-col items-center justify-center transition-all duration-500">
        {view === 'set-role' && (
          <SetRole setView={setView} />
        )}

        {view === 'client-login' && (
          <ClientLogin setView={setView} handleAccess={handleAccess} />
        )}

        {view === 'client-register' && (
          <ClientRegister setView={setView} />
        )}

        {view === 'admin-login' && (
          <AdminLogin setView={setView} handleAccess={handleAccess} />
        )}

        {view === 'admin-register' && (
          <AdminRegister setView={setView} />
        )}
      </div>

    </div>
  );
}