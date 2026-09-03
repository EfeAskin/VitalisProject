"use client";

import React, { useState, useEffect } from "react";
import { Store, Sparkles, ChevronRight, Tag, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExpertShowcaseWidget() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Uzman ID'sini güvenli bir şekilde tespit et
  const getStoredSpecialistId = () => {
    if (typeof window === "undefined") return null;
    try {
      const directId =
        localStorage.getItem("user_id") ||
        localStorage.getItem("specialist_id") ||
        localStorage.getItem("dietitian_id") ||
        localStorage.getItem("id");
      if (directId) return directId;

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return userObj.id || userObj.user_id || userObj.specialist_id || userObj.dietitian_id || null;
      }
    } catch (e) {}
    return "7"; // Varsayılan fallback
  };

  useEffect(() => {
    async function fetchListings() {
      try {
        const specId = getStoredSpecialistId();
        const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("jwt");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        // Pazaryeri ilanlarını uzmanın ID'sine göre çekiyoruz
        const res = await fetch(`/api/marketplace/listings?specialist_id=${specId}`, { headers, credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          // Eğer API bir dizi dönüyorsa doğrudan al, yoksa listings property'sini kontrol et
          const listArray = Array.isArray(data) ? data : (data.listings || data.items || []);
          
          // Sadece bu uzmana ait olanları filtrele (güvenlik amaçlı)
          const filtered = listArray.filter(item => String(item.specialist_id) === String(specId));
          setListings(filtered);
        } else {
          // Alternatif olarak genel endpoint veya mock fallback denemesi
          const altRes = await fetch(`/api/expert/listings`, { headers, credentials: "include" });
          if (altRes.ok) {
            const altData = await altRes.json();
            setListings(Array.isArray(altData) ? altData : (altData.listings || []));
          }
        }
      } catch (error) {
        console.error("Vitrin ilanları yüklenirken hata:", error);
      } finally{
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-[#171c48] to-[#11142D] border border-orange-500/30 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-500/50 transition-all flex flex-col justify-between">
      
      <div>
        {/* Başlık ve Durum */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black tracking-widest text-orange-300 uppercase flex items-center gap-2 drop-shadow">
            <Store className="w-4 h-4 text-orange-400" /> UZMAN VİTRİNİ & İLANLARIM
          </h3>
          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/40">
            {listings.length} İLAN
          </span>
        </div>
        
        <p className="text-xs text-slate-300 font-medium mb-3">
          Pazaryerinde sergilenen aktif paket ve hizmetleriniz:
        </p>

        {/* Mevcut İlanların Listelendiği Alan (Dahili Scroll Özellikli) */}
        {loading ? (
          <div className="py-6 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            <span className="text-[11px] text-slate-400 font-bold">İlanlar yükleniyor...</span>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-[#121633] border border-orange-500/20 rounded-2xl p-3.5 text-center mb-3">
            <p className="text-xs text-slate-300 font-bold">Henüz aktif ilanınız bulunmuyor.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hemen yeni bir paket ekleyerek danışan çekmeye başlayın.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 mb-3 custom-scrollbar">
            {listings.map((item) => {
              const itemId = item.id || item.listing_id;
              return (
                <div 
                  key={itemId}
                  className="bg-[#121633] border border-orange-500/20 hover:border-orange-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-400 shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{item.period || "Aylık"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black font-mono text-orange-300">
                      ₺{Number(item.price).toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Yönetim Butonu */}
      <button 
        onClick={() => router.push('/expert/marketplace?tab=showcase')}
        className="w-full py-2.5 bg-[#121633] hover:bg-orange-600/20 text-white border border-orange-500/30 hover:border-orange-500 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer group"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
        <span>İlanları & Vitrini Yönet</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>

    </div>
  );
}