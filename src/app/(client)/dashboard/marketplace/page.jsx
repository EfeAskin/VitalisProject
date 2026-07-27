"use client";
import React, { useState, useEffect } from 'react';
import MarketplaceHeader from './components/MarketplaceHeader';
import ExpertCard from './components/ExpertCard';
import ProductCard from './components/ProductCard';

// SIMULE EDILEBILIR MOCK VERI SETI (Neon DB & FastAPI Yanıtı)
const INITIAL_EXPERTS = [
  {
    id: 'e1',
    name: 'Mert Yılmaz',
    title: 'Kıdemli Vücut Geliştirme & Hipertrofi Koçu',
    category: 'trainer',
    avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=250',
    rating: 4.9,
    reviewCount: 48,
    experienceYears: 8,
    monthlyPrice: 3200,
    specialties: ['Hipertrofi', 'Yağ Yakımı', 'Yarışma Hazırlık'],
    verified: true
  },
  {
    id: 'e2',
    name: 'Ezgi Demir',
    title: 'Klinik Spor Diyetisyeni & Makro Uzmanı',
    category: 'dietitian',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    rating: 5.0,
    reviewCount: 62,
    experienceYears: 6,
    monthlyPrice: 2800,
    specialties: ['Kilo Verme', 'Sporcu Beslenmesi', 'PCOS'],
    verified: true
  },
  {
    id: 'e3',
    name: 'Caner Kaya',
    title: 'Powerlifting & Güç Kondisyon Antrenörü',
    category: 'trainer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    rating: 4.8,
    reviewCount: 31,
    experienceYears: 5,
    monthlyPrice: 2500,
    specialties: ['Powerlifting', 'Mobilite', 'Kondisyon'],
    verified: false
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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'trainer' | 'dietitian' | 'supplement'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const [experts, setExperts] = useState(INITIAL_EXPERTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // --- FASTAPI & NEON DB ENTEGRASYON KATMANI ---
  /*
  useEffect(() => {
    async function fetchMarketplaceData() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/marketplace?category=${activeTab}&search=${searchQuery}&sort=${sortBy}`);
        const data = await response.json();
        setExperts(data.experts || []);
        setProducts(data.products || []);
      } catch (err) {
        console.error("Marketplace veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMarketplaceData();
  }, [activeTab, searchQuery, sortBy]);
  */

  // Arama ve Filtreleme Mantığı (İstemci Tarafı Filtreleme)
  const filteredExperts = experts.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesQuery;
  });

  const filteredProducts = products.filter(item => {
    const matchesTab = activeTab === 'all' || activeTab === 'supplement';
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Arama Barı */}
        <MarketplaceHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* UZMANLAR BÖLÜMÜ (Antrenörler & Diyetisyenler) */}
        {(activeTab === 'all' || activeTab === 'trainer' || activeTab === 'dietitian') && filteredExperts.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                Sertifikalı Uzmanlar & Koçlar
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {filteredExperts.length} Uzman Bulundu
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExperts.map(expert => (
                <ExpertCard 
                  key={expert.id} 
                  expert={expert} 
                  onBook={(exp) => console.log("Randevu talebi:", exp)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SUPPLEMENT & EKİPMAN BÖLÜMÜ */}
        {(activeTab === 'all' || activeTab === 'supplement') && filteredProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
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

        {/* SONUÇ BULUNAMADI DURUMU */}
        {filteredExperts.length === 0 && filteredProducts.length === 0 && (
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
    </div>
  );
}