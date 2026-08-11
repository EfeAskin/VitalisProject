"use client";

import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Dumbbell, 
  Apple, 
  ChevronRight, 
  Search, 
  Plus, 
  AlertCircle, 
  Star, 
  DollarSign,
  ShieldCheck,
  Activity,
  FileText
} from "lucide-react";

export default function ExpertDashboard() {
  // Simüle edilmiş Uzman / PT Verileri
  const [expertData, setExpertData] = useState({
    name: "ÖMER FARUK",
    role: "Kıdemli Baş Antrenör & Koç",
    rating: 4.95,
    totalClients: 28,
    pendingReviews: 4,
    monthlyEarnings: "42,500₺",
    activeClients: [
      { id: 1, name: "Kamil Efe Aşkın", goal: "Kilo Vermek (Yağ Yakımı)", compliance: "%92", status: "Aktif", lastActive: "Bugün, 11:15", program: "Strong Beginnings" },
      { id: 2, name: "Arda Jan", goal: "Hipertrofi & Kas Kütlesi", compliance: "%78", status: "İnceleme Bekliyor", lastActive: "Dün, 19:40", program: "Hypertrophy Master" },
      { id: 3, name: "Mehmet Demir", goal: "Kuvvet & Güç Artışı", compliance: "%95", status: "Aktif", lastActive: "Bugün, 09:30", program: "Powerlifting V2" },
      { id: 4, name: "Zeynep Kaya", goal: "Yağ Yakımı & Sıkılaşma", compliance: "%64", status: "Riskli (Düşük Uyum)", lastActive: "3 gün önce", program: "Lean Body 4W" }
    ],
    pendingApprovals: [
      { id: 1, client: "Kamil Efe Aşkın", type: "Öğün Fotoğrafı / Günlük Rapor", time: "15 dk önce" },
      { id: 2, client: "Arda Jan", type: "Antrenman Ağırlık Güncellemesi", time: "1 saat önce" },
      { id: 3, client: "Zeynep Kaya", type: "Form Fotoğrafı Analizi", time: "3 saat önce" }
    ],
    appointments: [
      { id: 1, client: "Kamil Efe Aşkın", time: "14:00 - 14:30", type: "Birebir Online Görüşme", status: "Yaklaşıyor" },
      { id: 2, client: "Ahmet Yılmaz", time: "16:00 - 16:45", type: "İlk Değerlendirme & Analiz", status: "Planlandı" }
    ]
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = expertData.activeClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
    

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">

        {/* 1. ÖZET METRİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider">AKTİF DANIŞAN</p>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2">{expertData.totalClients}</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Bu ay +4 yeni danışan
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider">BEKLEYEN İNCELEMELER</p>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-3xl font-black text-orange-400 mt-2">{expertData.pendingReviews}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Aksiyon gerektiren loglar var</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider">UZMAN PUANI</p>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2">{expertData.rating} <span className="text-xs text-slate-500 font-normal">/ 5.0</span></p>
            <p className="text-[10px] text-yellow-500 font-semibold mt-1">120+ Değerlendirme</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 tracking-wider">AYLIK KAZANÇ</p>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400 mt-2">{expertData.monthlyEarnings}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Pazaryeri komisyonu dahil</p>
          </div>

        </div>

        {/* 2. ANA İKİ SÜTUNLU YAPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL 2 KOLON: DANIŞAN YÖNETİM LİSTESİ */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">Danışan Portföyü & Uyum Takibi</h3>
                  <p className="text-xs text-slate-400">Danışanlarınızın günlük performans ve diyet uyum yüzdeleri</p>
                </div>
                
                {/* Arama Çubuğu */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Danışan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Danışan Tablosu / Kartları */}
              <div className="space-y-3">
                {filteredClients.map((client) => (
                  <div 
                    key={client.id}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-black text-orange-400 text-sm">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{client.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            client.status === "Aktif" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            client.status === "İnceleme Bekliyor" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                            "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{client.goal} • <span className="text-slate-300 font-semibold">{client.program}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold">UYUM</p>
                        <p className="text-sm font-black text-emerald-400">{client.compliance}</p>
                      </div>
                      <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5">
                        <span>Yönet</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hızlı Aksiyonlar Paneli */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-sm font-black tracking-widest text-slate-300 uppercase mb-4">HIZLI YÖNETİM ARAÇLARI</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-orange-500/50 transition-all group">
                  <Dumbbell className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black text-white">Yeni Antrenman Ata</p>
                  <p className="text-[10px] text-slate-500 mt-1">Danışana özel program oluştur.</p>
                </button>
                <button className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-emerald-500/50 transition-all group">
                  <Apple className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black text-white">Makro & Diyet Düzenle</p>
                  <p className="text-[10px] text-slate-500 mt-1">Kalori ve besin hedeflerini güncelle.</p>
                </button>
                <button className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-blue-500/50 transition-all group">
                  <FileText className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-black text-white">Toplu Duyuru Gönder</p>
                  <p className="text-[10px] text-slate-500 mt-1">Tüm danışanlara bildirim at.</p>
                </button>
              </div>
            </div>

          </div>

          {/* SAĞ 1 KOLON: BEKLEYEN ONAYLAR VE RANDEVULAR */}
          <div className="space-y-6">
            
            {/* Bekleyen Onaylar / Bildirimler */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black tracking-widest text-slate-300 uppercase flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-400" /> BEKLEYEN LOGLAR
                </h3>
                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-black rounded-full">
                  {expertData.pendingApprovals.length} Yeni
                </span>
              </div>

              <div className="space-y-3">
                {expertData.pendingApprovals.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{item.client}</span>
                      <span className="text-[9px] text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.type}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-black transition-all">
                        Onayla
                      </button>
                      <button className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold transition-all">
                        İncele
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bugünkü Randevular */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black tracking-widest text-slate-300 uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> BUGÜNKÜ RANDEVULAR
                </h3>
              </div>

              <div className="space-y-3">
                {expertData.appointments.map((app) => (
                  <div key={app.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {app.time}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded-full border border-blue-500/20">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm font-black text-white">{app.client}</p>
                    <p className="text-[11px] text-slate-400">{app.type}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}