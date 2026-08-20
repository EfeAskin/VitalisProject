"use client";

import React, { useEffect, useState } from "react";
import {
  Folder,
  ChevronRight,
  User,
  Dumbbell,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowLeft
} from "lucide-react";

export default function AssignedProgramsList({ onSelectProgram, onBack }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssigned = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        typeof window !== "undefined"
          ? (
              localStorage.getItem("token") ||
              localStorage.getItem("vitalis_token") ||
              localStorage.getItem("accessToken")
            )
          : null;

      const res = await fetch(
        "/api/client/programs/assigned",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          cache: "no-store"
        }
      );

      if (res.ok) {
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : (
              data.programs ||
              data.data ||
              []
            );

        console.log(
          "[AssignedProgramList] Atanmış programlar:",
          list
        );

        setPrograms(
          Array.isArray(list)
            ? list
            : []
        );
      }

      else if (res.status === 401) {
        setError(
          "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın."
        );
      }

      else {
        setError(
          "Atanmış programlar yüklenirken bir sorun oluştu."
        );
      }

    } catch (err) {
      console.error(
        "Programlar çekilemedi:",
        err
      );

      setError(
        "Sunucuya bağlanırken bir hata oluştu."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  // =========================================================
  // YÜKLENME
  // =========================================================

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-3">
        <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />

        <p className="text-xs font-bold text-emerald-200/60 tracking-wider uppercase animate-pulse">
          Veritabanından Atanmış Programlarınız Yükleniyor...
        </p>
      </div>
    );
  }

  // =========================================================
  // HATA
  // =========================================================

  if (error) {
    return (
      <div className="space-y-4 max-w-md mx-auto my-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#0E1E17] border border-emerald-500/30 text-amber-400 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        )}

        <div className="bg-[#0E1E17]/90 rounded-2xl p-6 border border-rose-500/30 text-center space-y-3 shadow-xl backdrop-blur-md">

          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />

          <p className="text-rose-200 text-xs font-medium leading-relaxed">
            {error}
          </p>

          <button
            onClick={fetchAssigned}
            className="mt-2 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl hover:bg-emerald-500/30 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tekrar Deneyin
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // PROGRAM YOK
  // =========================================================

  if (
    !programs ||
    programs.length === 0
  ) {
    return (
      <div className="space-y-4 max-w-lg mx-auto my-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#0E1E17] border border-emerald-500/30 text-amber-400 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        )}

        <div className="bg-[#0E1E17]/80 rounded-2xl p-10 border border-emerald-500/20 text-center shadow-2xl backdrop-blur-md space-y-3">

          <Folder className="w-12 h-12 text-emerald-400/40 mx-auto" />

          <h4 className="text-sm font-bold text-white">
            Atanmış Program Yok
          </h4>

          <p className="text-emerald-100/60 text-xs font-medium leading-relaxed">
            Henüz eğitmeniniz tarafından size atanmış aktif bir antrenman programı bulunmuyor.
          </p>

          <button
            onClick={fetchAssigned}
            className="mt-2 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl hover:bg-emerald-500/30 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Yenile
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // PROGRAMLAR
  // =========================================================

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* Geri Dön Butonu */}
      {onBack && (
        <div className="flex items-center justify-start mb-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#0E1E17] border border-emerald-500/30 text-amber-400 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {programs.map((prog, index) => {

          // -----------------------------------------------------
          // PROGRAM ID
          // -----------------------------------------------------

          const targetId =
            prog?.id ??
            prog?.workout_program_id ??
            prog?.program_id ??
            prog?._id ??
            prog?.template_id;

          // -----------------------------------------------------
          // PROGRAM BİLGİLERİ
          // -----------------------------------------------------

          const title =
            prog?.title ||
            prog?.name ||
            prog?.workout_template?.name ||
            "Antrenman Programı";

          const description =
            prog?.description ||
            prog?.workout_template?.description ||
            "Eğitmeniniz tarafından hazırlanan antrenman programı.";

          const trainerName =
            prog?.trainer_name ||
            prog?.trainer?.full_name ||
            prog?.coach_name ||
            "Özel Eğitmen";

          const duration =
            prog?.duration_minutes ||
            prog?.workout_template?.duration_minutes;

          const difficulty =
            prog?.difficulty_level ||
            prog?.workout_template?.difficulty_level;

          const templateId =
            prog?.template_id ||
            prog?.workout_template?.id ||
            null;

          // -----------------------------------------------------
          // CLICK
          // -----------------------------------------------------

          const handleSelect = () => {

            if (!targetId) {
              console.error(
                "[AssignedProgramList] Program ID bulunamadı:",
                prog
              );

              return;
            }

            console.log(
              "[AssignedProgramList] Program seçildi:",
              {
                id: targetId,
                template_id: templateId,
                title
              }
            );

            /*
             * Parent mevcut sisteminde sadece ID bekliyorsa
             * ID gönderiyoruz.
             *
             * Böylece mevcut kullanım bozulmaz.
             */
            if (onSelectProgram) {
              onSelectProgram(targetId);
            }
          };

          return (
            <div
              key={
                targetId ||
                `assigned-program-${index}`
              }

              onClick={handleSelect}

              className="bg-[#0E1E17]/90 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group shadow-xl hover:shadow-emerald-950/60 backdrop-blur-xl relative overflow-hidden"
            >

              {/* Arka Plan Glow Efekti */}

              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

              {/* Sol İçerik */}

              <div className="flex items-start gap-4 min-w-0 pr-2 z-10">

                {/* Sol İkon Kutusu */}

                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300 shadow-inner mt-0.5">

                  <Dumbbell className="w-6 h-6 transition-transform group-hover:rotate-12" />

                </div>

                {/* Orta Metin */}

                <div className="min-w-0 space-y-2">

                  <div>

                    <h3 className="text-white font-black text-sm group-hover:text-emerald-300 transition-colors truncate tracking-wide">
                      {title}
                    </h3>

                    <p className="text-xs text-emerald-100/60 mt-0.5 line-clamp-2 font-medium leading-relaxed">
                      {description}
                    </p>

                  </div>

                  {/* Rozetler */}

                  <div className="flex flex-wrap items-center gap-2 pt-1">

                    {/* Eğitmen */}

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">

                      <User className="w-3 h-3 text-emerald-400 shrink-0" />

                      <span className="truncate">
                        {trainerName}
                      </span>

                    </div>

                    {/* Süre */}

                    {duration && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-100/70 font-semibold bg-black/40 border border-emerald-500/20 px-2 py-1 rounded-md">

                        <Clock className="w-3 h-3 text-emerald-400" />

                        <span>
                          {duration} dk
                        </span>

                      </div>
                    )}

                    {/* Zorluk */}

                    {difficulty && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-100/70 font-semibold bg-black/40 border border-emerald-500/20 px-2 py-1 rounded-md">

                        <Sparkles className="w-3 h-3 text-emerald-400" />

                        <span>
                          {difficulty}
                        </span>

                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Sağ Ok */}

              <div className="shrink-0 z-10 pl-2">

                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition-all">

                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}