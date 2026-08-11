"use client";
// src/app/expert/programs/components/WorkoutTemplateBuilder.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Dumbbell, Video, Upload, FileVideo } from "lucide-react";
import MuscleSelector from "./MuscleSelector";

export default function WorkoutTemplateBuilder({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Başlangıç");
  const [duration, setDuration] = useState("");
  const [targetMuscles, setTargetMuscles] = useState([]); // örn: ["chest_upper", "arm_triceps"]
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || "");
      setLevel(initialData.level || "Başlangıç");
      setDuration(initialData.duration || "");
      setTargetMuscles(initialData.targetMuscles || []);
      setExercises(initialData.exercises || []);
    } else if (isOpen) {
      setTitle("");
      setLevel("Başlangıç");
      setDuration("");
      setTargetMuscles([]);
      setExercises([{ id: Date.now(), name: "", sets: "", reps: "", mediaType: "none", mediaLink: "", mediaFile: null }]);
    }
  }, [isOpen, initialData]);

  // Modal açıkken arka planın kaymasını / hareket etmesini engelle
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: "", sets: "", reps: "", mediaType: "none", mediaLink: "", mediaFile: null }]);
  };

  const updateExercise = (id, field, value) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const ALLOWED_EXTENSIONS = ["mp4", "webm", "gif"];

  const handleFileSelect = (id, file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert("Sadece .mp4, .webm veya .gif uzantılı dosyalar yüklenebilir.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, mediaFile: file, mediaLink: previewUrl } : ex))
    );
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      title,
      level,
      duration: Number(duration),
      targetMuscles,
      exercises,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111827] border border-slate-700 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col text-sm">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#111827]/95 backdrop-blur z-20 flex justify-between items-center px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white">
              {initialData ? "Şablonu Düzenle" : "Yeni Antrenman Şablonu"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Elit danışanlarınız için kusursuz bir program tasarlayın.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-6">
          {/* Üst Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Program Adı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Hipertrofi Göğüs & Biceps"
                className="w-full bg-[#182134] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Zorluk Seviyesi</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#182134] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#EA580C] outline-none appearance-none"
              >
                <option value="Başlangıç">Başlangıç Seviye</option>
                <option value="Orta Seviye">Orta Seviye</option>
                <option value="İleri Seviye">İleri Seviye</option>
                <option value="Elit Atlet">Elit Atlet</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tahmini Süre (Dk)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Örn: 45"
                className="w-full bg-[#182134] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#EA580C] outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Hedef Kas Grupları & Anatomi */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Hedef Kas Grupları</h3>
            <MuscleSelector selectedMuscles={targetMuscles} onChange={setTargetMuscles} />
          </div>

          {/* Egzersiz Listesi */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Dumbbell size={16} className="text-[#EA580C]" />
                Egzersiz Listesi
              </h3>
              <button
                onClick={addExercise}
                className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:text-orange-400 transition-colors"
              >
                <Plus size={14} />
                Hareket Ekle
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, index) => (
                <div key={ex.id} className="bg-[#182134] border border-slate-700 rounded-xl p-4 relative group">
                  <div className="absolute -left-2.5 -top-2.5 bg-[#EA580C] text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-[3px] border-[#111827] shadow-lg">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-1.5">
                    <div className="lg:col-span-4 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Hareket Adı
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Incline Bench Press"
                        value={ex.name}
                        onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
                        className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Set</label>
                      <input
                        type="number"
                        placeholder="Örn: 4"
                        value={ex.sets}
                        onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                        className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tekrar</label>
                      <input
                        type="text"
                        placeholder="Örn: 10-12"
                        value={ex.reps}
                        onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                        className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
                      />
                    </div>
                    <div className="lg:col-span-4 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <Video size={11} />
                        Medya Seçimi
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={ex.mediaType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateExercise(ex.id, "mediaType", newType);
                            updateExercise(ex.id, "mediaLink", "");
                            updateExercise(ex.id, "mediaFile", null);
                          }}
                          className="w-1/3 bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#EA580C]"
                        >
                          <option value="none">Yok</option>
                          <option value="youtube">YouTube</option>
                          <option value="file">Dosya</option>
                        </select>

                        <div className="w-2/3">
                          {ex.mediaType === "youtube" && (
                            <input
                              type="text"
                              placeholder="YouTube URL Yapıştırın..."
                              value={ex.mediaLink}
                              onChange={(e) => updateExercise(ex.id, "mediaLink", e.target.value)}
                              className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
                            />
                          )}

                          {ex.mediaType === "file" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id={`media-file-${ex.id}`}
                                accept=".mp4,.webm,.gif,video/mp4,video/webm,image/gif"
                                onChange={(e) => handleFileSelect(ex.id, e.target.files?.[0])}
                                className="hidden"
                              />
                              <label
                                htmlFor={`media-file-${ex.id}`}
                                className="flex items-center justify-center gap-1.5 w-full bg-[#0B1120] border border-dashed border-slate-600 hover:border-[#EA580C] text-slate-300 hover:text-white text-xs rounded-lg p-2.5 cursor-pointer transition-colors"
                              >
                                <Upload size={12} />
                                {ex.mediaFile ? "Değiştir" : "Dosya Seç (.mp4 / .webm / .gif)"}
                              </label>
                            </div>
                          )}

                          {ex.mediaType === "none" && (
                            <input
                              type="text"
                              disabled
                              placeholder="Medya tipi seçin..."
                              className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none placeholder:text-slate-600 disabled:opacity-50"
                            />
                          )}
                        </div>
                      </div>

                      {ex.mediaType === "file" && ex.mediaFile && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                          <FileVideo size={11} className="text-[#EA580C]" />
                          <span className="truncate">{ex.mediaFile.name}</span>
                          <span className="text-slate-600">
                            ({(ex.mediaFile.size / (1024 * 1024)).toFixed(1)} MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-[#111827] flex justify-end gap-3 rounded-b-2xl sticky bottom-0 z-20">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            İptal Et
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs bg-gradient-to-r from-[#EA580C] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all"
          >
            <Save size={14} />
            Şablonu Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}