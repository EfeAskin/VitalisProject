"use client";

import React, { useState } from "react";
import { Send, Bot, Search, CheckCheck } from "lucide-react";

export default function MessagesTab() {
  const [activeChat, setActiveChat] = useState("ahmet");
  const [messageText, setMessageText] = useState("");
  
  const [chats, setChats] = useState({
    ahmet: {
      name: "Ahmet Yılmaz",
      role: "VIP Danışan - Kilo Verme Programı",
      online: true,
      avatarText: "AY",
      messages: [
        { id: 1, sender: "client", text: "Hocam merhaba, bugünkü beslenme programındaki lor peyniri miktarını akşam öğününe kaydırabilir miyim?", time: "14:20" },
        { id: 2, sender: "expert", text: "Merhaba Ahmet Bey, evet kaydırabilirsiniz. Toplam günlük protein miktarınızı koruduğunuz sürece bir problem olmayacaktır.", time: "14:25" },
        { id: 3, sender: "client", text: "Harika, teşekkürler! Antrenman sonrası kardiyoyu da tamamladım.", time: "14:28" }
      ]
    },
    ayse: {
      name: "Ayşe Çelik",
      role: "Danışan - Ketojenik Diyet",
      online: false,
      avatarText: "AÇ",
      messages: [
        { id: 1, sender: "client", text: "Dr. Hanım, yeni diyet listesindeki ara öğünler çok doyurucu geldi.", time: "Dün" },
        { id: 2, sender: "expert", text: "Sevindim Ayşe Hanım, kan şekerinizi dengede tutmak için özel olarak planladık.", time: "Dün" }
      ]
    },
    ai: {
      name: "Vitalis AI Klinik Asistanı",
      role: "Uzman Destek & Otomasyon Botu",
      online: true,
      avatarText: "AI",
      messages: [
        { id: 1, sender: "ai", text: "Sayın Uzman, Ahmet Yılmaz bugün günlük su hedefini ve makro takibini %100 tamamladı.", time: "09:00" },
        { id: 2, sender: "expert", text: "Harika, haftalık raporunu özetleyebilir misin?", time: "09:05" },
        { id: 3, sender: "ai", text: "Ahmet Yılmaz son 7 günde ortalama 2.300 kcal tüketti ve 4 antrenman seansını eksiksiz bitirdi.", time: "09:05" }
      ]
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "expert",
      text: messageText,
      time: "Şimdi"
    };

    setChats(prev => ({
      ...prev,
      [activeChat]: {
        ...prev[activeChat],
        messages: [...prev[activeChat].messages, newMsg]
      }
    }));

    setMessageText("");

    // Otomatik Simülasyon Yanıtı (Danışan veya AI)
    setTimeout(() => {
      const isAi = activeChat === "ai";
      const replyMsg = {
        id: Date.now() + 1,
        sender: isAi ? "ai" : "client",
        text: isAi 
          ? "Isteğiniz işlendi. Klinik veriler güncellendi." 
          : "Anladım hocam, söylediğiniz şekilde uygulayacağım. Teşekkürler!",
        time: "Şimdi"
      };

      setChats(prev => ({
        ...prev,
        [activeChat]: {
          ...prev[activeChat],
          messages: [...prev[activeChat].messages, replyMsg]
        }
      }));
    }, 1200);
  };

  const currentChatData = chats[activeChat];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] animate-fadeIn">
      
      {/* SOL SOHBET LİSTESİ */}
      <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input 
              type="text" 
              placeholder="Danışan veya mesaj ara..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2 flex-grow overflow-y-auto">
          
          {/* Danışan / AI Sohbet Kartları */}
          {Object.keys(chats).map((chatKey) => {
            const item = chats[chatKey];
            const isSelected = activeChat === chatKey;
            const isAi = chatKey === "ai";

            return (
              <div 
                key={chatKey}
                onClick={() => setActiveChat(chatKey)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                  isSelected 
                    ? isAi 
                      ? "bg-blue-600/10 border-blue-500/40 text-white" 
                      : "bg-emerald-600/10 border-emerald-500/40 text-white"
                    : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 text-slate-300"
                }`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-xs ${
                    isAi 
                      ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
                      : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                  }`}>
                    {isAi ? <Bot className="w-5 h-5" /> : item.avatarText}
                  </div>
                  {item.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  )}
                </div>

                <div className="flex-grow overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black truncate">{item.name}</h4>
                    {isAi && <span className="text-[9px] text-blue-400 font-bold">BOT</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.messages[item.messages.length - 1]?.text || "Henüz mesaj yok"}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* SAĞ AKTİF SOHBET PENCERESİ */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/40">
        
        {/* Sohbet Üst Başlık */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${
              activeChat === "ai" 
                ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            }`}>
              {activeChat === "ai" ? <Bot className="w-4 h-4" /> : currentChatData.avatarText}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{currentChatData.name}</h4>
              <p className="text-[10px] text-slate-400">{currentChatData.role}</p>
            </div>
          </div>
          {currentChatData.online && (
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
              ● Çevrim İçi
            </span>
          )}
        </div>

        {/* Mesaj Akışı */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[380px] flex-grow">
          {currentChatData.messages.map((msg) => {
            const isExpert = msg.sender === "expert";

            return (
              <div 
                key={msg.id} 
                className={`flex ${isExpert ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-md p-4 rounded-3xl text-xs space-y-1 ${
                  isExpert 
                    ? "bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/20" 
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm"
                }`}>
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 text-[9px] ${
                    isExpert ? "text-blue-200" : "text-slate-500"
                  }`}>
                    <span>{msg.time}</span>
                    {isExpert && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mesaj Gönderme Kutusu */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <input 
            type="text"
            placeholder={activeChat === "ai" ? "AI Asistana komut yazın..." : "Danışana mesaj yanıtı yazın..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit"
            className="w-11 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}