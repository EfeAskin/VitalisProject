"use client";
import React, { useState, useEffect, useCallback } from 'react';
import MarketplaceHeader from './components/MarketplaceHeader';
import ExpertCard from './components/ExpertCard';
import ProductCard from './components/ProductCard';
import ExpertDetailModal from './components/ExpertDetailModal';

const INITIAL_EXPERTS = [
  {
    id: 'e1',
    userId: 101,
    name: 'Mert Yılmaz',
    title: 'Kıdemli Vücut Geliştirme & Hipertrofi Koçu',
    category: 'trainer',
    avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=250',
    rating: 4.9,
    reviewCount: 48,
    experienceYears: 8,
    minPrice: 3200,
    specialties: ['Hipertrofi', 'Yağ Yakımı', 'Yarışma Hazırlık'],
    verified: true,
    listings: [
      {
        id: 1011,
        title: 'Birebir Uzaktan Koçluk & Hipertrofi',
        price: 3200,
        period: 'Aylık',
        description: 'Kişiye özel antrenman ve beslenme programı, haftalık form takibi.'
      }
    ]
  },
  {
    id: 'e2',
    userId: 102,
    name: 'Ezgi Demir',
    title: 'Klinik Spor Diyetisyeni & Makro Uzmanı',
    category: 'dietitian',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    rating: 5.0,
    reviewCount: 62,
    experienceYears: 6,
    minPrice: 2800,
    specialties: ['Kilo Verme', 'Sporcu Beslenmesi', 'PCOS'],
    verified: true,
    listings: [
      {
        id: 1021,
        title: 'Klinik Sporcu Beslenmesi & Diyet',
        price: 2800,
        period: 'Aylık',
        description: 'Tahlil incelemeli, haftalık güncellenen diyet listesi.'
      }
    ]
  },
  {
    id: 'e3',
    userId: 103,
    name: 'Caner Kaya',
    title: 'Powerlifting & Güç Kondisyon Antrenörü',
    category: 'trainer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    rating: 4.8,
    reviewCount: 31,
    experienceYears: 5,
    minPrice: 2500,
    specialties: ['Powerlifting', 'Mobilite', 'Kondisyon'],
    verified: false,
    listings: [
      {
        id: 1031,
        title: 'Powerlifting & Güç Programı',
        price: 2500,
        period: 'Aylık',
        description: 'Bench, Squat ve Deadlift kuvvet artışına yönelik koçluk.'
      }
    ]
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    title: 'Whey Protein Izolesi 2000g (Çikolata)',
    brand: 'Hardline Nutrition',
    category: 'supplement',
    imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 124,
    price: 1450,
    oldPrice: 1650,
    externalUrl: 'https://www.bigjoy.com.tr/bigwhey-protein-klasik-cikolata-16-servis',
    inStock: true,
    isPopular: true
  },
  {
    id: 'p2',
    title: 'Mikronize Kreatin Monohidrat 500g',
    brand: 'Big Joy',
    category: 'supplement',
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 89,
    price: 650,
    oldPrice: 720,
    externalUrl: 'https://www.bigjoy.com.tr/kreatin-toz-aromasiz?srsltid=AfmBOopYPp2Iv90qpnuf8nHZhSadGuqwc3MUVtK-a6tIZ4RxIhEMVeji',
    inStock: true,
    isPopular: false
  }
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const [experts, setExperts] = useState(INITIAL_EXPERTS);
  const [products] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  const fetchMarketplaceData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/client/marketplace/experts?category=${activeTab}&search=${encodeURIComponent(searchQuery)}&sort=${sortBy}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.experts) && data.experts.length > 0) {
          const realExperts = data.experts;
          const realUserIds = new Set(realExperts.map(e => String(e.userId || e.id)));

          // Gerçek DB uzmanlarını (Ömer Gürün) listenin en üstüne koy, mock verilerle birleştir
          const mergedExperts = [
            ...realExperts,
            ...INITIAL_EXPERTS.filter(m => !realUserIds.has(String(m.userId)) && !realUserIds.has(String(m.id)))
          ];
          setExperts(mergedExperts);
        } else {
          setExperts(INITIAL_EXPERTS);
        }
      } else {
        setExperts(INITIAL_EXPERTS);
      }
    } catch (err) {
      console.warn("FastAPI canlı verisine erişilemedi:", err);
      setExperts(INITIAL_EXPERTS);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, sortBy]);

  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  const filteredExperts = experts.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesQuery = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(item.specialties) && item.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesTab && matchesQuery;
  });

  const filteredProducts = products.filter(item => {
    const matchesTab = activeTab === 'all' || activeTab === 'supplement';
    const matchesQuery = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleInspectExpert = (expertObj) => {
    setSelectedExpert(expertObj);
  };

  return (
    <div className="min-h-screen bg-[#11142D] p-4 md:p-8 relative overflow-hidden text-slate-100">
      
      {/* Lüks Arka Plan Ambient Işıltıları */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Filtre ve Arama Başlık Bileşeni */}
        <MarketplaceHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* UZMANLAR SEKSİYONU */}
        {(activeTab === 'all' || activeTab === 'trainer' || activeTab === 'dietitian') && (
          <div className="space-y-5">
            {/* Seksiyon Başlık Box'ı (Obsidyen Zümrüt Tonlarında - Lacivertten Bağımsız) */}
            <div className="flex justify-between items-center bg-gradient-to-r from-[#19221E] via-[#161C1A] to-[#19221E] border border-emerald-500/30 p-4 sm:p-5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.15)] backdrop-blur-xl">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-3 tracking-wide">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10B981]"></span>
                </span>
                Sertifikalı Uzmanlar & Koçlar
              </h2>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                {filteredExperts.length} Uzman Bulundu
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-gradient-to-b from-[#1E1C2B] to-[#151422] rounded-3xl h-64 animate-pulse border border-purple-500/20 p-6 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-purple-900/30 rounded-2xl border border-purple-500/20"></div>
                      <div className="space-y-2.5 flex-1">
                        <div className="h-4 bg-purple-900/40 rounded-lg w-3/4"></div>
                        <div className="h-3 bg-purple-900/30 rounded-lg w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-12 bg-purple-950/40 rounded-2xl w-full border border-purple-500/10"></div>
                    <div className="h-10 bg-purple-900/30 rounded-2xl w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredExperts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperts.map(expert => (
                  <ExpertCard 
                    key={expert.id || expert.userId} 
                    expert={expert} 
                    onInspect={handleInspectExpert}
                    onBook={(exp) => handleInspectExpert(exp)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ÜRÜNLER / SUPPLEMENT SEKSİYONU */}
        {(activeTab === 'all' || activeTab === 'supplement') && filteredProducts.length > 0 && (
          <div className="space-y-5 pt-4">
            {/* Seksiyon Başlık Box'ı (Obsidyen Kehribar Tonlarında - Lacivertten Bağımsız) */}
            <div className="flex justify-between items-center bg-gradient-to-r from-[#221D17] via-[#1C1814] to-[#221D17] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.15)] backdrop-blur-xl">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-3 tracking-wide">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-[0_0_10px_#F59E0B]"></span>
                </span>
                Onaylı Supplement & Ekipmanlar
              </h2>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                {filteredProducts.length} Ürün Listelendi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                />
              ))}
            </div>
          </div>
        )}

        {/* BOŞ SONUÇ KUTUSU (Obsidyen Mürdüm Tonlarında) */}
        {!loading && filteredExperts.length === 0 && filteredProducts.length === 0 && (
          <div className="bg-gradient-to-b from-[#211A30] via-[#1B1628] to-[#151221] rounded-3xl p-12 text-center border border-fuchsia-500/30 shadow-[0_0_40px_rgba(217,70,239,0.15)] backdrop-blur-xl space-y-4">
            <div className="w-16 h-16 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center mx-auto text-fuchsia-400 text-2xl shadow-[0_0_20px_rgba(217,70,239,0.3)]">
              🔍
            </div>
            <h3 className="text-base font-black text-white tracking-wide">Aramanıza Uygun Sonuç Bulunamadı</h3>
            <p className="text-xs text-fuchsia-200/70 max-w-sm mx-auto font-medium leading-relaxed">
              Farklı bir arama terimi deneyebilir veya kategorileri sıfırlayabilirsiniz.
            </p>
          </div>
        )}

      </div>

      {/* UZMAN DETAY MODALI */}
      {selectedExpert && (
        <ExpertDetailModal 
          expert={selectedExpert} 
          onClose={() => setSelectedExpert(null)}
          onSuccess={() => {
            fetchMarketplaceData();
          }}
        />
      )}
    </div>
  );
}