"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Bot,
  Sparkles,
  CheckCheck,
  Search,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  UserCheck,
  MessageSquare,
  Users
} from "lucide-react";

// =========================================================================
// AUTH TOKEN YARDIMCILARI
// =========================================================================

const getAuthToken = (currentUser) => {
  if (currentUser) {
    const candidate =
      currentUser.token ||
      currentUser.access_token ||
      currentUser.accessToken ||
      currentUser.jwt ||
      currentUser.auth_token ||
      currentUser.session?.access_token ||
      currentUser.session?.accessToken;

    if (
      candidate &&
      candidate !== "undefined" &&
      candidate !== "null" &&
      typeof candidate === "string" &&
      candidate.trim() !== ""
    ) {
      return candidate.startsWith("Bearer ")
        ? candidate.replace("Bearer ", "").trim()
        : candidate.trim();
    }
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const storageKeys = ["access_token", "token", "jwt", "accessToken", "auth_token"];

  for (const key of storageKeys) {
    const localVal = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (localVal && localVal !== "undefined" && localVal !== "null" && localVal.trim() !== "") {
      return localVal.startsWith("Bearer ") ? localVal.replace("Bearer ", "").trim() : localVal.trim();
    }
  }

  const cookieNames = ["access_token", "token", "jwt", "auth_token", "accessToken", "next-auth.session-token"];

  for (const name of cookieNames) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    if (match && match[1]) {
      let token = decodeURIComponent(match[1]).trim();
      if (token && token !== "undefined" && token !== "null") {
        if (token.startsWith("Bearer ")) token = token.replace("Bearer ", "");
        return token;
      }
    }
  }

  return null;
};

const getAuthHeaders = (currentUser, contentType = null) => {
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const token = getAuthToken(currentUser);
  if (token) {
    headers["Authorization"] = `Bearer ${token.replace(/^Bearer\s+/i, "")}`;
  } else {
    console.warn("⚠️ [Auth Uyarısı] Expert mesajlaşma isteği için geçerli Token bulunamadı!");
  }

  return headers;
};

// =========================================================================
// MESSAGES TAB
// =========================================================================

