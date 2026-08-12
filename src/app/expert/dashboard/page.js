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
  FileText,
  Sparkles,
  Zap
} from "lucide-react";

export default function ExpertDashboard() {
  // Simüle edilmiş Uzman / PT Verileri
  const [expertData, setExpertData] = useState({
    name: "",
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
    <div className="relative min-h-screen bg-[#11142D] text-slate-100 font-sans pb-20 selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* 🔮 AMBİYANS IŞIKLARI (Neon spotlar ve sitenin arka plan uyumu) */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[150px] pointer-events-none -z-0" />

      {/* ANA İÇERİK ALANI */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* 🚀 ÜST HOŞ GELDİN KARTI */}
        <div className="bg-[#11142D]/95 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(79,70,229,0.15)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-orange-300 text-[10px] font-heading font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> VITALIS EXPERT COMMAND
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white drop-shadow-md">
              Hoş Geldin, Koç {expertData.name} 👋
            </h1>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Bugünkü danışan aktiflik oranlarınız yüksek. Onay bekleyen 4 yeni log ve yaklaşan 2 canlı görüşmeniz bulunuyor.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black text-xs rounded-2xl transition-all shadow-[0_0_25px_rgba(249,115,22,0.35)] hover:shadow-[0_0_35px_rgba(249,115,22,0.5)] border border-orange-400/50 active:scale-95 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              <span>DANIŞAN EKLE</span>
            </button>
          </div>
        </div>

        {/* 1. ÖZET METRİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Aktif Danışan */}
          <div className="bg-[#11142D]/95 border border-slate-700/80 hover:border-orange-500/50 backdrop-blur-xl rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-heading font-black text-slate-300 tracking-wider uppercase">AKTİF DANIŞAN</p>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-white mt-3 tracking-tight drop-shadow">{expertData.totalClients}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Bu ay +4 yeni danışan
            </p>
          </div>

          {/* Bekleyen İncelemeler */}
          <div className="bg-[#11142D]/95 border border-slate-700/80 hover:border-orange-500/50 backdrop-blur-xl rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-heading font-black text-slate-300 tracking-wider uppercase">BEKLEYEN İNCELEMELER</p>
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-300 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-orange-400 mt-3 tracking-tight drop-shadow">{expertData.pendingReviews}</p>
            <p className="text-[10px] text-slate-200 font-semibold mt-1.5">Aksiyon gerektiren loglar var</p>
          </div>

          {/* Uzman Puanı */}
          <div className="bg-[#11142D]/95 border border-slate-700/80 hover:border-orange-500/50 backdrop-blur-xl rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-heading font-black text-slate-300 tracking-wider uppercase">UZMAN PUANI</p>
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-300 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <Star className="w-4 h-4 fill-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-white mt-3 tracking-tight drop-shadow">{expertData.rating} <span className="text-xs text-slate-300 font-medium">/ 5.0</span></p>
            <p className="text-[10px] text-yellow-400 font-bold mt-1.5">120+ Değerlendirme</p>
          </div>

          {/* Aylık Kazanç */}
          <div className="bg-[#11142D]/95 border border-slate-700/80 hover:border-orange-500/50 backdrop-blur-xl rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-heading font-black text-slate-300 tracking-wider uppercase">AYLIK KAZANÇ</p>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-emerald-400 mt-3 tracking-tight drop-shadow">{expertData.monthlyEarnings}</p>
            <p className="text-[10px] text-slate-200 font-semibold mt-1.5">Pazaryeri komisyonu dahil</p>
          </div>

        </div>

        {/* 2. ANA İKİ SÜTUNLU YAPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL 2 KOLON: DANIŞAN YÖNETİM LİSTESİ */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#11142D]/95 border border-slate-700/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_35px_rgba(79,70,229,0.15)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-heading font-black text-white drop-shadow">Danışan Portföyü & Uyum Takibi</h3>
                  <p className="text-xs text-slate-200 font-medium">Danışanlarınızın günlük performans ve diyet uyum yüzdeleri</p>
                </div>
                
                {/* Arama Çubuğu */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-300" />
                  <input 
                    type="text"
                    placeholder="Danışan ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#11142D] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-400 shadow-inner"
                  />
                </div>
              </div>

              {/* Danışan Tablosu / Kartları */}
              <div className="space-y-3">
                {filteredClients.map((client) => (
                  <div 
                    key={client.id}
                    className="bg-[#11142D] border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange-500/50 hover:bg-slate-900/90 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 border border-orange-500/50 flex items-center justify-center font-heading font-black text-orange-300 text-sm shadow-[0_0_15px_rgba(249,115,22,0.25)] group-hover:scale-105 transition-transform">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-heading font-black text-white drop-shadow">{client.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-heading font-black uppercase tracking-wider ${
                            client.status === "Aktif" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                            client.status === "İnceleme Bekliyor" ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]" :
                            "bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium mt-0.5">{client.goal} • <span className="text-white font-bold">{client.program}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-300 font-heading font-black tracking-wider uppercase">UYUM</p>
                        <p className="text-sm font-heading font-black text-emerald-400 drop-shadow">{client.compliance}</p>
                      </div>
                      <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-orange-500/50 font-heading font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                        <span>Yönet</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hızlı Aksiyonlar Paneli */}
            <div className="bg-[#11142D]/95 border border-slate-700/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_35px_rgba(79,70,229,0.15)]">
              <h3 className="text-xs font-heading font-black tracking-widest text-slate-200 uppercase mb-4 flex items-center gap-2 drop-shadow">
                <Zap className="w-4 h-4 text-orange-400" /> HIZLI YÖNETİM ARAÇLARI
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="p-4 bg-[#11142D] border border-slate-700/80 rounded-2xl text-left hover:border-orange-500/50 hover:bg-slate-900/90 transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <Dumbbell className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform drop-shadow" />
                  <p className="text-xs font-heading font-black text-white">Yeni Antrenman Ata</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-1">Danışana özel program oluştur.</p>
                </button>
                <button className="p-4 bg-[#11142D] border border-slate-700/80 rounded-2xl text-left hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <Apple className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform drop-shadow" />
                  <p className="text-xs font-heading font-black text-white">Makro & Diyet Düzenle</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-1">Kalori ve besin hedeflerini güncelle.</p>
                </button>
                <button className="p-4 bg-[#11142D] border border-slate-700/80 rounded-2xl text-left hover:border-blue-500/50 hover:bg-slate-900/90 transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <FileText className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform drop-shadow" />
                  <p className="text-xs font-heading font-black text-white">Toplu Duyuru Gönder</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-1">Tüm danışanlara bildirim at.</p>
                </button>
              </div>
            </div>

          </div>

          {/* SAĞ 1 KOLON: BEKLEYEN ONAYLAR VE RANDEVULAR */}
          <div className="space-y-6">
            
            {/* Bekleyen Onaylar / Bildirimler */}
            <div className="bg-[#11142D]/95 border border-slate-700/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_35px_rgba(79,70,229,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading font-black tracking-widest text-slate-200 uppercase flex items-center gap-2 drop-shadow">
                  <Bell className="w-4 h-4 text-orange-400" /> BEKLEYEN LOGLAR
                </h3>
                <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-300 text-[10px] font-heading font-black rounded-full border border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  {expertData.pendingApprovals.length} Yeni
                </span>
              </div>

              <div className="space-y-3">
                {expertData.pendingApprovals.map((item) => (
                  <div key={item.id} className="bg-[#11142D] p-3.5 rounded-2xl border border-slate-700/80 space-y-2 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-black text-white drop-shadow">{item.client}</span>
                      <span className="text-[9px] font-mono text-slate-300">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-medium">{item.type}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-heading font-black transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        Onayla
                      </button>
                      <button className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-[10px] font-bold transition-all">
                        İncele
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bugünkü Randevular */}
            <div className="bg-[#11142D]/95 border border-slate-700/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_35px_rgba(79,70,229,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-heading font-black tracking-widest text-slate-200 uppercase flex items-center gap-2 drop-shadow">
                  <Calendar className="w-4 h-4 text-blue-400" /> BUGÜNKÜ RANDEVULAR
                </h3>
              </div>

              <div className="space-y-3">
                {expertData.appointments.map((app) => (
                  <div key={app.id} className="bg-[#11142D] p-4 rounded-2xl border border-slate-700/80 space-y-2 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-bold text-blue-300 flex items-center gap-1 drop-shadow">
                        <Clock className="w-3.5 h-3.5" /> {app.time}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-heading font-black rounded-full border border-blue-500/40 uppercase tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm font-heading font-black text-white drop-shadow">{app.client}</p>
                    <p className="text-[11px] text-slate-200 font-medium">{app.type}</p>
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