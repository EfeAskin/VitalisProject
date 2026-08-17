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
  MessageSquare 
} from "lucide-react";

// Gelişmiş Token Okuma Yardımcısı
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

    if (candidate && candidate !== "undefined" && candidate !== "null" && candidate.trim() !== "") {
      return candidate.startsWith("Bearer ") ? candidate.replace("Bearer ", "").trim() : candidate.trim();
    }
  }

  if (typeof window === "undefined" || typeof document === "undefined") return null;

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
      let t = decodeURIComponent(match[1]).trim();
      if (t && t !== "undefined" && t !== "null") {
        if (t.startsWith("Bearer ")) t = t.replace("Bearer ", "");
        return t;
      }
    }
  }

  return null;
};

// İstek Başlıklarını Oluşturan Yardımcı Fonksiyon
const getAuthHeaders = (currentUser, contentType = null) => {
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const token = getAuthToken(currentUser);
  if (token) {
    headers["Authorization"] = `Bearer ${token.replace(/^Bearer\s+/i, "")}`;
  } else {
    console.warn("⚠️ [Auth Uyarısı] İstek için geçerli Token bulunamadı!");
  }

  return headers;
};

export default function MessagesTab({ currentUser = null }) {
  const [activeChat, setActiveChat] = useState("ai");
  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal ve Kişi Listesi Durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Dinamik Veriler
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatInfo, setActiveChatInfo] = useState({
    name: "Vitalis AI Asistan",
    role: "Yapay Zeka Antrenman & Beslenme Koçu",
    online: true,
    avatar: null,
    isAi: true
  });

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null); // Sadece sohbet kutusunu yönlendirecek ref

  // Sadece sohbet içindeki akışı aşağı kaydıran fonksiyon
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // 1. SOHBET LİSTESİNİ ÇEKME
  const fetchChatList = useCallback(async () => {
    if (!currentUser?.id && !currentUser?._id && !currentUser?.user_id) return;
    try {
      const res = await fetch("/api/v1/messages/chats", { 
        method: "GET",
        headers: getAuthHeaders(currentUser),
        credentials: "include" 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setChatList(data.chats || []);
        }
      }
    } catch (err) {
      console.error("Sohbet listesi yüklenemedi:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  // Active Chat Bilgisini Güncelleme
  useEffect(() => {
    if (activeChat === "ai") {
      setActiveChatInfo({
        name: "Vitalis AI Asistan",
        role: "Yapay Zeka Antrenman & Beslenme Koçu",
        online: true,
        avatar: null,
        isAi: true
      });
    } else {
      const selectedRoom = chatList.find((c) => String(c.chat_id) === String(activeChat));
      if (selectedRoom) {
        setActiveChatInfo({
          name: selectedRoom.counterpart.name,
          role: selectedRoom.counterpart.role || "Uzman Koç",
          online: true,
          avatar: selectedRoom.counterpart.avatar,
          isAi: false
        });
      }
    }
  }, [activeChat, chatList]);

  // 2. KİŞİ LİSTESİ MODALINI AÇMA
  const openNewMessageModal = async () => {
    setIsModalOpen(true);
    setLoadingContacts(true);

    try {
      const res = await fetch("/api/v1/messages/available-contacts", {
        method: "GET",
        headers: getAuthHeaders(currentUser),
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setAvailableContacts(data.contacts || []);
        }
      }
    } catch (err) {
      console.error("Kişi listesi alınamadı:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // 3. YENİ SOHBET BAŞLATMA
  const startChatWithUser = async (targetUserId) => {
    try {
      const res = await fetch("/api/v1/messages/initiate", {
        method: "POST",
        headers: getAuthHeaders(currentUser, "application/json"),
        credentials: "include",
        body: JSON.stringify({ target_id: targetUserId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.room_id) {
          setIsModalOpen(false);
          await fetchChatList();
          setActiveChat(data.room_id);
          setMobileChatOpen(true);
        }
      }
    } catch (err) {
      console.error("Sohbet başlatılamadı:", err);
    }
  };

  // 4. SOHBET GEÇMİŞİ VE WEBSOCKET BAĞLANTISI
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (activeChat === "ai") {
      setMessages([
        {
          id: "ai-welcome",
          sender: "ai",
          text: "Merhaba! Bugün antrenmandan sonra su tüketimin ve protein dengen harika gidiyor. Nasıl yardımcı olabilirim?",
          time: "Şimdi"
        }
      ]);
      return;
    }

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/v1/messages/rooms/${activeChat}`, { 
          method: "GET",
          headers: getAuthHeaders(currentUser),
          credentials: "include" 
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            const currentUserId = currentUser?.id || currentUser?._id || currentUser?.user_id;
            const mappedMsgs = data.messages.map((m) => ({
              id: m.id,
              sender: (m.sender_id && currentUserId && m.sender_id === currentUserId) || m.is_me ? "user" : "expert",
              text: m.content || m.message_text,
              time: m.timestamp || (m.created_at ? new Date(m.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "Şimdi")
            }));
            setMessages(mappedMsgs);
          }
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
      const backendHost =
        process.env.NEXT_PUBLIC_WS_URL ||
        `${wsProtocol}//localhost:8000`;

      const wsUrl =
        `${backendHost}/api/v1/messages/ws/${activeChat}` +
        `?user_id=${currentUserId}` +
        `${token ? `&token=${encodeURIComponent(token)}` : ""}`;

      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_message") {
            setMessages((prev) => [
              ...prev,
              {
                id: data.id || Date.now(),
                sender: data.sender_id === currentUserId ? "user" : "expert",
                text: data.content || data.message_text,
                time: data.timestamp || new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
              }
            ]);
            fetchChatList();
          }
        } catch (e) {
          console.error("WebSocket mesaj hatası:", e);
        }
      };

      ws.onerror = (err) => console.error("WebSocket bağlantı hatası:", err);
      socketRef.current = ws;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeChat, currentUser, fetchChatList]);

  // 5. MESAJ GÖNDERME
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const currentText = messageText.trim();
    setMessageText("");

    if (activeChat === "ai") {
      const userMsg = {
        id: Date.now(),
        sender: "user",
        text: currentText,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        const aiReply = {
          id: Date.now() + 1,
          sender: "ai",
          text: "Harika bir yaklaşım! Makro hedeflerini göz önünde tutarak disiplini elden bırakmayalım.",
          time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiReply]);
      }, 1000);

      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: currentText, message_text: currentText }));
    } else {
      try {
        const res = await fetch(`/api/v1/messages/rooms/${activeChat}/send`, {
          method: "POST",
          headers: getAuthHeaders(currentUser, "application/json"),
          credentials: "include",
          body: JSON.stringify({ message: currentText, message_text: currentText })
        });
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              id: data.message_id || Date.now(),
              sender: "user",
              text: currentText,
              time: data.timestamp || new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
            }
          ]);
          fetchChatList();
        }
      } catch (err) {
        console.error("Mesaj iletilemedi:", err);
      }
    }
  };

  const filteredChatList = chatList.filter((chat) =>
    chat.counterpart.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0B1310]/95 backdrop-blur-2xl border-2 border-emerald-500/40 hover:border-emerald-400/70 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-130px)] min-h-[550px] lg:h-[620px] animate-fadeIn transition-all duration-300 relative">
      
      {/* SOHBET LİSTESİ */}
      <div className={`lg:col-span-4 border-r-2 border-emerald-950/80 bg-[#060B09]/90 p-3 sm:p-4 flex flex-col justify-between h-full min-h-0 overflow-hidden ${
        mobileChatOpen ? "hidden lg:flex" : "flex"
      }`}>
        <div className="space-y-3 sm:space-y-4 flex-1 min-h-0 overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Sohbetler
            </h3>
            <button
              onClick={openNewMessageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Yeni Mesaj
            </button>
          </div>

          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 stroke-[2.5]" />
            <input 
              type="text" 
              placeholder="Mesajlarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0E1A16] border-2 border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 text-sm sm:text-xs text-white font-bold placeholder-emerald-600/70 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            
            {/* AI Asistan */}
            <div 
              onClick={() => {
                setActiveChat("ai");
                setMobileChatOpen(true);
              }}
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
                  <h4 className="text-xs font-black text-white truncate drop-shadow-md">Vitalis AI Asistan</h4>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-400/40 shrink-0">7/24</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-200/60 truncate mt-0.5">Yapay zeka koçun aktif</p>
              </div>
            </div>

            {/* Gerçek Kullanıcı Sohbetleri */}
            {filteredChatList.map((chat) => {
              const isSelected = String(activeChat) === String(chat.chat_id);
              const initials = chat.counterpart.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div 
                  key={chat.chat_id}
                  onClick={() => {
                    setActiveChat(chat.chat_id);
                    setMobileChatOpen(true);
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border-2 shadow-sm touch-manipulation ${
                    isSelected 
                      ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.01]" 
                      : "bg-[#0E1A16]/60 border-emerald-950 hover:border-amber-500/50 hover:bg-[#0E1A16] text-emerald-100/70"
                  }`}
                >
                  <div className="relative shrink-0">
                    {chat.counterpart.avatar && !chat.counterpart.avatar.includes("default_user") ? (
                      <img 
                        src={chat.counterpart.avatar} 
                        alt={chat.counterpart.name} 
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border-2 border-amber-300 object-cover shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        {initials || "UZ"}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#060B09] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white truncate drop-shadow-md">{chat.counterpart.name}</h4>
                      {chat.unread_count > 0 && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shrink-0 animate-bounce">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-200/60 truncate mt-0.5">
                      {chat.last_message}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        <div className="pt-3 border-t border-emerald-950/80 text-[10px] font-black text-emerald-400/80 uppercase tracking-wider flex items-center justify-between shrink-0">
          <span>Güvenli İletişim</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* SOHBET PENCERESİ */}
      <div className={`lg:col-span-8 flex flex-col justify-between h-full min-h-0 overflow-hidden bg-[#0D1613]/70 ${
        !mobileChatOpen ? "hidden lg:flex" : "flex"
      }`}>
        
        {/* Sohbet Üst Bilgisi (Header) - Sabit */}
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
              <h4 className="text-xs sm:text-sm font-black text-white drop-shadow-md truncate">{activeChatInfo.name}</h4>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-300/70 truncate">{activeChatInfo.role}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-400/60 text-emerald-300 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">
            ● Çevrim İçi
          </span>
        </div>

        {/* Mesaj Akışı (Kaydırılabilir İç Alan) */}
        <div ref={chatContainerRef} className="p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0 bg-[#070D0B]/50 custom-scrollbar">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full text-emerald-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Mesajlar yükleniyor...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-emerald-600 text-xs font-bold">
              Henüz mesaj bulunmuyor. Bir mesaj yazarak sohbeti başlatın.
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] sm:max-w-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs space-y-1.5 shadow-lg ${
                  msg.sender === "user" 
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-br-xs border border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.3)]" 
                    : "bg-[#14221D] border-2 border-emerald-500/30 text-emerald-50 font-extrabold rounded-bl-xs shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                }`}>
                  <p className="leading-relaxed drop-shadow-xs text-xs sm:text-xs">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 text-[9px] font-black ${msg.sender === "user" ? "text-slate-950" : "text-emerald-400/70"}`}>
                    <span>{msg.time}</span>
                    {msg.sender === "user" && <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gönder Formu - Sabit Alt Alan */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t-2 border-emerald-950/80 bg-[#0B1310] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={activeChatInfo.isAi ? "Vitalis AI Asistana soru sorun..." : `${activeChatInfo.name} kişisine mesaj yazın...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-[#0E1A16] border-2 border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl sm:rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white font-bold placeholder-emerald-600/70 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl sm:rounded-2xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black text-xs flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Gönder</span>
          </button>
        </form>
      </div>

      {/* YENİ MESAJ MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1310] border-2 border-emerald-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Yeni Sohbet Başlat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-400/70 hover:text-white p-1 rounded-lg hover:bg-[#0E1A16] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8 text-emerald-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">Kişiler yükleniyor...</span>
                </div>
              ) : availableContacts.length === 0 ? (
                <p className="text-center text-xs font-bold text-emerald-600/80 py-6">
                  Mesajlaşılabilecek kayıtlı uzman veya danışan bulunamadı.
                </p>
              ) : (
                availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => startChatWithUser(contact.id)}
                    className="p-3 bg-[#0E1A16] border border-emerald-950 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-xs border border-emerald-300">
                        {contact.first_name ? contact.first_name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{contact.first_name} {contact.last_name}</h4>
                        <p className="text-[10px] font-bold text-emerald-400/70">{contact.role || "Kullanıcı"}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
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