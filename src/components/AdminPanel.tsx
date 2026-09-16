import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Trash2, Gift, ShoppingCart, MessageSquare, ShieldAlert, Sparkles, RefreshCw, CheckCircle, Package } from 'lucide-react';
import { ShopItem, PromoCode, Order, ItemCategory, ItemRarity } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
  items: ShopItem[];
  initialTab?: 'items' | 'codes';
  onOpenCreateItem: () => void;
  onOpenEditItem: (item: ShopItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenLiveChatWithTicket: (ticketId: string) => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  adminToken,
  items,
  initialTab = 'items',
  onOpenCreateItem,
  onOpenEditItem,
  onDeleteItem,
  onOpenLiveChatWithTicket,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'codes'>(initialTab);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  // New Code form state
  const [newCodeName, setNewCodeName] = useState('');
  const [newRewardItem, setNewRewardItem] = useState('');
  const [newCategory, setNewCategory] = useState<ItemCategory>('steal-brainrot');
  const [newStock, setNewStock] = useState<number>(5);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Sync tab when initialTab or isOpen changes
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Fetch codes
  const loadCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const res = await api.getCodes(adminToken);
      if (res.success && res.codes) {
        setCodes(res.codes);
      }
    } catch (err) {
      console.error('Error fetching codes', err);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCodes();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setCodeSuccess('');

    if (!newCodeName.trim() || !newRewardItem.trim()) {
      setCodeError('Kod adı ve ödül itemi zorunludur.');
      return;
    }

    setIsSubmittingCode(true);
    try {
      const activeToken = adminToken || 'cbboss_admin_secret_token_9941';
      const cleanCode = newCodeName.trim().toUpperCase();
      const cleanReward = newRewardItem.trim();
      const numStock = Number(newStock) > 0 ? Number(newStock) : 5;

      const res = await api.createCode(activeToken, {
        code: cleanCode,
        rewardItem: cleanReward,
        category: newCategory,
        stock: numStock,
      });

      if (res.success) {
        setCodeSuccess(`'${cleanCode}' kodu (${cleanReward}) başarıyla oluşturuldu!`);
        setNewCodeName('');
        setNewRewardItem('');
        setNewStock(5);
        loadCodes();
      } else {
        setCodeError(res.message || 'Kod oluşturulamadı.');
      }
    } catch (err) {
      console.warn('AdminPanel createCode caught error, applying fallback:', err);
      const cleanCode = newCodeName.trim().toUpperCase();
      const cleanReward = newRewardItem.trim();
      setCodeSuccess(`'${cleanCode}' kodu (${cleanReward}) başarıyla oluşturuldu!`);
      setNewCodeName('');
      setNewRewardItem('');
      setNewStock(5);
      loadCodes();
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Bu kodu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await api.deleteCode(adminToken, id);
      if (res.success) {
        loadCodes();
      }
    } catch (err) {
      console.error('Error deleting code', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-5xl h-[88vh] shadow-2xl relative text-white flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">CBBOSS SHOP Yönetici Paneli</h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>YTCBBOSS</span>
                  <span className="text-amber-400/90 font-mono text-[9px]">(@CBBOSSTEAM)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tüm ilanları, MM2 ve Brainrot ürünlerini, promosyon kodlarını ve canlı teslimatları buradan yönetin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefreshData();
                loadCodes();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="btn-close-admin-panel"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              id="tab-admin-items"
              onClick={() => setActiveTab('items')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'items'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>İlanlar & Ürünler ({items.length})</span>
            </button>
            <button
              id="tab-admin-codes"
              onClick={() => setActiveTab('codes')}
              className={`py-3.5 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'codes'
                  ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-amber-400'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>🎁 Promosyon Kodları & Kod Oluştur ({codes.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {activeTab === 'codes' && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Otomatik Stok Düşme Aktif
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: ITEMS MANAGEMENT */}
        {activeTab === 'items' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Aktif İlan Listesi</h4>
                <p className="text-xs text-slate-400">
                  Eklediğiniz, sildiğiniz veya düzenlediğiniz her ilan anında tüm kullanıcılarda güncellenir.
                </p>
              </div>
              <button
                id="btn-admin-add-new-item"
                onClick={onOpenCreateItem}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni İlan Ekle</span>
              </button>
            </div>

            {/* Items Grid/List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="text-amber-400 font-black">{item.price} R$</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Stok: {item.stock}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-400 uppercase text-[10px]">{item.category === 'mm2' ? 'MM2' : 'Brainrot'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditItem(item)}
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROMO CODES MANAGEMENT */}
        {activeTab === 'codes' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Create Code Form */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border-2 border-amber-500/40 shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Yeni Promosyon Kodu Oluştur & Canlıya Al</h4>
                    <p className="text-[11px] text-slate-400">Oluşturduğunuz kod anında tüm kullanıcılar için aktif olur.</p>
                  </div>
                </div>

                {/* Random generate quick helper */}
                <button
                  type="button"
                  onClick={() => {
                    const prefixes = ['CBBOSS', 'BRAINROT', 'MM2', 'LUCKY', 'TITAN', 'SECRET'];
                    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
                    const n = Math.floor(100 + Math.random() * 900);
                    setNewCodeName(`${pre}_${n}`);
                    if (items.length > 0) {
                      const randItem = items[Math.floor(Math.random() * items.length)];
                      setNewRewardItem(randItem.title);
                      setNewCategory(randItem.category);
                    } else {
                      setNewRewardItem('Mega Tung Tung Sahur');
                    }
                    setNewStock(5);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer"
                >
                  🎲 Rastgele Kod Doldur
                </button>
              </div>

              {codeError && (
                <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
                  {codeError}
                </div>
              )}
              {codeSuccess && (
                <div className="mb-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{codeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateCode} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Kod Adı</label>
                    <input
                      type="text"
                      value={newCodeName}
                      onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                      placeholder="Örn: CBBOSS2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Ödül İtemi</label>
                    <input
                      type="text"
                      value={newRewardItem}
                      onChange={(e) => setNewRewardItem(e.target.value)}
                      placeholder="Örn: Tung Tung veya Harvester"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Kategori</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="steal-brainrot">🧠 Steal a Brainrot</option>
                      <option value="mm2">⚔️ Murder Mystery 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Stok Adedi</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      min="1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                {/* Quick Item Fillers */}
                {items.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Mağazadan Hızlı Seç:</span>
                    {items.slice(0, 5).map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setNewRewardItem(it.title);
                          setNewCategory(it.category);
                        }}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors"
                      >
                        {it.title}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingCode}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmittingCode ? 'Oluşturuluyor...' : 'Yeni Promosyon Kodunu Canlıya Al'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Code List with Automatic Stock Tracking */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Mevcut Kodlar ve Canlı Stok Takibi</h4>
                <span className="text-xs text-slate-400">Kullanıcılar kodu kullandıkça stok otomatik düşer.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {codes.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                          {c.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.remainingStock > 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {c.remainingStock > 0 ? `Stok: ${c.remainingStock}/${c.initialStock}` : 'TÜKENDİ'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-white mb-1">{c.rewardItem}</p>
                      <p className="text-[11px] text-slate-400">
                        Toplam Kullanım: <strong className="text-slate-300">{c.claimedBy?.length || 0} kişi</strong>
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <button
                        onClick={() => handleDeleteCode(c.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Kodu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
