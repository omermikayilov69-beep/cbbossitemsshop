import React from 'react';
import { ShieldAlert, Plus, Gift, Package, MessageSquare, Settings, LogOut, Sparkles } from 'lucide-react';
import { UserSession } from '../types';

interface AdminBarProps {
  userSession: UserSession | null;
  onOpenCreateItem: () => void;
  onOpenCreateCode: () => void;
  onOpenAdminPanel: (tab?: 'items' | 'codes') => void;
  onOpenChatModal: () => void;
  onLogout: () => void;
  unreadChatsCount: number;
  codesCount: number;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  userSession,
  onOpenCreateItem,
  onOpenCreateCode,
  onOpenAdminPanel,
  onOpenChatModal,
  onLogout,
  unreadChatsCount,
  codesCount,
}) => {
  if (userSession?.role !== 'admin') return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border-b-2 border-amber-500/50 px-4 py-2.5 shadow-xl sticky top-[4.5rem] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Admin Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
                YÖNETİCİ MODU AKTİF
              </span>
              <span className="bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                <span>YTCBBOSS</span>
                <span className="text-amber-400 font-mono text-[9px]">(@CBBOSSTEAM)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Roblox: <strong className="text-cyan-300">CBBOSSTEAM</strong> (Görünen Ad: <strong className="text-amber-300">YTCBBOSS</strong>) • İlan ekleme, promosyon kodu oluşturma ve canlı teslimat açık
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create Code Button (Highlight) */}
          <button
            id="adminbar-btn-create-code"
            onClick={onOpenCreateCode}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer ring-2 ring-amber-400/50"
            title="Yeni Promosyon Kodu Oluştur"
          >
            <Gift className="w-3.5 h-3.5 text-slate-950" />
            <span>🎁 Yeni Kod Oluştur</span>
          </button>

          {/* Manage Codes Button */}
          <button
            id="adminbar-btn-manage-codes"
            onClick={() => onOpenAdminPanel('codes')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kodları ve Stokları Yönet"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kodları Yönet ({codesCount})</span>
          </button>

          {/* Create Item Button */}
          <button
            id="adminbar-btn-create-item"
            onClick={onOpenCreateItem}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
            title="Yeni İlan Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni İlan Ekle</span>
          </button>

          {/* Live Delivery Chats */}
          <button
            id="adminbar-btn-live-chat"
            onClick={onOpenChatModal}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors relative cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Teslimat Sohbetleri</span>
            {unreadChatsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {unreadChatsCount}
              </span>
            )}
          </button>

          {/* Full Admin Panel */}
          <button
            id="adminbar-btn-panel"
            onClick={() => onOpenAdminPanel('items')}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Yönetici Paneli"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            id="adminbar-btn-logout"
            onClick={onLogout}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
            title="Admin Çıkışı"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
