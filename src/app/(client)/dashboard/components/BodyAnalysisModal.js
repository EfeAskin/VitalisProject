"use client";
import React, { useState, useEffect } from 'react';
import { X, Calculator, RefreshCw, Info, Loader2 } from 'lucide-react';

export default function BodyAnalysisModal({ isOpen, onClose, onSave, userId }) {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  const getEffectiveUserId = () => {
    if (userId && !isNaN(Number(userId))) return Number(userId);
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id') || localStorage.getItem('userId');
      if (storedUserId) return Number(storedUserId);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) return Number(parsed.id);
        } catch (e) {
          console.error("User localStorage okuma hatası:", e);
        }
      }
    }
    return 3;
  };

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    age: 0,
    height: 0,
    weight: 0,
    gender: 'erkek'
  });

  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState(''); 

  const [results, setResults] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchUserProfile = async () => {
        setLoadingProfile(true);
        try {
          const targetUserId = getEffectiveUserId();
          const response = await fetch(`http://localhost:8000/api/user/${targetUserId}`);
          if (response.ok) {
            const data = await response.json();
            setProfile({
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              age: data.age ?? 0,
              height: data.height ?? 0,
              weight: data.weight ?? 0,
              gender: data.gender || 'erkek'
            });
          } else {
            console.error("Profil bilgileri getirilemedi.");
          }
        } catch (error) {
          console.error("Profil bilgileri yüklenirken hata oluştu:", error);
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const calculateMetrics = async () => {
    const neckNum = parseFloat(neck);
    const waistNum = parseFloat(waist);
    const hipNum = parseFloat(hip);

    if (!neckNum || !waistNum || !hipNum) {
      alert("Lütfen hesaplama için gerekli tüm çevre ölçümlerini (Boyun, Bel, Kalça) giriniz.");
      return;
    }

    setCalculating(true);
    try {
      const targetUserId = getEffectiveUserId();
      const response = await fetch(`http://localhost:8000/api/user/${targetUserId}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          neck: neckNum,
          waist: waistNum,
          hip: hipNum
        })
      });

      if (response.ok) {
        const calculatedData = await response.json();
        
        setResults({
          bmi: calculatedData.bmi !== undefined && calculatedData.bmi !== null ? Number(calculatedData.bmi).toFixed(1) : "0.0",
          bmr: calculatedData.bmr !== undefined && calculatedData.bmr !== null ? Math.round(Number(calculatedData.bmr)) : 0,
          bodyFat: calculatedData.body_fat !== undefined && calculatedData.body_fat !== null ? Number(calculatedData.body_fat).toFixed(1) : "0.0",
          idealWeight: calculatedData.ideal_weight !== undefined && calculatedData.ideal_weight !== null ? Math.round(Number(calculatedData.ideal_weight)) : 75,
          lbm: calculatedData.lbm !== undefined && calculatedData.lbm !== null ? Number(calculatedData.lbm).toFixed(1) : "0.0"
        });
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.detail || "Hesaplama sırasında bir sorun oluştu.");
      }
    } catch (error) {
      console.error("API bağlantı hatası:", error);
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = () => {
    if (!results) return;
    localStorage.setItem('last_measurement_date', new Date().toISOString());

    if (onSave) {
      onSave({
        bodyFat: Number(results.bodyFat),
        kilo: Number(profile.weight),
        lbm: Number(results.lbm),
        bmi: Number(results.bmi),
        bmr: Number(results.bmr)
      });
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    /* Arka Plan Karartma (Overlay) */
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      
      {/* 
        Ana Modal Kutusu (Outer Box):
        - #11142D (Lacivert) arka plandan kolaylıkla ayrılan Kristal Beyaz Zemin (bg-white/95).
        - Neon Zümrüt & Kehribar Işıltılı Kenarlıklar.
        - En kötü projeksiyonda bile %100 seçilebilir ultra net tipografi ve gölgelendirme.
      */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 max-w-lg w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-emerald-500/40 hover:border-amber-400/60 transition-all duration-300 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative">
        
        {/* Üst Başlık ve Kapat Butonu */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <Calculator size={20} className="text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
            <span>Form & Detaylı Vücut Analiz Hesaplayıcı</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all border border-transparent hover:border-rose-200/80 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bilgilendirme Kartı */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-400/40 rounded-2xl p-3.5 flex gap-2.5 text-[10px] font-black text-amber-950 mb-5 shadow-xs leading-relaxed">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-500 fill-amber-400/20" />
          <span>Yaş, boy, kilo ve cinsiyet bilgileriniz profilinizden otomatik çekilmiştir. Her kullanıcı haftada 1, ayda en fazla 4 kez ölçüm hakkına sahiptir; aylık ortalamalarınız güvenilir gelişim takibi için baz alınır.</span>
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-10 gap-3 text-xs font-black text-slate-700">
            <Loader2 className="animate-spin text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" size={20} /> 
            <span>Güncel profil bilgileri veritabanından getiriliyor...</span>
          </div>
        ) : (
          <>
            {/* Profil Verileri Özeti */}
            <div className="grid grid-cols-4 gap-2.5 bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/90 mb-5 text-center shadow-inner">
              <div>
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Boy</span>
                <span className="text-xs font-black text-emerald-950 tracking-tight">{profile.height} cm</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Kilo</span>
                <span className="text-xs font-black text-emerald-950 tracking-tight">{profile.weight} kg</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Yaş</span>
                <span className="text-xs font-black text-emerald-950 tracking-tight">{profile.age}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Cinsiyet</span>
                <span className="text-xs font-black text-emerald-950 tracking-tight capitalize">{profile.gender}</span>
              </div>
            </div>

            {/* Ölçüm Girdileri */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div>
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block mb-1.5">Boyun (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Örn: 38" 
                  value={neck} 
                  onChange={(e) => setNeck(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2.5 text-xs outline-none text-slate-950 font-black transition-all shadow-xs" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block mb-1.5">Bel (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Örn: 86" 
                  value={waist} 
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2.5 text-xs outline-none text-slate-950 font-black transition-all shadow-xs" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block mb-1.5">Kalça (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Örn: 95" 
                  value={hip} 
                  onChange={(e) => setHip(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2.5 text-xs outline-none text-slate-950 font-black transition-all shadow-xs" 
                />
              </div>
            </div>

            {/* Hesaplama Butonu */}
            <button 
              onClick={calculateMetrics}
              disabled={calculating}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white text-xs font-black py-3 rounded-2xl transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mb-5 disabled:opacity-50 border border-emerald-400/40 cursor-pointer"
            >
              {calculating ? (
                <>
                  <Loader2 className="animate-spin text-amber-300" size={16} /> 
                  <span>Hesaplama Yapılıyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={15} className="text-amber-300 drop-shadow-xs" /> 
                  <span>Bilimsel Ölçümleri Hesapla & DB'ye Yaz</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Sonuç Alanı */}
        {results && (
          <div className="bg-slate-50/90 border-2 border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-inner animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-xs font-black text-slate-950 border-b border-slate-200 pb-2.5 flex items-center justify-between">
              <span>Hesaplama Sonuçları</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-black tracking-wider uppercase shadow-xs">
                Medikal Analiz
              </span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 transition-all hover:border-emerald-500/40 shadow-xs hover:shadow-md">
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Vücut Yağ Oranı (US Navy)</span>
                <span className="text-sm font-black text-amber-600 drop-shadow-xs">%{results.bodyFat}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 transition-all hover:border-emerald-500/40 shadow-xs hover:shadow-md">
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Bazal Metabolizma Hızı</span>
                <span className="text-sm font-black text-emerald-600 drop-shadow-xs">{results.bmr} kcal</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 transition-all hover:border-emerald-500/40 shadow-xs hover:shadow-md">
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Vücut Kitle Endeksi (BMI)</span>
                <span className="text-sm font-black text-slate-900">{results.bmi}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 transition-all hover:border-emerald-500/40 shadow-xs hover:shadow-md">
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">İdeal Kilo Oranı</span>
                <span className="text-sm font-black text-teal-600">{results.idealWeight} kg</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 transition-all hover:border-emerald-500/40 col-span-2 shadow-xs hover:shadow-md">
                <span className="text-[9px] text-slate-500 block font-black uppercase tracking-wider">Yağsız Vücut Kütlesi (LBM)</span>
                <span className="text-xs font-black text-slate-900">{results.lbm} kg</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-200">
              <button 
                type="button"
                onClick={onClose} 
                className="w-1/2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                Kapat
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                className="w-1/2 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white text-xs font-black py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all border border-emerald-400/40 cursor-pointer"
              >
                Kaydet & Grafiği Güncelle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}