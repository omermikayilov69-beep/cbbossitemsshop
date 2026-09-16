import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, CheckCircle, ShieldAlert, Sparkles, User, RefreshCw, CheckCheck, Clock } from 'lucide-react';
import { ChatThread, ChatMessage, UserSession } from '../types';
import { api } from '../services/api';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  activeTicketId?: string | null;
  onSelectTicket?: (id: string) => void;
  onOpenUserLogin: () => void;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  isOpen,
  onClose,
  userSession,
  activeTicketId,
  onSelectTicket,
  onOpenUserLogin,
}) => {
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(activeTicketId || null);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = userSession?.role === 'admin';

  // Load chat list
  const fetchChats = async () => {
    try {
      const username = isAdmin ? undefined : userSession?.robloxUsername;
      const res = await api.getChats(userSession?.adminToken, username);
      if (res.success && res.chats) {
        setChatThreads(res.chats);

        // Auto select if none selected
        if (!selectedThreadId && res.chats.length > 0) {
          setSelectedThreadId(res.chats[0].id);
        } else if (activeTicketId) {
          setSelectedThreadId(activeTicketId);
        }
      }
    } catch (err) {
      console.error('Error fetching chats', err);
    }
  };

  // Load current selected thread
  const fetchCurrentThread = async (threadId: string) => {
    try {
      const res = await api.getChat(threadId);
      if (res.success && res.chat) {
        setCurrentThread(res.chat);
      }
    } catch (err) {
      console.error('Error fetching chat thread', err);
    }
  };

  // Poll for real-time updates every 1.5 seconds when open
  useEffect(() => {
    if (!isOpen) return;

    fetchChats();

    const interval = setInterval(() => {
      fetchChats();
      if (selectedThreadId) {
        fetchCurrentThread(selectedThreadId);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, selectedThreadId, userSession?.robloxUsername, userSession?.adminToken]);

  // When selected thread changes
  useEffect(() => {
    if (selectedThreadId) {
      fetchCurrentThread(selectedThreadId);
    }
  }, [selectedThreadId]);

  // Immediately switch thread if activeTicketId changes or modal opens
  useEffect(() => {
    if (activeTicketId && isOpen) {
      setSelectedThreadId(activeTicketId);
      fetchCurrentThread(activeTicketId);
    }
  }, [activeTicketId, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages]);

  if (!isOpen) return null;

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedThreadId) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const sender = isAdmin ? 'admin' : 'user';
      const senderName = isAdmin
        ? 'YTCBBOSS (@CBBOSSTEAM)'
        : (userSession?.robloxUsername || 'Müşteri');

      const res = await api.sendMessage(
        selectedThreadId,
        textToSend,
        sender,
        senderName,
        userSession?.adminToken
      );

      if (res.success && res.chat) {
        setCurrentThread(res.chat);
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setIsSending(false);
    }
  };

  // Mark delivered (Admin only)
  const handleMarkDelivered = async () => {
    if (!selectedThreadId || !isAdmin || !userSession?.adminToken) return;
    try {
      const res = await api.markDelivered(userSession.adminToken, selectedThreadId);
      if (res.success && res.chat) {
        setCurrentThread(res.chat);
        fetchChats();
      }
    } catch (err) {
      console.error('Error marking delivered', err);
    }
  };

  // Quick preset messages
  const sendQuickMessage = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl relative text-white flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">CBBOSS Canlı Sohbet & Teslimat</h3>
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Yönetici Canlı Destek ve Oyun İçi Teslimat Masası'
                  : 'Admin YTCBBOSS (@CBBOSSTEAM) ile anlık canlı görüşme'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchChats();
                if (selectedThreadId) fetchCurrentThread(selectedThreadId);
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="btn-close-chat-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar (Tickets) + Chat Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar (Tickets list) */}
          <div className="w-64 sm:w-72 border-r border-slate-800 bg-slate-950/50 flex flex-col hidden sm:flex">
            <div className="p-3 border-b border-slate-800/80 text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>{isAdmin ? 'Tüm Görüşmeler' : 'Görüşmeleriniz'}</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-300">
                {chatThreads.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {chatThreads.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Henüz aktif bir görüşme yok.
                </div>
              ) : (
                chatThreads.map((thread) => {
                  const isSelected = thread.id === selectedThreadId;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        if (onSelectTicket) onSelectTicket(thread.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500/50 text-white shadow-sm'
                          : 'bg-slate-900/40 hover:bg-slate-800/50 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-cyan-300 truncate">
                          {thread.robloxUsername}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            thread.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {thread.status === 'delivered' ? 'Teslim Edildi' : 'Bekliyor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{thread.title}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Chat Panel */}
          <div className="flex-1 flex flex-col bg-slate-900/60 justify-between">
            {currentThread ? (
              <>
                {/* Thread Header with Status & Action */}
                <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{currentThread.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentThread.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {currentThread.status === 'delivered' ? '✅ Teslim Edildi' : '⏳ Teslimat Bekleniyor'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Roblox Kullanıcı Adı: <strong className="text-cyan-400">{currentThread.robloxUsername}</strong>
                    </p>
                  </div>

                  {isAdmin && currentThread.status !== 'delivered' && (
                    <button
                      id="btn-admin-mark-delivered"
                      onClick={handleMarkDelivered}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Teslim Edildi Olarak İşaretle</span>
                    </button>
                  )}
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentThread.messages.map((msg) => {
                    const isMe =
                      (isAdmin && msg.sender === 'admin') ||
                      (!isAdmin && msg.sender === 'user');
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="max-w-md bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-center text-xs text-amber-300/90 shadow-sm leading-relaxed">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] font-semibold text-slate-400 mb-0.5 px-1">
                          {msg.senderName}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md'
                              : 'bg-slate-800 border border-slate-700/80 text-slate-100'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Preset quick message chips */}
                <div className="px-4 py-1.5 bg-slate-950/30 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">Hızlı Cevap:</span>
                  {(isAdmin
                    ? [
                        'Selam! Roblox hesabım @CBBOSSTEAM (YTCBBOSS), oyuna giriyorum ekle.',
                        'CBBOSSTEAM hesabımdan arkadaşlık isteği gönderdim, kabul et!',
                        'Server linkime gel lütfen.',
                        'Eşyan başarıyla trade ile verildi, tebrikler!',
                      ]
                    : [
                        'Selam, gamepassi aldım hazırım!',
                        'Roblox kullanıcı adım doğru, oyundayım.',
                        'Arkadaşlık isteğini gönderdim.',
                        'Teşekkür ederim aldım!',
                      ]
                  ).map((quick, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendQuickMessage(quick)}
                      className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md whitespace-nowrap border border-slate-700/50"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2"
                >
                  <input
                    id="input-chat-message"
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isAdmin
                        ? 'Müşteriye cevap yazın...'
                        : 'Admin Ömer’e mesajınızı yazın...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    id="btn-submit-chat-message"
                    type="submit"
                    disabled={isSending || !inputText.trim()}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Gönder</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="font-bold text-white text-base">Görüşme Seçin</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  {chatThreads.length > 0
                    ? 'Sol menüden bir sohbet odası seçerek konuşmayı başlatın.'
                    : 'Henüz açık bir görüşme bulunmuyor. Sepetten bir ürün alarak veya kod kullanarak anında canlı sohbete başlayabilirsiniz.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
