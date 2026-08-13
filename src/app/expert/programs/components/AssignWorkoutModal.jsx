"use client";

import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Check, Loader2, Send } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'Pzt', label: 'Pazartesi' },
  { id: 'Sal', label: 'Salı' },
  { id: 'Çar', label: 'Çarşamba' },
  { id: 'Per', label: 'Perşembe' },
  { id: 'Cum', label: 'Cuma' },
  { id: 'Cmt', label: 'Cumartesi' },
  { id: 'Paz', label: 'Pazar' },
];

export default function AssignWorkoutModal({ isOpen, onClose, workoutTemplate }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActiveClients();
      setSelectedClients([]);
      setSelectedDays([]);
    }
  }, [isOpen]);

  const fetchActiveClients = async () => {
    try {
      setLoadingClients(true);
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await fetch('/api/expert/my-active-clients', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Danışanlar yüklenirken hata:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const toggleDaySelection = (dayId) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleAssign = async () => {
    if (selectedClients.length === 0) {
      alert("Lütfen en az bir danışan seçin.");
      return;
    }
    if (selectedDays.length === 0) {
      alert("Lütfen programın uygulanacağı en az bir gün seçin.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await fetch('/api/expert/assign-workout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: workoutTemplate?.id,
          client_ids: selectedClients,
          assigned_days: selectedDays
        })
      });

      if (res.ok) {
        alert("Antrenman programı danışan(lar)ın haftalık takvimine başarıyla atandı!");
        onClose();
      } else {
        alert("Atama işlemi sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error("Atama hatası:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1F37] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#11142D]/50">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="text-orange-500" size={20} /> Danışana Program Ata
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Şablon: <span className="text-orange-400 font-bold">{workoutTemplate?.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Danışan Seçimi */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 block">
              1. Danışan(lar)ı Seçin
            </label>
            {loadingClients ? (
              <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                <Loader2 size={20} className="animate-spin text-orange-500" /> Danışanlar yükleniyor...
              </div>
            ) : clients.length === 0 ? (
              <div className="text-xs text-slate-400 bg-[#11142D]/40 p-4 rounded-2xl border border-white/5 text-center">
                Aktif danışan bulunamadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {clients.map(client => {
                  const isSelected = selectedClients.includes(client.id);
                  return (
                    <div
                      key={client.id}
                      onClick={() => toggleClientSelection(client.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0.15)] text-white' 
                          : 'bg-[#11142D]/40 border-white/5 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-600'}`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{client.full_name}</p>
                          <p className="text-[11px] text-slate-400">{client.package} • {client.goal}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gün Seçimi (Haftalık İlerleme Uyumu İçin) */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 block">
              2. Haftanın Hangi Günleri Yapılacak?
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDaySelection(day.id)}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]'
                        : 'bg-[#11142D]/40 text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span>{day.id}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              * Seçilen günler danışanın panelindeki "Haftalık Antrenman İlerlemesi" takvimiyle senkronize edilir.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#11142D]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            İptal
          </button>
          <button
            type="button"
            disabled={isSubmitting || selectedClients.length === 0 || selectedDays.length === 0}
            onClick={handleAssign}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-[#EA580C] hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Atamayı Tamamla
          </button>
        </div>

      </div>
    </div>
  );
}