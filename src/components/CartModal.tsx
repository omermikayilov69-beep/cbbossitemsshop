import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ExternalLink, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, UserSession } from '../types';
import { ROBLOX_STORE_URL, api } from '../services/api';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  userSession: UserSession | null;
  onOpenUserLogin: () => void;
  onOpenLiveChatTicket: (ticketId: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  userSession,
  onOpenUserLogin,
  onOpenLiveChatTicket,
}) => {
  // Step in checkout: 'cart' | 'instruction_warning' | 'congrats_success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'instruction_warning' | 'congrats_success'>('cart');
  const [robloxUsernameInput, setRobloxUsernameInput] = useState(userSession?.robloxUsername || '');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalPrice = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

  // Trigger purchase flow
  const handleProceedToWarning = () => {
    setError('');
    if (cart.length === 0) return;
    setCheckoutStep('instruction_warning');
  };

  // When user clicks the external store link
  const handleRedirectToRobloxStore = async () => {
    const finalUsername = userSession?.robloxUsername || robloxUsernameInput.trim();
    if (!finalUsername) {
      setError('Lütfen önce Roblox kullanıcı adınızı giriniz.');
      return;
    }

    // Open blank window immediately to prevent popup blocker blocking async window.open
    let storeWindow: Window | null = null;
    try {
      storeWindow = window.open('about:blank', '_blank');
    } catch {
      // fallback
    }

    setIsLoading(true);
    try {
      // Create order on backend
      const res = await api.createOrder({
        robloxUsername: finalUsername,
        items: cart.map((c) => ({
          itemId: c.item.id,
          title: c.item.title,
          category: c.item.category,
          price: c.item.price,
          quantity: c.quantity,
          image: c.item.image,
          rarity: c.item.rarity,
        })),
        totalPrice,
      });

      if (res.success) {
        setCurrentOrderId(res.orderId);
        setCurrentTicketId(res.ticketId);

        // Redirect popup or current window
        if (storeWindow && !storeWindow.closed) {
          storeWindow.location.href = ROBLOX_STORE_URL;
        } else {
          window.open(ROBLOX_STORE_URL, '_blank');
        }
      } else {
        if (storeWindow && !storeWindow.closed) storeWindow.close();
        setError(res.message || 'Sipariş oluşturulamadı.');
      }
    } catch {
      if (storeWindow && !storeWindow.closed) storeWindow.close();
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  // When user returns after buying gamepass
  const handleConfirmGamepassBought = async () => {
    if (!currentOrderId) {
      // If direct confirm without prior create
      const finalUsername = userSession?.robloxUsername || robloxUsernameInput.trim();
      if (!finalUsername) {
        setError('Lütfen Roblox kullanıcı adınızı belirtiniz.');
        return;
      }
      setIsLoading(true);
      try {
        const createRes = await api.createOrder({
          robloxUsername: finalUsername,
          items: cart.map((c) => ({
            itemId: c.item.id,
            title: c.item.title,
            category: c.item.category,
            price: c.item.price,
            quantity: c.quantity,
            image: c.item.image,
            rarity: c.item.rarity,
          })),
          totalPrice,
        });

        if (createRes.success) {
          await api.confirmGamepass(createRes.orderId);
          setCurrentOrderId(createRes.orderId);
          setCurrentTicketId(createRes.ticketId);
          triggerCongratsCelebration();
        }
      } catch {
        setError('İşlem sırasında hata oluştu.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.confirmGamepass(currentOrderId);
      if (res.success) {
        setCurrentTicketId(res.ticketId);
        triggerCongratsCelebration();
      } else {
        setError(res.message || 'Onaylanamadı.');
      }
    } catch {
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCongratsCelebration = () => {
    setCheckoutStep('congrats_success');
    onClearCart();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#f43f5e', '#6366f1', '#10b981'],
      });
    } catch {
      // fallback
    }
  };

  const handleGoToLiveChat = () => {
    onClose();
    if (currentTicketId) {
      onOpenLiveChatTicket(currentTicketId);
    }
  };

  const handleResetModal = () => {
    setCheckoutStep('cart');
    setCurrentOrderId(null);
    setCurrentTicketId(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl relative text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {checkoutStep === 'cart'
                  ? 'Sepetim (CBBOSS SHOP)'
                  : checkoutStep === 'instruction_warning'
                  ? 'Satın Alma Talimatı & Uyarı'
                  : 'Congrats! Tebrikler!'}
              </h3>
              <p className="text-xs text-slate-400">
                {checkoutStep === 'cart'
                  ? `${cart.length} çeşit ürün bulunuyor`
                  : checkoutStep === 'instruction_warning'
                  ? 'Lütfen kuralları dikkatle uygulayınız'
                  : 'Siparişiniz başarıyla alındı'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-cart-modal"
            onClick={handleResetModal}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS VIEW */}
        {checkoutStep === 'cart' && (
          <>
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="font-semibold text-sm">Sepetiniz şu anda boş.</p>
                  <p className="text-xs text-slate-500 mt-1">İlanlardan istediğiniz Brainrot veya MM2 itemini ekleyin.</p>
                </div>
              ) : (
                cart.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-800"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[11px] text-amber-400 font-bold">
                        {item.price} Robux{' '}
                        <span className="text-slate-400 font-normal">({item.category === 'mm2' ? 'MM2' : 'Brainrot'})</span>
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5 min-w-[1.2rem] text-center">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        disabled={quantity >= item.stock}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Toplam Tutar:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                      R$
                    </span>
                    <span className="text-xl font-black text-amber-400">{totalPrice} Robux</span>
                  </div>
                </div>

                <button
                  id="btn-cart-checkout-proceed"
                  onClick={handleProceedToWarning}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Satın Al</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: INSTRUCTION WARNING MODAL (As strictly requested by user prompt) */}
        {checkoutStep === 'instruction_warning' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Warning Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200">
              <div className="flex items-center gap-2 mb-2 font-black text-base text-amber-300">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>⚠️ DİKKAT: SATIN ALMA KURALLARI</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed mb-3">
                Ürünlerinizi oyun içinde eksiksiz teslim alabilmeniz için lütfen aşağıdaki 2 adımı sırasıyla uygulayın:
              </p>

              {/* Exact Rules from user prompt */}
              <div className="space-y-2.5 bg-black/40 p-3.5 rounded-xl border border-amber-500/30 text-xs font-semibold text-white">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="pt-0.5">
                    <span className="font-bold text-amber-300">1- Satın al'a tıklayın</span>
                    <p className="text-[11px] text-slate-300 font-normal">Aşağıdaki butona basarak resmi Roblox mağazamıza yönlendirileceksiniz.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="pt-0.5">
                    <span className="font-bold text-rose-300">2- Ürününüzün olduğu fiyata sahip olan game pass'i alın</span>
                    <p className="text-[11px] text-slate-300 font-normal">
                      Açılan Roblox sayfasında toplam <strong className="text-amber-400">{totalPrice} Robux</strong> değerindeki Gamepass'i satın alın.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Roblox username verification */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Teslimat Yapılacak Roblox Kullanıcı Adınız:
              </label>
              <input
                id="input-checkout-roblox-username"
                type="text"
                value={userSession?.robloxUsername || robloxUsernameInput}
                onChange={(e) => setRobloxUsernameInput(e.target.value)}
                placeholder="Örn: ProPlayer_TR"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Admin <strong className="text-amber-300">YTCBBOSS</strong> (Roblox: <span className="text-cyan-300 font-mono">@CBBOSSTEAM</span>) oyun içinde bu kullanıcı adına trade ile teslimat yapacaktır.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Satın Al Butonu - Leads to the exact URL specified */}
            <div className="space-y-2.5 pt-2">
              <button
                id="btn-redirect-roblox-gamepass"
                onClick={handleRedirectToRobloxStore}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-700 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Satın Al (Roblox Gamepass Sayfasına Git)</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Roblox linki: <a href={ROBLOX_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline font-mono inline-flex items-center gap-1">.../Youtube-CBBOSS#!/store <ExternalLink className="w-3 h-3 inline" /></a>
              </p>

              {/* Gamepass alındı confirmation */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  id="btn-confirm-gamepass-purchased"
                  onClick={handleConfirmGamepassBought}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Gamepass'i Satın Aldım, Geri Döndüm!</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONGRATS SUCCESS VIEW */}
        {checkoutStep === 'congrats_success' && (
          <div className="p-6 text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest inline-block mb-2">
                🎉 CONGRATS! BAŞARILI!
              </span>
              <h3 className="text-2xl font-black text-white">İşlem Başarılı!</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Gamepass alım işleminiz başarıyla sisteme kaydedildi! Şimdi admin (CBBOSS - Ömer Mikayılov) ile canlı sohbete bağlanıp brainrot veya MM2 eşyalarınızı oyun içinde teslim alabilirsiniz.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Roblox Kullanıcı Adı:</span>
                <span className="font-bold text-cyan-400">{userSession?.robloxUsername || robloxUsernameInput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Durum:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Canlı Teslimat Bekleniyor
                </span>
              </div>
            </div>

            <button
              id="btn-go-to-live-chat"
              onClick={handleGoToLiveChat}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Canlı Sohbete Git (Admin ile Konuş)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
