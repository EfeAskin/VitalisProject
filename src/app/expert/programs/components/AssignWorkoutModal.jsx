"use client";

import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Check, Loader2, Send, Utensils, Dumbbell } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'Pzt', label: 'Pazartesi' },
  { id: 'Sal', label: 'Salı' },
  { id: 'Çar', label: 'Çarşamba' },
  { id: 'Per', label: 'Perşembe' },
  { id: 'Cum', label: 'Cuma' },
  { id: 'Cmt', label: 'Cumartesi' },
  { id: 'Paz', label: 'Pazar' },
];

const mapToDayId = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim().toLowerCase();

  if (s === 'pzt' || s.startsWith('pazartes') || s === 'monday' || s === 'mon' || s === '1') return 'Pzt';
  if (s === 'sal' || s.startsWith('sal') || s === 'tuesday' || s === 'tue' || s === '2') return 'Sal';
  if (s === 'çar' || s === 'car' || s.startsWith('çarş') || s.startsWith('cars') || s === 'wednesday' || s === 'wed' || s === '3') return 'Çar';
  if (s === 'per' || s.startsWith('perş') || s.startsWith('pers') || s === 'thursday' || s === 'thu' || s === '4') return 'Per';
  if (s === 'cum' || (s.startsWith('cum') && !s.startsWith('cumart')) || s === 'friday' || s === 'fri' || s === '5') return 'Cum';
  if (s === 'cmt' || s.startsWith('cumart') || s === 'saturday' || s === 'sat' || s === '6') return 'Cmt';
  if (s === 'paz' || (s.startsWith('pazar') && !s.startsWith('pazartes')) || s === 'sunday' || s === 'sun' || s === '7' || s === '0') return 'Paz';

  const found = DAYS_OF_WEEK.find(d => d.id.toLowerCase() === s || d.label.toLowerCase() === s);
  return found ? found.id : null;
};

// Obje içerisindeki gün verilerini derinlemesine (recursive) tarayan yardımcı fonksiyon
const extractDaysFromTemplate = (tpl) => {
  if (!tpl) return [];

  const foundDays = [];

  const traverse = (o) => {
    if (!o || typeof o !== 'object') return;

    if (Array.isArray(o)) {
      o.forEach(traverse);
      return;
    }

    // JSON string parsing kontrolü
    for (const [key, val] of Object.entries(o)) {
      let parsedVal = val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { parsedVal = JSON.parse(val); } catch (e) {}
      }

      const keyLower = key.toLowerCase();
      if (['day', 'day_name', 'day_type', 'day_label', 'days', 'day_types', 'assigned_days', 'daily_plans', 'schedule', 'meals'].includes(keyLower)) {
        if (typeof parsedVal === 'string' || typeof parsedVal === 'number') {
          const mapped = mapToDayId(parsedVal);
          if (mapped) foundDays.push(mapped);
        } else if (Array.isArray(parsedVal)) {
          parsedVal.forEach(item => {
            if (typeof item === 'string' || typeof item === 'number') {
              const mapped = mapToDayId(item);
              if (mapped) foundDays.push(mapped);
            } else if (typeof item === 'object' && item !== null) {
              const d = item.day || item.day_name || item.day_type || item.name || item.label || item.title || item.key;
              if (d) {
                const mapped = mapToDayId(d);
                if (mapped) foundDays.push(mapped);
              }
              traverse(item);
            }
          });
        } else if (typeof parsedVal === 'object' && parsedVal !== null) {
          traverse(parsedVal);
        }
      } else if (typeof parsedVal === 'object' && parsedVal !== null) {
        traverse(parsedVal);
      }
    }
  };

  traverse(tpl);
  return [...new Set(foundDays)];
};

