"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Video,
  MapPin,
  Loader2,
} from "lucide-react";

export default function UpcomingSession({
  userId: propUserId,
  userRole: propUserRole = "client",
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUpcomingSession = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          console.error(
            "❌ UpcomingSession: Token bulunamadı."
          );

          if (isMounted) {
            setSession(null);
            setLoading(false);
          }

          return;
        }

        // =====================================================
        // 1. ÖNCE GİRİŞ YAPMIŞ KULLANICIYI AL
        // =====================================================

        let userId = propUserId;
        let userRole = propUserRole;

        /*
         * Parent userId göndermiyorsa /api/auth/me üzerinden
         * gerçek kullanıcı ID'sini alıyoruz.
         */
        if (!userId) {
          console.log(
            "🔎 UpcomingSession: propUserId yok, /api/auth/me çağrılıyor..."
          );

          const meResponse = await fetch(
            "/api/auth/me",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              cache: "no-store",
            }
          );

          if (!meResponse.ok) {
            throw new Error(
              `/api/auth/me başarısız: ${meResponse.status}`
            );
          }

          const meData = await meResponse.json();

          console.log(
            "👤 UpcomingSession auth/me:",
            meData
          );

          /*
           * Projede auth/me response'u farklı şekillerde
           * dönebilecek ihtimaline karşı destekliyoruz:
           *
           * { id: 3, role: "client" }
           *
           * veya
           *
           * { user: { id: 3, role: "client" } }
           */

          const authenticatedUser =
            meData?.user || meData;

          userId =
            authenticatedUser?.id ??
            authenticatedUser?.user_id ??
            authenticatedUser?.userId;

          userRole =
            authenticatedUser?.role ||
            propUserRole ||
            "client";

          console.log(
            "✅ UpcomingSession userId:",
            userId
          );

          console.log(
            "✅ UpcomingSession userRole:",
            userRole
          );
        }

        if (!userId) {
          console.error(
            "❌ UpcomingSession: Kullanıcı ID'si alınamadı.",
            {
              propUserId,
              propUserRole,
            }
          );

          if (isMounted) {
            setSession(null);
            setLoading(false);
          }

          return;
        }

        // =====================================================
        // 2. ROLÜ BELİRLE
        // =====================================================

        const normalizedRole = String(
          userRole || "client"
        )
          .trim()
          .toLowerCase();

        const isClient =
          normalizedRole === "client";

        // =====================================================
        // 3. APPOINTMENTS ENDPOINT
        // =====================================================

        const endpoint = isClient
          ? `/api/appointments/client/${userId}`
          : `/api/appointments/expert/${userId}`;

        console.log(
          "📅 UpcomingSession appointments endpoint:",
          endpoint
        );

        const response = await fetch(
          endpoint,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Randevular alınamadı: HTTP ${response.status}`
          );
        }

        const responseData =
          await response.json();

        console.log(
          "📋 UpcomingSession appointments response:",
          responseData
        );

        // =====================================================
        // 4. RESPONSE ARRAY KONTROLÜ
        // =====================================================

        const appointments =
          Array.isArray(responseData)
            ? responseData
            : Array.isArray(
                responseData?.appointments
              )
            ? responseData.appointments
            : [];

        console.log(
          "📋 UpcomingSession toplam randevu:",
          appointments.length
        );

        if (!appointments.length) {
          console.log(
            "ℹ️ UpcomingSession: Randevu bulunamadı."
          );

          if (isMounted) {
            setSession(null);
          }

          return;
        }

        // =====================================================
        // 5. ŞU ANKİ ZAMAN
        // =====================================================

        const now = new Date();

        console.log(
          "🕐 UpcomingSession şimdi:",
          now.toString()
        );

        // =====================================================
        // 6. AKTİF STATUSLER
        // =====================================================

        const validStatuses = new Set([
          "pending",
          "approved",
          "confirmed",
          "onaylandı",
          "onaylandi",
          "onay bekliyor",
        ]);

        // =====================================================
        // 7. RANDEVULARI PARSE ET
        // =====================================================

        const upcomingAppointments =
          appointments
            .map((item) => {
              if (!item) {
                return null;
              }

              const statusValue = String(
                item.status ?? ""
              )
                .trim()
                .toLowerCase();

              console.log(
                "🔎 Randevu kontrol:",
                {
                  id: item.id,
                  date: item.appointment_date,
                  time: item.time_slot,
                  status: item.status,
                }
              );

              // Aktif olmayan randevuları çıkar
              if (!validStatuses.has(statusValue)) {
                return null;
              }

              // =================================================
              // TARİH
              // =================================================

              let dateStr = "";

              if (
                typeof item.appointment_date ===
                "string"
              ) {
                /*
                 * Örnek:
                 *
                 * 2026-08-19T00:00:00+00:00
                 *
                 * veya:
                 *
                 * 2026-08-19 00:00:00+00
                 */
                dateStr =
                  item.appointment_date
                    .split("T")[0]
                    .split(" ")[0];
              } else if (
                item.appointment_date
              ) {
                const parsedDate = new Date(
                  item.appointment_date
                );

                if (
                  !isNaN(
                    parsedDate.getTime()
                  )
                ) {
                  dateStr = `${parsedDate.getFullYear()}-${String(
                    parsedDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(
                    parsedDate.getDate()
                  ).padStart(2, "0")}`;
                }
              }

              if (!dateStr) {
                console.warn(
                  "⚠️ Randevunun tarihi okunamadı:",
                  item
                );

                return null;
              }

              // =================================================
              // SAAT
              // =================================================

              let startTime = "00:00";

              if (item.time_slot) {
                startTime = String(
                  item.time_slot
                )
                  .trim()
                  .split("-")[0]
                  .trim();

                /*
                 * 15:15:00 → 15:15
                 * 15:15 → 15:15
                 */
                if (
                  startTime.length >= 5
                ) {
                  startTime =
                    startTime.substring(
                      0,
                      5
                    );
                }
              }

              const timeMatch =
                startTime.match(
                  /^([01]\d|2[0-3]):([0-5]\d)$/
                );

              if (!timeMatch) {
                console.warn(
                  "⚠️ Randevunun saati okunamadı:",
                  item.time_slot
                );

                return null;
              }

              const [
                year,
                month,
                day,
              ] = dateStr
                .split("-")
                .map(Number);

              const hours = Number(
                timeMatch[1]
              );

              const minutes = Number(
                timeMatch[2]
              );

              const fullDateTime =
                new Date(
                  year,
                  month - 1,
                  day,
                  hours,
                  minutes,
                  0,
                  0
                );

              if (
                isNaN(
                  fullDateTime.getTime()
                )
              ) {
                return null;
              }

              console.log(
                "✅ Randevu parse edildi:",
                {
                  id: item.id,
                  status: statusValue,
                  date: dateStr,
                  time: startTime,
                  fullDateTime:
                    fullDateTime.toString(),
                }
              );

              return {
                ...item,
                normalizedStatus:
                  statusValue,
                startTimeFormatted:
                  startTime,
                fullDateTime,
              };
            })
            .filter(Boolean)

            // =================================================
            // 8. GELECEK RANDEVULAR
            // =================================================

            .filter(
              (item) =>
                item.fullDateTime > now
            )

            // =================================================
            // 9. EN YAKIN RANDEVU İLK SIRADA
            // =================================================

            .sort(
              (a, b) =>
                a.fullDateTime.getTime() -
                b.fullDateTime.getTime()
            );

        console.log(
          "📅 Gelecek aktif randevular:",
          upcomingAppointments
        );

        // =====================================================
        // 10. EN YAKIN RANDEVUYU SEÇ
        // =====================================================

        if (
          upcomingAppointments.length > 0
        ) {
          const nearest =
            upcomingAppointments[0];

          console.log(
            "🎯 UpcomingSession seçilen randevu:",
            nearest
          );

          if (isMounted) {
            setSession(nearest);
          }
        } else {
          console.log(
            "ℹ️ Gelecek aktif randevu bulunamadı."
          );

          if (isMounted) {
            setSession(null);
          }
        }
      } catch (error) {
        console.error(
          "❌ UpcomingSession hata:",
          error
        );

        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUpcomingSession();

    return () => {
      isMounted = false;
    };
  }, [propUserId, propUserRole]);

  // =========================================================
  // TARİH / SAAT FORMAT
  // =========================================================

  const formatSessionTime = (
    dateTimeObj,
    startTimeStr
  ) => {
    if (
      !dateTimeObj ||
      isNaN(dateTimeObj.getTime())
    ) {
      return startTimeStr || "";
    }

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(
      today.getDate() + 1
    );

    const isToday =
      dateTimeObj.toDateString() ===
      today.toDateString();

    const isTomorrow =
      dateTimeObj.toDateString() ===
      tomorrow.toDateString();

    if (isToday) {
      return `Bugün, ${startTimeStr}`;
    }

    if (isTomorrow) {
      return `Yarın, ${startTimeStr}`;
    }

    const dateFormatted =
      dateTimeObj.toLocaleDateString(
        "tr-TR",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );

    return `${dateFormatted}, ${startTimeStr}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="bg-[#0E1E17]/90 backdrop-blur-xl text-white rounded-3xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-emerald-500/35 flex items-center justify-center min-h-[180px]">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // =========================================================
  // RANDEVU YOK
  // =========================================================

  if (!session) {
    return (
      <div className="bg-[#0E1E17]/90 backdrop-blur-xl text-white rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-emerald-500/35 group relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
            Sıradaki Seans
          </span>

          <Calendar
            size={16}
            className="text-emerald-300/60"
          />
        </div>

        <p className="text-xs text-emerald-100/70 py-4 text-center font-medium">
          Planlanmış aktif bir seansınız bulunmuyor.
        </p>
      </div>
    );
  }

  // =========================================================
  // KİŞİ
  // =========================================================

  const personName =
    propUserRole === "client"
      ? session.expert_name ||
        "Uzman Görüşmesi"
      : session.client_name ||
        "Danışan Görüşmesi";

  const titleText = session.title
    ? `${session.title} - ${personName}`
    : personName;

  // =========================================================
  // GÖRÜŞME TÜRÜ
  // =========================================================

  const appType =
    session.appointment_type ||
    session.type ||
    "online";

  const isOnline =
    appType === "online";

  const activeLink = isOnline
    ? session.meeting_link ||
      session.zoom_link
    : session.location_link ||
      session.map_link;

  // =========================================================
  // PENDING
  // =========================================================

  const isPending = [
    "pending",
    "onay bekliyor",
  ].includes(
    String(
      session.normalizedStatus ||
        session.status
    )
      .trim()
      .toLowerCase()
  );

  // =========================================================
  // CARD
  // =========================================================

  return (
    <div className="bg-[#0E1E17]/90 backdrop-blur-xl text-white rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-emerald-500/35 hover:border-amber-400/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] group relative">

      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
            isPending
              ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          }`}
        >
          {isPending
            ? "Onay Bekliyor"
            : "Sıradaki Seans"}
        </span>

        <Calendar
          size={16}
          className="text-emerald-300/60 transition-colors duration-300 group-hover:text-amber-300"
        />
      </div>

      <h4 className="text-xs font-black leading-snug tracking-wide text-white transition-colors duration-300 group-hover:text-amber-200">
        {titleText}
      </h4>

      <p className="text-[11px] text-emerald-300/90 font-extrabold mt-2 flex items-center gap-2 tracking-wide">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />

        {formatSessionTime(
          session.fullDateTime,
          session.startTimeFormatted
        )}
      </p>

      <button
        className="w-full mt-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-white text-xs font-black py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-300/30 cursor-pointer"
        onClick={() => {
          if (activeLink) {
            window.open(
              activeLink,
              "_blank",
              "noopener,noreferrer"
            );
          } else {
            alert(
              isOnline
                ? "Görüşme bağlantısı henüz tanımlanmamış."
                : "Konum bağlantısı henüz tanımlanmamış."
            );
          }
        }}
      >
        {isOnline ? (
          <>
            <Video size={15} />
            Görüşmeye Katıl
          </>
        ) : (
          <>
            <MapPin size={15} />
            Konumu Görüntüle
          </>
        )}
      </button>
    </div>
  );
}