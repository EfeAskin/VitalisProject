"use client";
import React, { useState } from 'react';
import { X, CheckCircle2, Star, ShieldCheck, Send, Check, ChevronDown, Sparkles } from 'lucide-react';

const GOAL_OPTIONS = [
  "Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı zayıflama.",
  "Hızlı Kilo Vermek: Doktor gözetiminde maksimum yağ kaybı.",
  "Formu Korumak: Mevcut kiloyu koruma ve sağlıklı beslenme.",
  "Kondisyon & Sıkılaşmak: Kiloyu korurken vücudu şekillendirme.",
  "Kas Kazanmak (Bulking): Kas kütlesini artırma ve hacim kazanma.",
  "Sağlıklı Kilo Almak: Temiz beslenerek hacim kazanma.",
  "Güç & Performans Artışı: Atletik performans ve güç geliştirme."
];

export default function ExpertDetailModal({ expert, onClose, onSuccess }) {
  const [selectedListing, setSelectedListing] = useState(expert?.listings?.[0] || null);
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!expert) return null;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedListing) {
      alert("Lütfen başvuru yapmak istediğiniz bir hizmet paketini seçin.");
      return;
    }

    // 1. Önce LocalStorage'dan Client ID çekilir
    let currentClientId = 3; // Fallback ID
    if (typeof window !== "undefined") {  
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            currentClientId = parsedUser.id;
          }
        } catch (err) {
          console.error("LocalStorage kullanıcı bilgisi okuma hatası:", err);
        }
      }
    }

    setLoading(true);
    try {
      // 2. Fetch isteği ve tam payload tek bir yerde gönderilir
      const response = await fetch('http://localhost:8000/api/client/marketplace/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialist_user_id: parseInt(expert.userId || expert.id),
          package_name: selectedListing.title,
          goal: goal,
          request_message: requestMessage,
          client_id: parseInt(currentClientId)
        })
      });

      const resData = await response.json();
      if (resData.success) {
        alert(`Tebrikler! ${expert.name} isimli uzmana "${selectedListing.title}" başvurunuz iletildi.`);
        onSuccess && onSuccess();
        onClose();
      } else {
        alert("Başvuru yapılırken bir hata oluştu: " + (resData.detail || "Bilinmeyen hata"));
      }
    } catch (err) {
      console.error("Abonelik Hatası:", err);
      alert("Sunucuya bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Modal Ana Kutu - Kompakt Boyutlandırma (max-w-xl ve max-h-[85vh]) */}
      <div className="bg-gradient-to-b from-[#18231E] via-[#141C18] to-[#101713] rounded-3xl max-w-xl w-full overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.25)] border border-emerald-500/30 flex flex-col max-h-[85vh] my-auto backdrop-blur-2xl relative">
        
        {/* Ambient Neon Glow Arka Plan Işımaları */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Section */}
        <div className="p-4 sm:p-5 bg-[#121B16]/90 border-b border-emerald-500/20 text-white relative z-10">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-emerald-950/60 hover:bg-emerald-500/20 text-emerald-200 hover:text-white border border-emerald-500/30 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="relative">
              <img 
                src={expert.avatarUrl} 
                alt={expert.name} 
                className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
              />
              {expert.verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                  <CheckCircle2 size={12} className="fill-emerald-400 text-black" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.15)] flex items-center gap-1">
                  <Sparkles size={9} className="text-amber-400 fill-amber-400" />
                  {expert.category === 'trainer' ? 'Antrenör' : 'Diyetisyen'}
                </span>
                <div className="flex items-center gap-1 text-amber-300 text-[11px] font-black bg-[#0D1410]/80 border border-amber-500/30 px-1.5 py-0.5 rounded-md shadow-inner">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span>{expert.rating}</span>
                </div>
              </div>

              <h2 className="text-lg font-black text-white flex items-center gap-1.5 tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                {expert.name}
              </h2>
              <p className="text-[11px] text-emerald-100/70 font-medium truncate mt-0.5">{expert.title}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 relative z-10 custom-scrollbar">
          
          {/* Biyografi ve Etiketler */}
          <div>
            <h4 className="text-[9px] font-black uppercase text-emerald-400 tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              Hakkında & Deneyim
            </h4>
            <p className="text-[11px] text-emerald-100/80 leading-relaxed bg-[#0D1410]/80 p-3 rounded-xl border border-emerald-500/20 font-medium shadow-[0_0_15px_rgba(0,0,0,0.3)]">
              {expert.bio || "Bu uzman henüz biyografi detayını doldurmamış."}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {expert.specialties?.map((tag, idx) => (
                <span key={idx} className="text-[9px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* İlan Paketleri Seçimi */}
          <div>
            <h4 className="text-[9px] font-black uppercase text-emerald-400 tracking-widest mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                Mevcut Danışmanlık Paketleri
              </span>
              <span className="text-[9px] text-emerald-300/60 font-bold lowercase">Seçim yapmak için pakete tıklayın</span>
            </h4>

            {expert.listings && expert.listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {expert.listings.map((item) => {
                  const isSelected = selectedListing?.id === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedListing(item)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]' 
                          : 'border-emerald-500/20 bg-[#0D1410]/70 hover:border-emerald-500/40 hover:bg-[#121B16]'
                      }`}
                    >
                      <div className="space-y-0.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-[11px] font-black text-white">{item.title}</h5>
                          <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                            {item.period}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-100/60 line-clamp-1">{item.description}</p>
                      </div>

                      <div className="text-right min-w-[75px]">
                        <span className="text-sm font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                          ₺{item.price?.toLocaleString('tr-TR')}
                        </span>
                        <div className={`mt-0.5 text-[9px] font-extrabold flex items-center justify-end gap-0.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-100/40'}`}>
                          {isSelected ? (
                            <>
                              <Check size={10} className="text-emerald-400" /> Seçildi
                            </>
                          ) : (
                            <span>Seç</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] text-center font-bold shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                Bu uzmanın şu anda yayınladığı aktif bir ilan paketi bulunmamaktadır.
              </div>
            )}
          </div>

          {/* Başvuru / Hedef Formu */}
          {selectedListing && (
            <form onSubmit={handleSubscribe} className="space-y-3 pt-3 border-t border-emerald-500/20">
              <h4 className="text-[9px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                Başvuru Detaylarınız
              </h4>
              
              <div>
                <label className="text-[10px] font-bold text-emerald-200 block mb-1">Ana Hedefiniz</label>
                <div className="relative">
                  <select 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D1410]/90 border border-emerald-500/30 rounded-lg text-[11px] font-semibold outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none pr-8 cursor-pointer text-emerald-100 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                    required
                  >
                    {GOAL_OPTIONS.map((opt, i) => (
                      <option key={i} value={opt} className="bg-[#141C18] text-emerald-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-200 block mb-1">Uzmana Not / Mesajınız (Opsiyonel)</label>
                <textarea 
                  rows={2}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Sağlık durumunuz, geçmiş spor tecrübeniz veya beklentileriniz..."
                  className="w-full px-3 py-2 bg-[#0D1410]/90 border border-emerald-500/30 rounded-lg text-[11px] font-medium outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20 text-emerald-100 placeholder-emerald-300/40 transition-all resize-none shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-black font-black text-xs py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-300/40 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Başvuru Gönderiliyor...</span>
                ) : (
                  <>
                    <Send size={13} className="text-black fill-black/20" />
                    <span>Ücretsiz Abonelik Başvurusu Yap</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer Info */}
        <div className="bg-[#0D1410]/90 px-4 sm:px-5 py-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[9px] text-emerald-200/60 font-bold relative z-10">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> Güvenli Vitalis OS Entegrasyonu
          </span>
          <span className="text-amber-300">Ödeme Şimdilik Ücretsizdir</span>
        </div>

      </div>
    </div>
  );
}