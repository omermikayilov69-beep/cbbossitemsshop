import React, { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { UserSession } from '../types';

interface CodeRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  onOpenUserLogin: () => void;
  onOpenLiveChatTicket: (ticketId: string) => void;
  onSuccessRedeem?: () => void;
  onOpenCreateCode?: () => void;
}

export const CodeRedeemModal: React.FC<CodeRedeemModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onOpenUserLogin,
  onOpenLiveChatTicket,
  onSuccessRedeem,
  onOpenCreateCode,
}) => {
  const [code, setCode] = useState('');
  const [robloxUsernameInput, setRobloxUsernameInput] = useState(userSession?.robloxUsername || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rewardResult, setRewardResult] = useState<{
    rewardItem: string;
    remainingStock: number;
    ticketId: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUsername = userSession?.robloxUsername || robloxUsernameInput.trim();
    if (!targetUsername) {
      setError('Lütfen ödülün teslim edileceği Roblox kullanıcı adınızı giriniz.');
      return;
    }

    if (!code.trim()) {
      setError('Lütfen bir promosyon kodu yazınız.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.redeemCode(code.trim().toUpperCase(), targetUsername);
      if (res.success) {
        setRewardResult({
          rewardItem: res.rewardItem,
          remainingStock: res.remainingStock,
          ticketId: res.ticketId,
        });

        // Trigger confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        if (onSuccessRedeem) onSuccessRedeem();
      } else {
        setError(res.message || 'Kod kullanılamadı.');
      }
    } catch {
      setError('Sunucuya bağlanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToChat = () => {
    if (rewardResult?.ticketId) {
      onClose();
      onOpenLiveChatTicket(rewardResult.ticketId);
    }
  };

  const handleReset = () => {
    setRewardResult(null);
    setCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        <button
          id="btn-close-code-modal"
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!rewardResult ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                <Gift className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">CBBOSS Kod Kullan (Redeem)</h3>
                <p className="text-xs text-slate-400">Admin tarafından oluşturulan özel kodları girin.</p>
              </div>
            </div>

            {userSession?.role === 'admin' && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-2">
                <div>
                  <span className="font-black block">👑 Yönetici Olarak Giriş Yaptınız</span>
                  <span className="text-[11px] text-slate-300">Yeni bir promosyon kodu oluşturmak mı istiyorsunuz?</span>
                </div>
                {onOpenCreateCode && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateCode();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow"
                  >
                    🎁 Kod Oluştur
                  </button>
                )}
              </div>
            )}

            {error && (
              <div
                id="alert-code-redeem-error"
                className={`mb-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                  error.toLowerCase().includes('zaten') || error.toLowerCase().includes('kullandınız')
                    ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50'
                    : 'bg-red-950/80 border-red-700 text-red-200'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black block text-[13px] text-rose-300">
                    {error.toLowerCase().includes('zaten') || error.toLowerCase().includes('kullandınız')
                      ? '⚠️ KOD ZATEN KULLANILDI!'
                      : 'Hata Oluştu'}
                  </span>
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Roblox Kullanıcı Adınız
                </label>
                <input
                  id="input-code-roblox-username"
                  type="text"
                  value={userSession?.robloxUsername || robloxUsernameInput}
                  onChange={(e) => setRobloxUsernameInput(e.target.value)}
                  placeholder="Örn: ProPlayer_TR"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Promosyon Kodu
                </label>
                <div className="relative">
                  <input
                    id="input-promo-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Promosyon kodunuzu girin"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono font-bold tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  <Sparkles className="w-4 h-4 text-amber-500 absolute right-3.5 top-3.5 animate-pulse" />
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <p className="text-amber-400/90 font-medium">🔒 <strong className="text-amber-300">1 Kez Kullanım Kuralı:</strong> Her kullanıcı aynı kodu yalnızca 1 defa kullanabilir. Tekrar girildiğinde sistem reddeder.</p>
                <p>✅ Kod onaylandığında stok otomatik düşer ve adminle canlı sohbete bağlanarak ödülünüz teslim edilir.</p>
              </div>

              <button
                id="btn-submit-code-redeem"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Doğrulanıyor...' : 'Kodu Onayla ve Ödülü Aç'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="text-center py-4 space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/30 text-slate-950">
              <CheckCircle className="w-8 h-8 text-slate-950" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest inline-block mb-2">
                🎉 CONGRATS! BAŞARILI!
              </span>
              <h3 className="text-2xl font-black text-white">Tebrikler!</h3>
              <p className="text-xs text-slate-300 mt-1">Kod başarıyla doğrulandı ve ödülünüz tanımlandı.</p>
            </div>

            {/* Brainrot / MM2 Item name card as requested by user prompt */}
            <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 p-5 rounded-2xl border-2 border-amber-500/40">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300 block mb-1">
                Kazanılan Brainrot / MM2 İtemi
              </span>
              <h4 className="text-xl font-black text-white tracking-tight">
                {rewardResult.rewardItem}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Kalan Kod Stoğu: <span className="font-bold text-amber-400">{rewardResult.remainingStock} adet</span>
              </p>
            </div>

            <p className="text-xs text-slate-300">
              Şimdi admin <strong className="text-amber-300">YTCBBOSS</strong> (<span className="text-cyan-300 font-mono">@CBBOSSTEAM</span>) ile canlı sohbete geçerek ödülünüzü teslim alın!
            </p>

            <button
              id="btn-claim-code-to-chat"
              onClick={handleGoToChat}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Claim & Canlı Sohbete Git (Adminle Konuş)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
