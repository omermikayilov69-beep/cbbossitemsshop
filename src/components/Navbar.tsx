import React from 'react';
import { ShoppingCart, MessageSquare, Gift, ShieldAlert, Sparkles, User, LogOut, Swords, BrainCircuit } from 'lucide-react';
import { ItemCategory, UserSession } from '../types';

interface NavbarProps {
  currentCategory: ItemCategory | 'all';
  onSelectCategory: (cat: ItemCategory | 'all') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenCodeModal: () => void;
  onOpenCreateCode?: () => void;
  onOpenChatModal: () => void;
  onOpenAdminModal: () => void;
  onOpenUserLogin: () => void;
  onOpenAdminLogin: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
  unreadChatsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenCodeModal,
  onOpenCreateCode,
  onOpenChatModal,
  onOpenAdminModal,
  onOpenUserLogin,
  onOpenAdminLogin,
  userSession,
  onLogout,
  unreadChatsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 tracking-wide">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>CBBOSS SHOP - Roblox Steal a Brainrot & MM2 Resmi İlan Mağazası | Hızlı Oyun İçi Teslimat</span>
        <span className="hidden sm:inline bg-black/30 px-2 py-0.5 rounded text-[11px] font-bold">Ömer Mikayılov</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div 
            onClick={() => onSelectCategory('all')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            id="btn-brand-home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-black text-lg">
                CB
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  CBBOSS <span className="text-rose-500">SHOP</span>
                </span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30 uppercase">
                  Roblox
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">Steal a Brainrot & MM2</p>
            </div>
          </div>

          {/* Navigation Categories */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-all"
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Tüm İlanlar
            </button>
            <button
              id="nav-tab-brainrot"
              onClick={() => onSelectCategory('steal-brainrot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentCategory === 'steal-brainrot'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-pink-400" />
              Steal a Brainrot
            </button>
            <button
              id="nav-tab-mm2"
              onClick={() => onSelectCategory('mm2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentCategory === 'mm2'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-cyan-400" />
              MM2 İtemleri
            </button>
            <button
              id="nav-tab-redeem-code"
              onClick={onOpenCodeModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 flex items-center gap-1.5 transition-all border border-amber-500/20"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              Kod Kullan
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Chat Button */}
            <button
              id="btn-open-live-chat"
              onClick={onOpenChatModal}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center gap-2 text-xs font-semibold"
              title="Admin Canlı Sohbet"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Canlı Sohbet</span>
              {unreadChatsCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                  {unreadChatsCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="btn-open-cart"
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Sepetim</span>
              <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[11px] font-extrabold min-w-[1.25rem] text-center">
                {cartCount}
              </span>
            </button>

            {/* User / Admin state */}
            {userSession?.role === 'admin' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Admin Profile Pill */}
                <div className="hidden lg:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-[10px] font-black text-slate-950">
                    👑
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-xs font-black text-amber-300 block">YTCBBOSS</span>
                    <span className="text-[10px] text-slate-400 font-mono block">@CBBOSSTEAM</span>
                  </div>
                </div>

                {onOpenCreateCode && (
                  <button
                    id="nav-btn-create-code"
                    onClick={onOpenCreateCode}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    title="Yeni Promosyon Kodu Oluştur"
                  >
                    <Gift className="w-3.5 h-3.5 text-slate-950" />
                    <span className="hidden md:inline">Kod Oluştur</span>
                    <span className="md:hidden">+Kod</span>
                  </button>
                )}
                <button
                  id="btn-open-admin-panel"
                  onClick={onOpenAdminModal}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Yönetici Paneli</span>
                  <span className="sm:hidden">Yönetici</span>
                </button>
                <button
                  id="btn-admin-logout"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : userSession?.role === 'user' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {userSession.robloxUsername?.slice(0, 2) || 'R'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[90px] sm:max-w-[120px] truncate">
                    {userSession.robloxUsername}
                  </span>
                </div>
                <button
                  id="btn-user-logout"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-user-login-trigger"
                  onClick={onOpenUserLogin}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Roblox Girişi</span>
                </button>
                <button
                  id="btn-admin-login-trigger"
                  onClick={onOpenAdminLogin}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800 text-xs font-medium transition-colors"
                  title="Admin Girişi (Ömer Mikayılov)"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Category row */}
        <div className="flex md:hidden items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-t border-slate-800/80">
          <button
            id="m-nav-tab-all"
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentCategory === 'all'
                ? 'bg-amber-500 text-white font-bold'
                : 'text-slate-400 bg-slate-900'
            }`}
          >
            Tümü
          </button>
          <button
            id="m-nav-tab-brainrot"
            onClick={() => onSelectCategory('steal-brainrot')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
              currentCategory === 'steal-brainrot'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 bg-slate-900'
            }`}
          >
            <BrainCircuit className="w-3 h-3 text-pink-400" />
            Steal a Brainrot
          </button>
          <button
            id="m-nav-tab-mm2"
            onClick={() => onSelectCategory('mm2')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
              currentCategory === 'mm2'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 bg-slate-900'
            }`}
          >
            <Swords className="w-3 h-3 text-cyan-400" />
            MM2 İtemleri
          </button>
          <button
            id="m-nav-tab-code"
            onClick={onOpenCodeModal}
            className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap text-amber-300 bg-amber-950/50 border border-amber-500/30 flex items-center gap-1"
          >
            <Gift className="w-3 h-3 text-amber-400" />
            Kod Kullan
          </button>
        </div>
      </div>
    </header>
  );
};
