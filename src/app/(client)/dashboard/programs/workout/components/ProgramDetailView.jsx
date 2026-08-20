"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Play,
  Loader2,
  AlertCircle,
  Dumbbell,
  ShieldCheck,
  Zap,
  X,
  Clock,
  Target,
  Video,
} from "lucide-react";

export default function ProgramDetailView({ programId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Clean ID hesaplama
  const cleanId = useMemo(() => {
    if (programId === null || programId === undefined) return null;

    if (typeof programId === "object") {
      const id =
        programId.id ??
        programId.program_id ??
        programId.workout_program_id ??
        programId.template_id ??
        programId._id;

      return id !== null && id !== undefined ? String(id) : null;
    }

    return String(programId);
  }, [programId]);

  // Video URL'sini YouTube/Vimeo Embed formatına dönüştüren güvenli sistem
  const { embedUrl, isEmbedIframe } = useMemo(() => {
    if (!selectedVideo) return { embedUrl: null, isEmbedIframe: false };

    const str = String(selectedVideo).trim();
    if (!str) return { embedUrl: null, isEmbedIframe: false };

    // YouTube URL Yakalama (Watch, Shorts, Embed, Youtu.be)
    const ytMatch = str.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return {
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        isEmbedIframe: true,
      };
    }

    // Vimeo URL Yakalama
    const vimeoMatch = str.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        isEmbedIframe: true,
      };
    }

    // Doğrudan Video Dosyaları (.mp4, .webm, .mov)
    const lower = str.split("?")[0].toLowerCase();
    if (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg") ||
      lower.endsWith(".mov")
    ) {
      return { embedUrl: str, isEmbedIframe: false };
    }

    // Diğer Dış Bağlantılar İçin Varsayılan Iframe Fallback
    return { embedUrl: str, isEmbedIframe: true };
  }, [selectedVideo]);

  // Program detaylarını veritabanından çekme
  useEffect(() => {
    const controller = new AbortController();

    const fetchDetail = async () => {
      if (!cleanId) {
        setLoading(false);
        setError("Geçersiz program kimliği.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("vitalis_token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(`/api/client/programs/${cleanId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          setError("Program detayları yüklenemedi.");
          return;
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Sunucu bağlantı hatası.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    return () => controller.abort();
  }, [cleanId]);

  // ESC Tuşu ile Modal Kapatma
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col justify-center items-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-xs font-black tracking-widest text-amber-300/70 animate-pulse">
          VERİTABANINDAN ANTRENMAN VERİLERİ ÇEKİLİYOR...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-10 rounded-3xl bg-[#0E1E17] border border-rose-500/30 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
        <p className="text-white font-bold">{error}</p>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const program = data?.program || data;
  const exercises = data?.exercises || [];

  return (
    <div className="max-w-6xl mx-auto pb-14 space-y-7">
      
      {/* 🎬 Video İzleme Modalı (YouTube / Vimeo / MP4 Embed Destekli) */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-[#11142D] border border-slate-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video size={16} className="text-[#EA580C]" /> Egzersiz Form Videosu
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner relative">
              {embedUrl ? (
                isEmbedIframe ? (
                  <iframe 
                    src={embedUrl} 
                    title="Egzersiz Form Videosu" 
                    className="w-full h-full border-0 rounded-2xl" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={embedUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain rounded-2xl"
                  />
                )
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs font-semibold">
                  Bu egzersiz için henüz geçerli bir video bağlantısı eklenmemiş.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Geri Dön Butonu */}
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-[#0E1E17] border border-emerald-500/30 text-amber-400 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri Dön
      </button>

      {/* Program Başlık Kartı */}
      <div className="rounded-3xl p-8 md:p-9 bg-gradient-to-br from-[#121B16] to-black border border-amber-500/25">
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[9px] font-black tracking-wider">
            PERSONAL PROGRAM
          </span>

          {program?.difficulty_level && (
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-[9px] font-black tracking-wider uppercase">
              {program.difficulty_level}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white">
          {program?.title || program?.name}
        </h1>

        {program?.description && (
          <p className="text-emerald-100/60 text-sm mt-3 max-w-3xl leading-relaxed">
            {program.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          {program?.duration_minutes && (
            <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 flex gap-2 items-center">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white font-medium">
                {program.duration_minutes} dk
              </span>
            </div>
          )}

          {program?.target_muscles && (
            <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 flex gap-2 items-center">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-white font-medium">
                {Array.isArray(program.target_muscles)
                  ? program.target_muscles.join(", ")
                  : program.target_muscles}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hareketler Başlık Alanı */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
        <div className="flex gap-3 items-center">
          <Dumbbell className="text-amber-400 w-5 h-5" />
          <h3 className="font-black text-white text-base tracking-wider uppercase">
            HAREKETLER
          </h3>
        </div>

        <span className="text-emerald-300 text-xs font-bold tracking-wider">
          {exercises.length} HAREKET
        </span>
      </div>

      {/* Hareket Listesi */}
      <div className="space-y-4">
        {exercises.map((ex, index) => (
          <div
            key={ex.id || index}
            className="p-6 rounded-3xl bg-[#0E1E17] border border-emerald-500/20 flex items-center justify-between gap-5 hover:border-emerald-500/40 transition-all"
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex gap-3 items-center">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-xs shrink-0">
                  {index + 1}
                </span>

                <h4 className="font-black text-white text-base md:text-lg">
                  {ex.exercise_name || ex.name}
                </h4>
              </div>

              {(ex.sets || ex.reps) && (
                <div className="flex gap-2 items-center text-emerald-300 text-xs font-bold">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {ex.sets} Set × {ex.reps} Tekrar
                </div>
              )}

              {ex.notes && (
                <p className="text-amber-300 text-xs font-medium">
                  💡 Tüyo: {ex.notes}
                </p>
              )}

              {ex.instructions && (
                <p className="text-emerald-100/60 text-xs leading-relaxed">
                  {ex.instructions}
                </p>
              )}
            </div>

            {/* Video Açma Butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (ex.video_url) {
                  setSelectedVideo(ex.video_url);
                }
              }}
              disabled={!ex.video_url}
              className={`w-13 h-13 p-3.5 rounded-2xl border flex items-center justify-center shrink-0 transition-all ${
                ex.video_url
                  ? "bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black cursor-pointer shadow-lg hover:scale-105"
                  : "bg-white/5 border-white/10 text-white/20 cursor-not-allowed opacity-40"
              }`}
              title={ex.video_url ? "Videoyu İzle" : "Video Mevcut Değil"}
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Rehber Kutusu */}
      <div className="p-5 rounded-2xl bg-[#0E1E17] border border-emerald-500/20 flex gap-4 items-start">
        <ShieldCheck className="text-emerald-400 w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-emerald-300 font-black text-xs uppercase tracking-wider">
            PROFESYONEL FORM & EMNİYET REHBERİ
          </h5>
          <p className="text-emerald-100/60 text-xs mt-1 leading-relaxed">
            Antrenmandan maksimum verim almak ve sakatlık riskini azaltmak için
            hareketleri kontrollü ve doğru formda uygulayın.
          </p>
        </div>
      </div>
    </div>
  );
}  