export default function MessagesTab({ currentUser = null }) {
  // Active Chat: "ai" veya sayısal room_id
  const [activeChat, setActiveChat] = useState("ai");
  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Yeni Danışana Mesaj Gönder Modal Durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Backend'den çekilen dinamik veriler
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeChatInfo, setActiveChatInfo] = useState({
    name: "Vitalis AI Klinik Asistanı",
    role: "Uzman Destek & Otomasyon Botu",
    online: true,
    avatar: null,
    isAi: true
  });

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Global Bildirim Güncelleme Tetikleyicisi (Navbar ve Üst Paneller İçin)
  const notifyNavbarUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("messagesRead"));
      window.dispatchEvent(new CustomEvent("unreadMessagesUpdated"));
    }
  };

  // =========================================================================
  // OKUNDU BİLGİSİNİ İLETEN VE ROZETLERİ SIFIRLAYAN YARDIMCI FONKSİYON
  // =========================================================================

  const markRoomAsRead = useCallback(
    async (roomId) => {
      if (!roomId || roomId === "ai") return;

      // 1. Sol listedeki ilgili oda için unread_count = 0 yap
      setChatList((prevList) =>
        prevList.map((chat) =>
          String(chat.chat_id) === String(roomId)
            ? { ...chat, unread_count: 0 }
            : chat
        )
      );

      // 2. Üst Navbar ve Global Bildirim Event'lerini Anında Tetikle
      notifyNavbarUpdate();

      // 3. Backend'e Okundu İsteği Gönder
      try {
        await fetch(`/api/v1/expert/messages/rooms/${roomId}/read`, {
          method: "POST",
          headers: getAuthHeaders(currentUser),
          credentials: "include"
        });
        notifyNavbarUpdate();
      } catch (err) {
        console.error("Okundu bilgisi iletilemedi:", err);
      }
    },
    [currentUser]
  );

  // =========================================================================
  // SADECE SOHBET KUTUSUNU EN ALTA KAYDIR
  // =========================================================================

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingHistory]);

  // =========================================================================
  // 1. DANIŞAN SOHBET LİSTESİNİ BACKEND'DEN ÇEKME
  // =========================================================================

  const fetchChatList = useCallback(async () => {
    if (!currentUser?.id && !currentUser?._id && !currentUser?.user_id) {
      return;
    }

    try {
      const res = await fetch("/api/v1/messages/chats", {
        method: "GET",
        headers: getAuthHeaders(currentUser),
        credentials: "include",
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          // Seçili aktif odayı anında okundu sayarak listeyi kaydet
          const updatedChats = (data.chats || []).map((chat) => {
            if (String(chat.chat_id) === String(activeChat)) {
              return { ...chat, unread_count: 0 };
            }
            return chat;
          });
          setChatList(updatedChats);
        }
      } else {
        console.error("Danışan sohbet listesi çekilirken hata:", res.status);
      }
    } catch (err) {
      console.error("Danışan sohbet listesi yüklenemedi:", err);
    }
  }, [currentUser, activeChat]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  // =========================================================================
  // SOHBETE GİRİLDİĞİNDE BİLDİRİMLERİ SIFIRLAMA VE OKUNDU İŞARETLEME
  // =========================================================================

  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);
    setMobileChatOpen(true);

    if (chatId !== "ai") {
      markRoomAsRead(chatId);
    } else {
      notifyNavbarUpdate();
    }
  };

  // =========================================================================
  // AKTİF SOHBET BİLGİSİNİ GÜNCELLE & OKUNDU İSTEĞİ
  // =========================================================================

  useEffect(() => {
    if (activeChat === "ai") {
      setActiveChatInfo({
        name: "Vitalis AI Klinik Asistanı",
        role: "Uzman Destek & Otomasyon Botu",
        online: true,
        avatar: null,
        isAi: true
      });
      return;
    }

    const selectedRoom = chatList.find((c) => String(c.chat_id) === String(activeChat));

    if (selectedRoom) {
      setActiveChatInfo({
        name: selectedRoom.counterpart?.name || "Danışan",
        role: selectedRoom.counterpart?.role || "Aktif Danışan",
        online: true,
        avatar: selectedRoom.counterpart?.avatar,
        isAi: false
      });
    }

    markRoomAsRead(activeChat);
  }, [activeChat, chatList, markRoomAsRead]);

  // =========================================================================
  // AÇIK SOHBETTE MESAJ SAYISI DEĞİŞTİĞİNDE OTOMATİK OKUNDU İŞARETLEME
  // =========================================================================

  useEffect(() => {
    if (activeChat && activeChat !== "ai" && messages.length > 0) {
      markRoomAsRead(activeChat);
    }
  }, [messages.length, activeChat, markRoomAsRead]);

  // =========================================================================
  // 2. AKTİF DANIŞAN LİSTESİNİ MODAL İÇİN ÇEKME
  // =========================================================================

  const openNewMessageModal = async () => {
    setIsModalOpen(true);
    setLoadingClients(true);

    try {
      const res = await fetch("/api/v1/expert/messages/available-contacts", {
        method: "GET",
        headers: getAuthHeaders(currentUser),
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setAvailableClients(data.contacts || []);
        }
      } else {
        console.error("Aktif danışan listesi alınamadı:", res.status);
      }
    } catch (err) {
      console.error("Danışan listesi alınamadı:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  // =========================================================================
  // 3. DANIŞANLA YENİ SOHBET BAŞLATMA
  // =========================================================================

  const startChatWithClient = async (targetClientId) => {
    try {
      const res = await fetch("/api/v1/expert/messages/initiate", {
        method: "POST",
        headers: getAuthHeaders(currentUser, "application/json"),
        credentials: "include",
        body: JSON.stringify({ target_id: targetClientId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.room_id) {
          setIsModalOpen(false);
          await fetchChatList();
          handleSelectChat(data.room_id);
        }
      } else {
        let errorData = null;
        try {
          errorData = await res.json();
        } catch {
          errorData = null;
        }
        console.error("Sohbet başlatılamadı:", res.status, errorData);
      }
    } catch (err) {
      console.error("Sohbet başlatılamadı:", err);
    }
  };

  // =========================================================================
  // 4. SEÇİLİ ODAYA GÖRE GEÇMİŞ MESAJLARI VE WEBSOCKET BAĞLANTISINI KURMA
  // =========================================================================

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (activeChat === "ai") {
      setLoadingHistory(false);
      setMessages([
        {
          id: "ai-welcome-1",
          sender: "ai",
          text: "Sayın Uzman, kayıtlı danışanlarınızın günlük su ve makro hedefleri sistem tarafından senkronize edildi.",
          time: "09:00"
        },
        {
          id: "ai-welcome-2",
          sender: "expert",
          text: "Teşekkürler, aktif danışan takibini başlatalım.",
          time: "09:05"
        }
      ]);
      return;
    }

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/v1/expert/messages/rooms/${activeChat}`, {
          method: "GET",
          headers: getAuthHeaders(currentUser),
          credentials: "include"
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            const currentUserId = currentUser?.id || currentUser?._id || currentUser?.user_id;
            const mappedMsgs = (data.messages || []).map((m) => ({
              id: m.id,
              sender:
                (m.sender_id && currentUserId && Number(m.sender_id) === Number(currentUserId)) || m.is_me
                  ? "expert"
                  : "client",
              text: m.content || m.message_text || "",
              time:
                m.timestamp ||
                (m.created_at
                  ? new Date(m.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
                  : "Şimdi")
            }));
            setMessages(mappedMsgs);
            markRoomAsRead(activeChat);
          }
        } else {
          console.error("Mesaj geçmişi alınamadı:", res.status);
        }
      } catch (err) {
        console.error("Mesaj geçmişi çekilemedi:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();

    const currentUserId = currentUser?.id || currentUser?._id || currentUser?.user_id;

    if (typeof window !== "undefined" && currentUserId) {
      const token = getAuthToken(currentUser);
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const backendHost = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//localhost:8000`;
      const wsUrl =
        `${backendHost}/api/v1/messages/ws/${activeChat}?user_id=${currentUserId}` +
        `${token ? `&token=${encodeURIComponent(token)}` : ""}`;

      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_message") {
            const senderId = Number(data.sender_id);
            const myUserId = Number(currentUserId);
            const isFromOther = senderId !== myUserId;

            setMessages((prev) => [
              ...prev,
              {
                id: data.id || Date.now(),
                sender: isFromOther ? "client" : "expert",
                text: data.content || data.message_text || "",
                time:
                  data.timestamp ||
                  new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
              }
            ]);

            if (isFromOther) {
              markRoomAsRead(activeChat);
            }

            fetchChatList();
          }
        } catch (e) {
          console.error("Gelen WebSocket mesajı okunamadı:", e);
        }
      };

      socketRef.current = ws;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [activeChat, currentUser, fetchChatList, markRoomAsRead]);

  // =========================================================================
  // 5. MESAJ GÖNDERME İŞLEMİ
  // =========================================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const currentText = messageText.trim();
    setMessageText("");

    if (activeChat === "ai") {
      const expertMsg = {
        id: Date.now(),
        sender: "expert",
        text: currentText,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, expertMsg]);

      setTimeout(() => {
        const aiReply = {
          id: Date.now() + 1,
          sender: "ai",
          text: "Talebiniz kaydedildi. Klinik veriler ve danışan analiz tablosu güncellendi.",
          time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiReply]);
      }, 1000);

      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message: currentText,
          message_text: currentText
        })
      );
      return;
    }

    try {
      const res = await fetch(`/api/v1/expert/messages/rooms/${activeChat}/send`, {
        method: "POST",
        headers: getAuthHeaders(currentUser, "application/json"),
        credentials: "include",
        body: JSON.stringify({
          message: currentText,
          message_text: currentText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id || Date.now(),
            sender: "expert",
            text: currentText,
            time:
              data.timestamp ||
              new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        fetchChatList();
      } else {
        console.error("Danışana mesaj iletilemedi:", res.status);
      }
    } catch (err) {
      console.error("Danışana mesaj iletilemedi:", err);
    }
  };

  // =========================================================================
  // ARAMA
  // =========================================================================

  const filteredChatList = chatList.filter((chat) =>
    (chat.counterpart?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================================================================
  // UI
  // =========================================================================

  return (
    <div className="bg-[#0B1310]/95 backdrop-blur-2xl border-2 border-emerald-500/40 hover:border-emerald-400/70 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-130px)] min-h-[550px] lg:h-[620px] animate-fadeIn transition-all duration-300 relative">
      
      {/* SOL SOHBET LİSTESİ */}
      <div
        className={`lg:col-span-4 border-r-2 border-emerald-950/80 bg-[#060B09]/90 p-3 sm:p-4 flex flex-col justify-between h-full min-h-0 overflow-hidden ${
          mobileChatOpen ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="space-y-3 sm:space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Üst Başlık & Yeni Mesaj */}
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Danışan Mesajları
            </h3>
            <button
              onClick={openNewMessageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Yeni Mesaj
            </button>
          </div>

          {/* Arama Kutusu */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Danışan veya mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0E1A16] border-2 border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 text-sm sm:text-xs text-white font-bold placeholder-emerald-600/70 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Chat Kişi/AI Listesi */}
          <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            {/* AI KLİNİK ASİSTANI */}
            <div
              onClick={() => handleSelectChat("ai")}
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border-2 shadow-sm touch-manipulation ${
                activeChat === "ai"
                  ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.01]"
                  : "bg-[#0E1A16]/60 border-emerald-950 hover:border-emerald-500/50 hover:bg-[#0E1A16] text-emerald-100/70"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-300 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Bot className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#060B09] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white truncate drop-shadow-md">
                    Vitalis AI Klinik
                  </h4>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-400/40 shrink-0">
                    BOT
                  </span>
                </div>
                <p className="text-[10px] font-bold text-emerald-200/60 truncate mt-0.5">
                  Klinik otomasyon aktif
                </p>
              </div>
            </div>

            {/* DİNAMİK DANIŞAN LİSTESİ */}
            {filteredChatList.map((chat) => {
              const isSelected = String(activeChat) === String(chat.chat_id);
              const counterpartName = chat.counterpart?.name || "Danışan";
              const initials = counterpartName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

              return (
                <div
                  key={chat.chat_id}
                  onClick={() => handleSelectChat(chat.chat_id)}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border-2 shadow-sm touch-manipulation ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.01]"
                      : "bg-[#0E1A16]/60 border-emerald-950 hover:border-emerald-500/50 hover:bg-[#0E1A16] text-emerald-100/70"
                  }`}
                >
                  <div className="relative shrink-0">
                    {chat.counterpart?.avatar && !chat.counterpart.avatar.includes("default_user") ? (
                      <img
                        src={chat.counterpart.avatar}
                        alt={counterpartName}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border-2 border-emerald-300 object-cover shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-300 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        {initials || "DŞ"}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#060B09] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white truncate drop-shadow-md">
                        {counterpartName}
                      </h4>
                      {chat.unread_count > 0 && !isSelected && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shrink-0 animate-bounce">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-200/60 truncate mt-0.5">
                      {chat.last_message || "Henüz mesaj yok"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="pt-3 border-t border-emerald-950/80 text-[10px] font-black text-emerald-400/80 uppercase tracking-wider flex items-center justify-between shrink-0">
          <span>Uzman Klinik Paneli</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* SAĞ AKTİF SOHBET PENCERESİ */}
      <div
        className={`lg:col-span-8 flex flex-col justify-between bg-[#0D1613]/70 h-full min-h-0 overflow-hidden ${
          !mobileChatOpen ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Sohbet Üst Başlık */}
        <div className="p-3 sm:p-4 border-b-2 border-emerald-950/80 flex items-center justify-between bg-[#0B1310]/95 backdrop-blur-md shadow-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileChatOpen(false)}
              className="lg:hidden p-2 -ml-1 text-emerald-400 hover:text-white rounded-xl bg-[#0E1A16] border border-emerald-500/30 flex items-center justify-center shrink-0 active:scale-95 transition-all"
              aria-label="Sohbet Listesine Dön"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-400 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 overflow-hidden">
              {activeChatInfo.isAi ? (
                <Bot className="w-5 h-5 stroke-[2.5]" />
              ) : activeChatInfo.avatar && !activeChatInfo.avatar.includes("default_user") ? (
                <img src={activeChatInfo.avatar} alt={activeChatInfo.name} className="w-full h-full object-cover" />
              ) : (
                activeChatInfo.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs sm:text-sm font-black text-white drop-shadow-md truncate">
                {activeChatInfo.name}
              </h4>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-300/70 truncate">
                {activeChatInfo.role}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-400/60 text-emerald-300 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">
            ● Çevrim İçi
          </span>
        </div>

        {/* Mesaj Akışı */}
        <div
          ref={chatContainerRef}
          className="p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0 bg-[#070D0B]/50 custom-scrollbar"
        >
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full text-emerald-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Mesaj geçmişi yükleniyor...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-emerald-600 text-xs font-bold">
              Henüz mesaj bulunmuyor. Bir mesaj yazarak sohbeti başlatabilirsiniz.
            </div>
          ) : (
            messages.map((msg) => {
              const isExpert = msg.sender === "expert";

              return (
                <div key={msg.id} className={`flex ${isExpert ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs space-y-1.5 shadow-lg ${
                      isExpert
                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black rounded-br-xs border border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                        : "bg-[#14221D] border-2 border-emerald-500/30 text-emerald-50 font-extrabold rounded-bl-xs shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    <p className="leading-relaxed drop-shadow-xs text-xs sm:text-xs">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] font-black ${
                        isExpert ? "text-slate-950" : "text-emerald-400/70"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isExpert && <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mesaj Gönderme Kutusu */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t-2 border-emerald-950/80 bg-[#0B1310]/95 backdrop-blur-md flex items-center gap-2 sm:gap-3 shrink-0"
        >
          <input
            type="text"
            placeholder={
              activeChatInfo.isAi
                ? "AI Klinik Asistana komut verin..."
                : `${activeChatInfo.name} kişisine mesaj yazın...`
            }
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-[#060B09] border-2 border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl sm:rounded-2xl px-3.5 py-3 text-sm sm:text-xs text-white font-bold placeholder-emerald-600/60 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-slate-950 font-black rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] shrink-0 border border-emerald-300 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* YENİ MESAJ BAŞLATMA MODAL'I */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1310] border-2 border-emerald-500/40 rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            {/* Modal Header */}
            <div className="p-4 border-b border-emerald-950 flex items-center justify-between bg-[#060B09]">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Danışanla Sohbet Başlat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-950/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-80 overflow-y-auto space-y-2.5 custom-scrollbar">
              {loadingClients ? (
                <div className="py-8 text-center text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Danışan listesi yükleniyor...
                </div>
              ) : availableClients.length === 0 ? (
                <div className="py-8 text-center text-emerald-600/80 text-xs font-bold">
                  Kayıtlı aktif danışan bulunamadı.
                </div>
              ) : (
                availableClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => startChatWithClient(client.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0E1A16]/80 hover:bg-emerald-500/10 border border-emerald-950 hover:border-emerald-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-white font-black text-xs overflow-hidden">
                        {client.avatar && !client.avatar.includes("default_user") ? (
                          <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          (client.name || "D").slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                          {client.name}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-400/70">
                          {client.role || "Danışan"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-950 bg-emerald-400 px-2 py-0.5 rounded-lg group-hover:bg-emerald-300 transition-colors">
                      Mesaj At
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}