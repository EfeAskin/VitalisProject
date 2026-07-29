"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Scale,
  Target,
  Flame,
  Activity,
  FileText,
  Dumbbell,
  Apple,
  TrendingUp,
  Edit3,
  Send,
  Calendar,
  Clock,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

export default function ClientDetailView({ clientId, clients, onBack }) {
  const client = clients.find((c) => c.id === clientId) || clients[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(client?.notes || []);

  if (!client) return <div className="text-slate-400">Danışan bulunamadı.</div>;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      text: newNote,
      author: "Uzman PT"
    };

    setNotes([noteObj, ...notes]);
    setNewNote("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#EA580C] uppercase bg-[#EA580C]/10 px-2.5 py-0.5 rounded-md border border-[#EA580C]/20">
                DANIŞAN DOSYASI #{client.id}
              </span>
              <span className="text-xs text-slate-500 font-bold">• Kalan: {client.package_days_left} Gün</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
              {client.first_name} {client.last_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-2 transition-all">
            <MessageSquare className="w-4 h-4 text-[#EA580C]" />
            <span>Mesaj Gönder</span>
          </button>
          <button className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#EA580C]/20">
            <Sparkles className="w-4 h-4" />
            <span>Programı Güncelle</span>
          </button>
        </div>
      </div>

      {/* BİYOMETRİK METRİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={client.avatar}
              alt={client.first_name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#EA580C] p-1 bg-slate-950 shadow-xl"
            />
            <div>
              <h3 className="text-lg font-black text-white">{client.first_name} {client.last_name}</h3>
              <p className="text-xs text-slate-400">{client.email}</p>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {client.active_package}
            </span>
          </div>

          <div className="space-y-3 border-t border-b border-slate-800 py-4 text-xs font-medium text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Yaş / Cinsiyet:</span>
              <span className="text-white font-bold">{client.age} / {client.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Boy:</span>
              <span className="text-white font-bold">{client.height} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mevcut Program:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[140px]">{client.program_name}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">KİLO GELİŞİMİ</p>
                <h4 className="text-2xl font-black text-white mt-1">{client.current_weight} <span className="text-xs text-slate-400 font-normal">kg</span></h4>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Scale size={20} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">HEDEF KİLO</p>
                <h4 className="text-2xl font-black text-white mt-1">{client.target_weight} <span className="text-xs text-slate-400 font-normal">kg</span></h4>
              </div>
              <div className="p-2.5 bg-[#EA580C]/10 text-[#EA580C] rounded-2xl border border-[#EA580C]/20">
                <Target size={20} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase">GÜNLÜK HEDEF</p>
                <h4 className="text-2xl font-black text-white mt-1">{client.daily_calories} <span className="text-xs text-slate-400 font-normal">kcal</span></h4>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Flame size={20} />
              </div>
            </div>
          </div>

          <div className="sm:col-span-3 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#EA580C]" />
              Aktivite & Diyet Özeti
            </h4>
            <div className="grid grid-cols-7 gap-2 text-center">
              {client.weekly_logs?.map((log, index) => (
                <div key={index} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-xs font-bold text-slate-400 block">{log.day}</span>
                  <span className="text-[10px] font-extrabold text-slate-300 block">{log.weight}kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NOTLAR VE EYLEMLER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#EA580C]" />
          Uzman Notları & Değerlendirmeler
        </h3>

        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Danışan hakkında teknik not ekleyin..."
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-4 rounded-2xl outline-none focus:border-[#EA580C]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#EA580C] text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Send size={14} />
              <span>NOTU KAYDET</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>{note.author}</span>
                <span>{note.date}</span>
              </div>
              <p className="text-xs text-slate-300">{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}