const getAuthHeaders = () => {
  if (typeof window === "undefined") return { 'Content-Type': 'application/json' };

  let token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token || token === "null" || token === "undefined") {
    return { 'Content-Type': 'application/json' };
  }

  if (token.startsWith("Bearer ")) {
    token = token.substring(7);
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export default function AssignWorkoutModal({ isOpen, onClose, workoutTemplate }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDiet = Boolean(workoutTemplate?.isDiet);

  useEffect(() => {
    if (isOpen) {
      fetchActiveClients();
      setSelectedClients([]);

      if (isDiet && workoutTemplate) {
        const detectedDays = extractDaysFromTemplate(workoutTemplate);

        if (detectedDays.length > 0) {
          setSelectedDays(detectedDays);
        } else {
          setSelectedDays(['Pzt']);
        }
      } else {
        setSelectedDays([]);
      }
    }
  }, [isOpen, workoutTemplate, isDiet]);

  const fetchActiveClients = async () => {
    try {
      setLoadingClients(true);
      const res = await fetch('/api/expert/my-active-clients', {
        headers: getAuthHeaders()
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
    if (isDiet) return;
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
      alert("Şablonda tanımlı atanacak gün bulunamadı.");
      return;
    }

    try {
      setIsSubmitting(true);
      const headers = getAuthHeaders();

      const payload = {
        template_id: workoutTemplate?.id,
        diet_template_id: workoutTemplate?.id,
        client_ids: selectedClients,
        assigned_days: selectedDays
      };

      let primaryUrl = isDiet
        ? '/api/expert/assign-diet'
        : '/api/expert/assign-workout';

      let res = await fetch(primaryUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok && isDiet) {
        const fallbackUrls = ['/api/expert-diet-program/assign', '/api/expert/assign-workout'];
        for (const url of fallbackUrls) {
          if (res.ok) break;
          res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
          });
        }
      }

      if (res.ok) {
        const msg = isDiet
          ? "Diyet planı danışan(lar)ın haftalık takvimine başarıyla atandı!"
          : "Antrenman programı danışan(lar)ın haftalık takvimine başarıyla atandı!";
        alert(msg);
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Atama hatası: ${errData.detail || "İşlem gerçekleştirilemedi."}`);
      }
    } catch (err) {
      console.error("Atama hatası:", err);
      alert("Sunucu ile iletişim kurulurken bir hata oluştu.");
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
              {isDiet ? (
                <Utensils className="text-emerald-500" size={20} />
              ) : (
                <Dumbbell className="text-orange-500" size={20} />
              )}
              {isDiet ? "Danışana Diyet Planı Ata" : "Danışana Program Ata"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Şablon: <span className={isDiet ? "text-emerald-400 font-bold" : "text-orange-400 font-bold"}>
                {workoutTemplate?.title || workoutTemplate?.name}
              </span>
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
                <Loader2 size={20} className={`animate-spin ${isDiet ? 'text-emerald-500' : 'text-orange-500'}`} />
                Danışanlar yükleniyor...
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
                          ? isDiet
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white'
                            : 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0.15)] text-white' 
                          : 'bg-[#11142D]/40 border-white/5 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected 
                            ? isDiet ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-orange-500 border-orange-500 text-white'
                            : 'border-slate-600'
                        }`}>
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

          {/* Gün Seçimi */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 block">
              2. {isDiet ? "Şablonda Yer Alan Günler (Otomatik Atanır)" : "Haftanın Hangi Günleri Yapılacak?"}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    disabled={isDiet}
                    onClick={() => toggleDaySelection(day.id)}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? isDiet
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]'
                        : 'bg-[#11142D]/40 text-slate-400 border-white/5 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span>{day.id}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isDiet 
                ? "* Diyet şablonundaki tanımlı günler (yeşil renkte görünenler) otomatik olarak danışanın takvimine eşitlenir."
                : "* Seçilen günler danışanın panelindeki takvimle senkronize edilir."
              }
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
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-all ${
              isDiet
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-orange-500 to-[#EA580C] hover:from-orange-600 hover:to-orange-500 shadow-orange-500/20'
            }`}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Atamayı Tamamla
          </button>
        </div>

      </div>
    </div>
  );
}