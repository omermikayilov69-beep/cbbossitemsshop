import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { AdminBar } from './components/AdminBar';
import { ShopCatalog } from './components/ShopCatalog';
import { CartModal } from './components/CartModal';
import { AuthModals } from './components/AuthModals';
import { AdminPanel } from './components/AdminPanel';
import { ItemEditModal } from './components/ItemEditModal';
import { CodeRedeemModal } from './components/CodeRedeemModal';
import { CreateCodeModal } from './components/CreateCodeModal';
import { LiveChatModal } from './components/LiveChatModal';
import { ShopItem, CartItem, ItemCategory, UserSession } from './types';
import { api, ROBLOX_STORE_URL } from './services/api';
import { Sparkles, ShieldCheck, Heart, MessageSquare, Gift, ExternalLink } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ItemCategory | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserLoginOpen, setIsUserLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelInitialTab, setAdminPanelInitialTab] = useState<'items' | 'codes'>('items');
  const [isCreateCodeOpen, setIsCreateCodeOpen] = useState(false);
  const [codesCount, setCodesCount] = useState(0);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isCodeRedeemOpen, setIsCodeRedeemOpen] = useState(false);
  const [isItemEditOpen, setIsItemEditOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShopItem | null>(null);
  const [activeChatTicketId, setActiveChatTicketId] = useState<string | null>(null);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  // Load session from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cbboss_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'admin') {
          parsed.robloxUsername = 'CBBOSSTEAM';
          parsed.displayName = 'YTCBBOSS';
          parsed.name = 'YTCBBOSS';
          parsed.adminToken = parsed.adminToken || 'cbboss_admin_secret_token_9941';
          localStorage.setItem('cbboss_session', JSON.stringify(parsed));
        }
        setUserSession(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch Items
  const loadItems = async () => {
    try {
      const res = await api.getItems();
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Error fetching items', err);
    }
  };

  // Fetch codes count
  const loadCodesCount = async () => {
    try {
      const res = await api.getCodes(userSession?.adminToken);
      if (res.success && res.codes) {
        setCodesCount(res.codes.length);
      }
    } catch {
      // ignore
    }
  };

  // Poll for real-time items, codes & chat updates every 3 seconds
  useEffect(() => {
    loadItems();
    loadCodesCount();

    const interval = setInterval(() => {
      loadItems();
      loadCodesCount();
      // Check unread / open chats count
      if (userSession?.role === 'admin' || userSession?.robloxUsername) {
        api
          .getChats(userSession?.adminToken, userSession?.robloxUsername)
          .then((res) => {
            if (res.success && res.chats) {
              const pendingCount = res.chats.filter((c) => c.status === 'open').length;
              setUnreadChatsCount(pendingCount);
            }
          })
          .catch(() => {});
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userSession?.adminToken, userSession?.robloxUsername]);

  // Cart Management
  const handleAddToCart = (item: ShopItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        if (existing.quantity < item.stock) {
          return prev.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        }
        return prev;
      }
      return [...prev, { item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin Item Create / Edit
  const handleOpenCreateItem = () => {
    setItemToEdit(null);
    setIsItemEditOpen(true);
  };

  const handleOpenEditItem = (item: ShopItem) => {
    setItemToEdit(item);
    setIsItemEditOpen(true);
  };

  const handleSaveItem = async (itemData: any) => {
    const activeToken = userSession?.adminToken || 'cbboss_admin_secret_token_9941';

    if (itemToEdit) {
      // Update
      const res = await api.updateItem(activeToken, itemToEdit.id, itemData);
      if (res.success && res.item) {
        setItems((prev) => prev.map((i) => (i.id === itemToEdit.id ? res.item! : i)));
        setIsItemEditOpen(false);
        loadItems();
        return;
      }
      throw new Error(res.message || 'İlan güncellenemedi.');
    } else {
      // Create
      const res = await api.createItem(activeToken, itemData);
      if (res.success && res.item) {
        setItems((prev) => [res.item!, ...prev.filter((i) => i.id !== res.item!.id)]);
        setIsItemEditOpen(false);
        loadItems();
        return;
      }
      throw new Error(res.message || 'İlan eklenemedi.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz? Bu işlem tüm kullanıcılarda anında yansıyacaktır.')) return;
    const activeToken = userSession?.adminToken || 'cbboss_admin_secret_token_9941';

    try {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setCart((prev) => prev.filter((c) => c.item.id !== itemId));
      await api.deleteItem(activeToken, itemId);
      loadItems();
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };

  // Auth logout
  const handleLogout = () => {
    localStorage.removeItem('cbboss_session');
    setUserSession(null);
    setIsAdminPanelOpen(false);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartItemIds = useMemo(() => {
    return new Set(cart.map((c) => c.item.id));
  }, [cart]);

  // Open Live Chat to specific ticket
  const handleOpenLiveChatTicket = (ticketId: string) => {
    setActiveChatTicketId(ticketId);
    setIsLiveChatOpen(true);
  };

  // Open Admin Panel with specific tab
  const handleOpenAdminPanelWithTab = (tab: 'items' | 'codes' = 'items') => {
    setAdminPanelInitialTab(tab);
    setIsAdminPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCodeModal={() => setIsCodeRedeemOpen(true)}
        onOpenCreateCode={() => setIsCreateCodeOpen(true)}
        onOpenChatModal={() => setIsLiveChatOpen(true)}
        onOpenAdminModal={() => handleOpenAdminPanelWithTab('items')}
        onOpenUserLogin={() => setIsUserLoginOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        userSession={userSession}
        onLogout={handleLogout}
        unreadChatsCount={unreadChatsCount}
      />

      {/* Admin Quick Action Toolbar (Visible when Admin is logged in) */}
      <AdminBar
        userSession={userSession}
        onOpenCreateItem={handleOpenCreateItem}
        onOpenCreateCode={() => setIsCreateCodeOpen(true)}
        onOpenAdminPanel={handleOpenAdminPanelWithTab}
        onOpenChatModal={() => setIsLiveChatOpen(true)}
        onLogout={handleLogout}
        unreadChatsCount={unreadChatsCount}
        codesCount={codesCount}
      />

      {/* Main Catalog View */}
      <main className="flex-1">
        <ShopCatalog
          items={items}
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          onAddToCart={handleAddToCart}
          cartItemIds={cartItemIds}
          onEditItem={userSession?.role === 'admin' ? handleOpenEditItem : undefined}
          onDeleteItem={userSession?.role === 'admin' ? handleDeleteItem : undefined}
          onOpenCreateItem={userSession?.role === 'admin' ? handleOpenCreateItem : undefined}
          onOpenCreateCode={userSession?.role === 'admin' ? () => setIsCreateCodeOpen(true) : undefined}
          onOpenCodesManager={userSession?.role === 'admin' ? () => handleOpenAdminPanelWithTab('codes') : undefined}
          onOpenCodeModal={() => setIsCodeRedeemOpen(true)}
          userSession={userSession}
        />
      </main>

      {/* Quick Action Floating Pill (Mobile / Quick access) */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
        {userSession?.role === 'admin' && (
          <button
            id="floating-btn-admin-create-code"
            onClick={() => setIsCreateCodeOpen(true)}
            className="p-3 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 flex items-center gap-2 text-xs transition-transform active:scale-95 ring-2 ring-amber-400/50"
            title="Yeni Kod Oluştur"
          >
            <Gift className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">🎁 Kod Oluştur</span>
          </button>
        )}

        <button
          onClick={() => setIsCodeRedeemOpen(true)}
          className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-2 text-xs transition-transform active:scale-95"
          title="Kod Kullan"
        >
          <Gift className="w-4 h-4" />
          <span className="hidden sm:inline">Kod Kullan</span>
        </button>

        <button
          onClick={() => setIsLiveChatOpen(true)}
          className="p-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 text-xs transition-transform active:scale-95 relative"
          title="Canlı Sohbet & Teslimat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Canlı Sohbet</span>
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-slate-950">
              {unreadChatsCount}
            </span>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-300">CBBOSS SHOP</span>
            <span>•</span>
            <span>Roblox Steal a Brainrot & MM2 Mağazası</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={ROBLOX_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <span>Roblox Gamepass Mağazası</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Yönetici Paneli
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-600">
          Bu site CBBOSS (Ömer Mikayılov) tarafından yönetilmektedir. Roblox Corporation ile doğrudan bağlantılı değildir.
        </p>
      </footer>

      {/* MODALS */}
      {/* 1. Cart Modal with Checkout and Warning steps */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        userSession={userSession}
        onOpenUserLogin={() => setIsUserLoginOpen(true)}
        onOpenLiveChatTicket={handleOpenLiveChatTicket}
      />

      {/* 2. Auth Modals (Roblox User & Admin Login) */}
      <AuthModals
        isUserLoginOpen={isUserLoginOpen}
        isAdminLoginOpen={isAdminLoginOpen}
        onCloseUserLogin={() => setIsUserLoginOpen(false)}
        onCloseAdminLogin={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(session) => {
          setUserSession(session);
          if (session.role === 'admin') {
            handleOpenAdminPanelWithTab('items');
          }
        }}
      />

      {/* 3. Admin Panel Modal */}
      {userSession?.role === 'admin' && userSession.adminToken && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          adminToken={userSession.adminToken}
          items={items}
          initialTab={adminPanelInitialTab}
          onOpenCreateItem={handleOpenCreateItem}
          onOpenEditItem={handleOpenEditItem}
          onDeleteItem={handleDeleteItem}
          onOpenLiveChatWithTicket={handleOpenLiveChatTicket}
          onRefreshData={() => {
            loadItems();
            loadCodesCount();
          }}
        />
      )}

      {/* 4. Dedicated Create Code Modal (Admin) */}
      {userSession?.role === 'admin' && (
        <CreateCodeModal
          isOpen={isCreateCodeOpen}
          onClose={() => setIsCreateCodeOpen(false)}
          adminToken={userSession.adminToken || 'cbboss_admin_secret_token_9941'}
          items={items}
          onSuccessCreated={() => {
            loadCodesCount();
            loadItems();
          }}
          onOpenAdminPanelCodes={() => handleOpenAdminPanelWithTab('codes')}
        />
      )}

      {/* 5. Item Edit / Create Modal */}
      <ItemEditModal
        isOpen={isItemEditOpen}
        onClose={() => setIsItemEditOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      {/* 6. Code Redeem Modal */}
      <CodeRedeemModal
        isOpen={isCodeRedeemOpen}
        onClose={() => setIsCodeRedeemOpen(false)}
        userSession={userSession}
        onOpenUserLogin={() => setIsUserLoginOpen(true)}
        onOpenLiveChatTicket={handleOpenLiveChatTicket}
        onSuccessRedeem={() => {
          loadItems();
          loadCodesCount();
        }}
        onOpenCreateCode={() => setIsCreateCodeOpen(true)}
      />

      {/* 7. Live Chat Modal */}
      <LiveChatModal
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        userSession={userSession}
        activeTicketId={activeChatTicketId}
        onSelectTicket={setActiveChatTicketId}
        onOpenUserLogin={() => setIsUserLoginOpen(true)}
      />
    </div>
  );
}
