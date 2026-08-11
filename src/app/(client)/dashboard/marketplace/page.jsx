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
    externalUrl: 'https://www.google.com',
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
    externalUrl: 'https://www.google.com',
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
    <div className="min-h-screen bg-[#F8FAF8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <MarketplaceHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {(activeTab === 'all' || activeTab === 'trainer' || activeTab === 'dietitian') && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                Sertifikalı Uzmanlar & Koçlar
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {filteredExperts.length} Uzman Bulundu
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-100 p-5 space-y-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
                    <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredExperts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {(activeTab === 'all' || activeTab === 'supplement') && filteredProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                Onaylı Supplement & Ekipmanlar
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {filteredProducts.length} Ürün Listelendi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                />
              ))}
            </div>
          </div>
        )}

        {!loading && filteredExperts.length === 0 && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              🔍
            </div>
            <h3 className="text-sm font-bold text-slate-800">Aramanıza Uygun Sonuç Bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Farklı bir arama terimi deneyebilir veya kategorileri sıfırlayabilirsiniz.
            </p>
          </div>
        )}

      </div>

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