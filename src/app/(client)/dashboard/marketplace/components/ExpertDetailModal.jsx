"use client";
import React, { useState } from 'react';
import { X, CheckCircle2, Star, ShieldCheck, Send, Check, ChevronDown } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="bg-[#0A3A25] p-6 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <img 
              src={expert.avatarUrl} 
              alt={expert.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C5A880] shadow-md"
            />
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#C5A880]/20 text-[#C5A880] px-2.5 py-0.5 rounded-md border border-[#C5A880]/30">
                  {expert.category === 'trainer' ? 'Antrenör' : 'Diyetisyen'}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/20 px-2 py-0.5 rounded-md">
                  <Star size={12} className="fill-amber-400" />
                  <span>{expert.rating}</span>
                </div>
              </div>
              <h2 className="text-xl font-black text-white flex items-center gap-1.5">
                {expert.name}
                {expert.verified && <CheckCircle2 size={16} className="text-[#10B981]" />}
              </h2>
              <p className="text-xs text-emerald-100/80 font-medium truncate mt-0.5">{expert.title}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Biyografi ve Etiketler */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Hakkında & Deneyim</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
              {expert.bio || "Bu uzman henüz biyografi detayını doldurmamış."}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-3">
              {expert.specialties?.map((tag, idx) => (
                <span key={idx} className="text-[10px] font-bold text-[#0A3A25] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* İlan Paketleri Seçimi */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
              <span>Mevcut Danışmanlık Paketleri</span>
              <span className="text-[10px] text-emerald-600 font-bold lowercase">Seçim yapmak için pakete tıklayın</span>
            </h4>

            {expert.listings && expert.listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {expert.listings.map((item) => {
                  const isSelected = selectedListing?.id === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedListing(item)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-[#10B981] bg-emerald-50/40 shadow-sm' 
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-black text-slate-900">{item.title}</h5>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {item.period}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="text-base font-black text-[#0A3A25]">₺{item.price?.toLocaleString('tr-TR')}</span>
                        <div className={`mt-1 text-[10px] font-extrabold flex items-center justify-end gap-1 ${isSelected ? 'text-[#10B981]' : 'text-slate-400'}`}>
                          {isSelected ? (
                            <>
                              <Check size={12} /> Seçildi
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
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs text-center font-semibold">
                Bu uzmanın şu anda yayınladığı aktif bir ilan paketi bulunmamaktadır.
              </div>
            )}
          </div>

          {/* Başvuru / Hedef Formu */}
          {selectedListing && (
            <form onSubmit={handleSubscribe} className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Başvuru Detaylarınız</h4>
              
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Ana Hedefiniz</label>
                <div className="relative">
                  <select 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#10B981] transition-all appearance-none pr-8 cursor-pointer text-slate-800"
                    required
                  >
                    {GOAL_OPTIONS.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Uzmana Not / Mesajınız (Opsiyonel)</label>
                <textarea 
                  rows={2}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Sağlık durumunuz, geçmiş spor tecrübeniz veya beklentileriniz..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#10B981] transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A3A25] hover:bg-[#10B981] active:scale-[0.99] text-white text-xs font-extrabold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#C5A880]/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>Başvuru Gönderiliyor...</span>
                ) : (
                  <>
                    <Send size={14} className="text-[#C5A880]" />
                    <span>Ücretsiz Abonelik Başvurusu Yap</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#10B981]" /> Güvenli Vitalis OS Entegrasyonu
          </span>
          <span>Ödeme Şimdilik Ücretsizdir</span>
        </div>

      </div>
    </div>
  );
}