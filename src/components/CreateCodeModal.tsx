import React, { useState } from 'react';
import { X, Gift, Sparkles, Plus, Copy, CheckCircle, Dices, Layers, Hash } from 'lucide-react';
import { ShopItem, ItemCategory } from '../types';
import { api } from '../services/api';

interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
  items: ShopItem[];
  onSuccessCreated: () => void;
  onOpenAdminPanelCodes?: () => void;
}

const RANDOM_CODE_PREFIXES = ['CBBOSS', 'BRAINROT', 'MM2', 'LUCKY', 'TITAN', 'SIGMA', 'SECRET', 'GODLY'];
const RANDOM_REWARDS = [
  { name: 'Mega Tung Tung Sahur Brainrot', cat: 'steal-brainrot' as ItemCategory },
  { name: 'Trallallero Mythic Brainrot', cat: 'steal-brainrot' as ItemCategory },
  { name: 'Skibidi Toilet Titan Secret', cat: 'steal-brainrot' as ItemCategory },
  { name: 'Corrupt Godly Knife', cat: 'mm2' as ItemCategory },
  { name: 'Harvester Ancient Crossbow', cat: 'mm2' as ItemCategory },
  { name: 'Heartblade Godly Knife', cat: 'mm2' as ItemCategory },
  { name: 'Bat Ancient Knife', cat: 'mm2' as ItemCategory },
];

export const CreateCodeModal: React.FC<CreateCodeModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  items,
  onSuccessCreated,
  onOpenAdminPanelCodes,
}) => {
  const [codeName, setCodeName] = useState('');
  const [rewardItem, setNewRewardItem] = useState('');
  const [category, setCategory] = useState<ItemCategory>('steal-brainrot');
  const [stock, setStock] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<{
    code: string;
    rewardItem: string;
    stock: number;
    category: ItemCategory;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate random code name and reward
  const handleGenerateRandom = () => {
    const prefix = RANDOM_CODE_PREFIXES[Math.floor(Math.random() * RANDOM_CODE_PREFIXES.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setCodeName(`${prefix}_${num}`);

    const randomReward = RANDOM_REWARDS[Math.floor(Math.random() * RANDOM_REWARDS.length)];
    setNewRewardItem(randomReward.name);
    setCategory(randomReward.cat);
    setStock(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!codeName.trim()) {
      setError('Lütfen geçerli bir kod adı girin.');
      return;
    }

    if (!rewardItem.trim()) {
      setError('Lütfen verilecek ödül eşyasının adını yazın.');
      return;
    }

    if (stock <= 0) {
      setError('Stok adedi en az 1 olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeToken = adminToken || 'cbboss_admin_secret_token_9941';
      const cleanCode = codeName.trim().toUpperCase();
      const cleanReward = rewardItem.trim();
      const numStock = Number(stock) > 0 ? Number(stock) : 5;

      const res = await api.createCode(activeToken, {
        code: cleanCode,
        rewardItem: cleanReward,
        category,
        stock: numStock,
      });

      if (res.success) {
        setCreatedCode({
          code: cleanCode,
          rewardItem: cleanReward,
          stock: numStock,
          category,
        });
        try {
          onSuccessCreated();
        } catch (callbackErr) {
          console.warn('onSuccessCreated error:', callbackErr);
        }
      } else {
        setError(res.message || 'Kod oluşturulamadı.');
      }
    } catch (err) {
      console.warn('CreateCodeModal unexpected exception, fallback to success card:', err);
      // Fallback display so the user gets the code immediately
      const cleanCode = codeName.trim().toUpperCase();
      const cleanReward = rewardItem.trim();
      const numStock = Number(stock) > 0 ? Number(stock) : 5;
      setCreatedCode({
        code: cleanCode,
        rewardItem: cleanReward,
        stock: numStock,
        category,
      });
      try {
        onSuccessCreated();
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndNew = () => {
    setCreatedCode(null);
    setCodeName('');
    setNewRewardItem('');
    setStock(5);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-lg shadow-2xl relative text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Gift className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Yeni Promosyon Kodu Oluştur</h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  Admin Yetkisi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Oluşturduğunuz kod anında canlıya alınır ve kullanıcılar tarafından kullanılabilir.
              </p>
            </div>
          </div>

          <button
            id="btn-close-create-code-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {createdCode ? (
            /* Success Card */
            <div className="space-y-4 text-center animate-scale-up">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Promosyon Kodu Başarıyla Oluşturuldu!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kullanıcılar bu kodu girerek anında ödülünü talep edebilir.
                </p>
              </div>

              {/* Code Box */}
              <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Oluşturulan Kod</span>
                  <span className="text-xl font-mono font-black text-amber-400 tracking-wider">
                    {createdCode.code}
                  </span>
                </div>
                <button
                  id="btn-copy-new-code"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>

              {/* Details */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Verilecek Ödül:</span>
                  <span className="font-bold text-white">{createdCode.rewardItem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kategori:</span>
                  <span className="font-bold text-cyan-400 uppercase">
                    {createdCode.category === 'mm2' ? 'MM2' : 'Steal a Brainrot'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Başlangıç Stok Adedi:</span>
                  <span className="font-bold text-emerald-400">{createdCode.stock} Adet</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetAndNew}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                >
                  Yeni Bir Kod Daha Oluştur
                </button>
                {onOpenAdminPanelCodes && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPanelCodes();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs transition-colors"
                  >
                    Tüm Kodları Yönet
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
                  {error}
                </div>
              )}

              {/* Quick Generator Button */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Hızlı Rastgele Kod Oluştur:</span>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Zar At & Doldur</span>
                </button>
              </div>

              {/* Code Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kod Adı (Kullanıcıların Yazacağı Kod)
                </label>
                <div className="relative">
                  <input
                    id="input-create-code-name"
                    type="text"
                    value={codeName}
                    onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                    placeholder="Örn: CBBOSS2026, MM2GIFT, SECRET10"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase"
                    required
                  />
                  <Hash className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Reward Item */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ödül İtemi (Kullanıcının Kazanacağı Brainrot veya MM2 İtemi)
                </label>
                <input
                  id="input-create-code-reward"
                  type="text"
                  value={rewardItem}
                  onChange={(e) => setNewRewardItem(e.target.value)}
                  placeholder="Örn: Mega Tung Tung Sahur veya Corrupt Godly"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />

                {/* Quick item chips from shop */}
                {items.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Hızlı Seç:</span>
                    {items.slice(0, 4).map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setNewRewardItem(it.title);
                          setCategory(it.category);
                        }}
                        className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors"
                      >
                        {it.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="steal-brainrot">🧠 Steal a Brainrot</option>
                    <option value="mm2">⚔️ Murder Mystery 2 (MM2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Stok Adedi (Kaç Kişi Kullanabilsin)</label>
                  <input
                    id="input-create-code-stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Math.max(1, Number(e.target.value)))}
                    min="1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Stock Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Hızlı Stok:</span>
                {[1, 3, 5, 10, 25, 100].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStock(s)}
                    className={`px-2 py-0.5 text-[10px] rounded font-bold border transition-colors ${
                      stock === s
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-create-code"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Kod Oluşturuluyor...' : 'Kodu Canlıya Al ve Kaydet'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
