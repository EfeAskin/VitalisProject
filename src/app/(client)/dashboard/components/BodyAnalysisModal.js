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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#C5A880]/15 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Calculator size={18} className="text-[#0A3A25]" /> Form & Detaylı Vücut Analiz Hesaplayıcı
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-[#FCFAF7] text-[#8C724D] p-3 rounded-xl flex gap-2 text-[10px] font-bold mb-4 border border-[#C5A880]/20 leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5 text-[#C5A880]" />
          <span>Yaş, boy, kilo ve cinsiyet bilgileriniz profilinizden otomatik çekilmiştir. Her kullanıcı haftada 1, ayda en fazla 4 kez ölçüm hakkına sahiptir; aylık ortalamalarınız güvenilir gelişim takibi için baz alınır.</span>
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-8 gap-2.5 text-xs font-semibold text-slate-500">
            <Loader2 className="animate-spin text-[#10B981]" size={18} /> Güncel profil bilgileri veritabanından getiriliyor...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 bg-[#F8FAF8] p-3 rounded-xl border border-slate-100/80 mb-4 text-center">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">Boy</span>
                <span className="text-xs font-extrabold text-[#0A3A25]">{profile.height} cm</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">Kilo</span>
                <span className="text-xs font-extrabold text-[#0A3A25]">{profile.weight} kg</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">Yaş</span>
                <span className="text-xs font-extrabold text-[#0A3A25]">{profile.age}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">Cinsiyet</span>
                <span className="text-xs font-extrabold text-[#0A3A25] capitalize">{profile.gender}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Boyun (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Örn: 38" 
                  value={neck} 
                  onChange={(e) => setNeck(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/10 text-slate-700 font-semibold transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Bel (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Örn: 86" 
                  value={waist} 
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/10 text-slate-700 font-semibold transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Kalça (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Örn: 95" 
                  value={hip} 
                  onChange={(e) => setHip(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/10 text-slate-700 font-semibold transition-all" 
                />
              </div>
            </div>

            <button 
              onClick={calculateMetrics}
              disabled={calculating}
              className="w-full bg-[#0A3A25] hover:bg-[#10B981] active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 mb-4 disabled:opacity-50 border border-[#C5A880]/15"
            >
              {calculating ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Hesaplama Yapılıyor...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="text-[#C5A880]" /> Bilimsel Ölçümleri Hesapla & DB'ye Yaz
                </>
              )}
            </button>
          </>
        )}

        {results && (
          <div className="bg-[#F8FAF8] border border-slate-100/80 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200 shadow-inner">
            <h4 className="text-xs font-extrabold text-[#0A3A25] border-b border-slate-200/60 pb-2 flex items-center justify-between">
              <span>Hesaplama Sonuçları</span>
              <span className="text-[8px] bg-[#C5A880]/10 text-[#8C724D] px-2 py-0.5 rounded-full border border-[#C5A880]/20 font-bold">Medikal Analiz</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 transition-all hover:border-[#C5A880]/30 shadow-xs">
                <span className="text-[9px] text-slate-400 block font-bold">Vücut Yağ Oranı (US Navy)</span>
                <span className="text-sm font-black text-[#C5A880]">%{results.bodyFat}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 transition-all hover:border-[#10B981]/25 shadow-xs">
                <span className="text-[9px] text-slate-400 block font-bold">Bazal Metabolizma Hızı</span>
                <span className="text-sm font-black text-sky-600">{results.bmr} kcal</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 transition-all hover:border-slate-300 shadow-xs">
                <span className="text-[9px] text-slate-400 block font-bold">Vücut Kitle Endeksi (BMI)</span>
                <span className="text-sm font-black text-slate-700">{results.bmi}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 transition-all hover:border-[#10B981]/25 shadow-xs">
                <span className="text-[9px] text-slate-400 block font-bold">İdeal Kilo Oranı</span>
                <span className="text-sm font-black text-[#10B981]">{results.idealWeight} kg</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 transition-all hover:border-slate-300 col-span-2 shadow-xs">
                <span className="text-[9px] text-slate-400 block font-bold">Yağsız Vücut Kütlesi (LBM)</span>
                <span className="text-xs font-bold text-slate-700">{results.lbm} kg</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-200/60">
              <button 
                type="button"
                onClick={onClose} 
                className="w-1/2 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                Kapat
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                className="w-1/2 bg-[#0A3A25] hover:bg-[#10B981] active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all border border-[#C5A880]/15"
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