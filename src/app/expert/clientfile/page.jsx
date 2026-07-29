"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PtClientList from "./components/PtClientList";
import NewRequests from "./components/NewRequests";
import ClientDetailView from "./components/ClientDetailView";
import { Users, UserPlus, FolderOpen } from "lucide-react";

function ClientFileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query'sine göre aktif sekme (?tab=requests veya ?tab=detail&id=1)
  const currentTab = searchParams.get("tab") || "list";
  const selectedClientId = searchParams.get("id");

  // Mock State Management (Gerçek uygulamada Neon DB / API ile senkronize olur)
  const [clients, setClients] = useState([
    {
      id: "1",
      first_name: "Kamil Efe",
      last_name: "Aşkın",
      email: "kamil@vitalis.com",
      phone: "+90 532 111 2233",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      goal: "Kas Kütlesi Artırımı (Hipertrofi)",
      program_name: "Strong Beginnings V2 - Hipertrofi",
      status: "active",
      compliance_rate: 92,
      starting_weight: 84.5,
      current_weight: 78.0,
      target_weight: 75.0,
      height: 180,
      age: 22,
      gender: "Erkek",
      body_fat: 16.5,
      active_package: "3 Aylık VIP Birebir PT Koçluğu",
      package_days_left: 42,
      daily_calories: 2450,
      protein_g: 180,
      carbs_g: 220,
      fat_g: 65,
      notes: [
        { id: 1, date: "2026-07-28", text: "Bench press formunda omuz fleksiyonuna dikkat edilmeli.", author: "PT Ömer" }
      ],
      weekly_logs: [
        { day: "Pzt", workout_done: true, diet_done: true, weight: 78.2 },
        { day: "Sal", workout_done: true, diet_done: true, weight: 78.1 },
        { day: "Çar", workout_done: false, diet_done: true, weight: 78.3 },
        { day: "Per", workout_done: true, diet_done: true, weight: 78.0 },
        { day: "Cum", workout_done: true, diet_done: false, weight: 78.0 },
        { day: "Cmt", workout_done: true, diet_done: true, weight: 77.9 },
        { day: "Paz", workout_done: false, diet_done: true, weight: 78.0 }
      ]
    },
    {
      id: "2",
      first_name: "Zeynep",
      last_name: "Yılmaz",
      email: "zeynep@vitalis.com",
      phone: "+90 533 444 5566",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
      goal: "Yağ Yakımı & Kondisyon",
      program_name: "Fat Burner Pro 30",
      status: "active",
      compliance_rate: 88,
      starting_weight: 68.0,
      current_weight: 62.5,
      target_weight: 58.0,
      height: 168,
      age: 25,
      gender: "Kadın",
      body_fat: 22.0,
      active_package: "6 Aylık Standart Diyet & PT",
      package_days_left: 110,
      daily_calories: 1750,
      protein_g: 130,
      carbs_g: 150,
      fat_g: 50,
      notes: [],
      weekly_logs: []
    }
  ]);

  const [requests, setRequests] = useState([
    {
      id: "req-101",
      first_name: "Mert",
      last_name: "Kaya",
      email: "mert.kaya@gmail.com",
      phone: "+90 555 999 8877",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      goal: "Postür Düzeltme & Güçlenme",
      age: 28,
      gender: "Erkek",
      height: 185,
      weight: 90.0,
      requested_package: "3 Aylık VIP Birebir PT Koçluğu",
      request_date: "2026-07-29",
      message: "Özellikle masa başı çalışmaktan dolayı sırt ağrılarım var. Birebir takip istiyorum."
    },
    {
      id: "req-102",
      first_name: "Selin",
      last_name: "Demir",
      email: "selin.d@gmail.com",
      phone: "+90 542 333 2211",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
      goal: "Kilo Vermek & Sıkılaşmak",
      age: 24,
      gender: "Kadın",
      height: 165,
      weight: 71.0,
      requested_package: "Aylık Antrenman Planlaması",
      request_date: "2026-07-28",
      message: "Daha önce fitness yaptım ama düzen oturtamadım."
    }
  ]);

  // Yeni Başvuruyu Kabul Etme Fonksiyonu
  const handleAcceptRequest = (request) => {
    const newClient = {
      id: String(Date.now()),
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.email,
      phone: request.phone,
      avatar: request.avatar,
      goal: request.goal,
      program_name: "Henüz Program Atanmadı",
      status: "active",
      compliance_rate: 100,
      starting_weight: request.weight,
      current_weight: request.weight,
      target_weight: request.weight - 5,
      height: request.height,
      age: request.age,
      gender: request.gender,
      body_fat: 20,
      active_package: request.requested_package,
      package_days_left: 90,
      daily_calories: 2000,
      protein_g: 150,
      carbs_g: 180,
      fat_g: 60,
      notes: [],
      weekly_logs: []
    };

    setClients((prev) => [newClient, ...prev]);
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
  };

  // Başvuruyu Reddetme Fonksiyonu
  const handleRejectRequest = (requestId) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Sekme Değiştirme Yönlendiricisi
  const navigateTab = (tab, id = null) => {
    if (id) {
      router.push(`/expert/clientfile?tab=${tab}&id=${id}`);
    } else {
      router.push(`/expert/clientfile?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 space-y-8 selection:bg-[#EA580C] selection:text-white">
      {/* Tab Navigasyon Barı */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#EA580C]/10 text-[#EA580C] rounded-2xl border border-[#EA580C]/20">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white">Danışan Yönetim Merkezi</h1>
            <p className="text-xs text-slate-400">Aktif Danışan Listesi & Gelen Başvurular</p>
          </div>
        </div>

        {/* Tab Butonları */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => navigateTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentTab === "list" || currentTab === "detail"
                ? "bg-[#EA580C] text-white shadow-lg shadow-[#EA580C]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users size={16} />
            <span>Danışanlarım ({clients.length})</span>
          </button>

          <button
            onClick={() => navigateTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              currentTab === "requests"
                ? "bg-[#EA580C] text-white shadow-lg shadow-[#EA580C]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus size={16} />
            <span>Yeni İstekler</span>
            {requests.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-extrabold ml-1">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dinamik İçerik Alanı */}
      {currentTab === "list" && (
        <PtClientList
          clients={clients}
          onSelectClient={(id) => navigateTab("detail", id)}
        />
      )}

      {currentTab === "requests" && (
        <NewRequests
          requests={requests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}

      {currentTab === "detail" && (
        <ClientDetailView
          clientId={selectedClientId}
          clients={clients}
          onBack={() => navigateTab("list")}
        />
      )}
    </div>
  );
}

export default function ClientFilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Yükleniyor...</div>}>
      <ClientFileContent />
    </Suspense>
  );
}