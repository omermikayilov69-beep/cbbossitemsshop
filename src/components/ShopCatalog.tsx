import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter, BrainCircuit, Swords, ShieldCheck, Zap, Gift, ShoppingBag, Plus } from 'lucide-react';
import { ShopItem, ItemCategory, ItemRarity, UserSession } from '../types';
import { ItemCard } from './ItemCard';

interface ShopCatalogProps {
  items: ShopItem[];
  currentCategory: ItemCategory | 'all';
  onSelectCategory: (cat: ItemCategory | 'all') => void;
  onAddToCart: (item: ShopItem) => void;
  cartItemIds: Set<string>;
  onEditItem?: (item: ShopItem) => void;
  onDeleteItem?: (id: string) => void;
  onOpenCreateItem?: () => void;
  onOpenCreateCode?: () => void;
  onOpenCodesManager?: () => void;
  onOpenCodeModal: () => void;
  userSession: UserSession | null;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  items,
  currentCategory,
  onSelectCategory,
  onAddToCart,
  cartItemIds,
  onEditItem,
  onDeleteItem,
  onOpenCreateItem,
  onOpenCreateCode,
  onOpenCodesManager,
  onOpenCodeModal,
  userSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');

  const isAdmin = userSession?.role === 'admin';

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category match
      if (currentCategory !== 'all' && item.category !== currentCategory) {
        return false;
      }
      // Rarity match
      if (selectedRarity !== 'all' && item.rarity !== selectedRarity) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesRarity = item.rarity.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesRarity) return false;
      }
      return true;
    });
  }, [items, currentCategory, selectedRarity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Resmi CBBOSS Mağazası - Roblox Steal a Brainrot & MM2</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            En Değerli <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">Brainrot ve MM2</span> İtemleri
          </h1>

          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed max-w-2xl">
            Sepete ekleyin, kurallara uygun gamepass alımı ile saniyeler içinde siparişinizi oluşturun ve adminle canlı sohbette oyun içi teslimatınızı anında alın!
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Anında Canlı Teslimat</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>%100 Güvenli Gamepass Yolu</span>
            </div>
            {/* Regular code redeem button for users */}
            <button
              id="btn-hero-redeem-code"
              onClick={onOpenCodeModal}
              className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 px-3.5 py-2 rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Promosyon Kodu Kullan</span>
            </button>

            {/* Admin dedicated code & item buttons */}
            {isAdmin && (
              <>
                {onOpenCreateCode && (
                  <button
                    id="btn-hero-admin-create-code"
                    onClick={onOpenCreateCode}
                    className="flex items-center gap-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 px-4 py-2 rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer ring-2 ring-amber-400/50"
                  >
                    <Gift className="w-4 h-4 text-slate-950" />
                    <span>🎁 Yeni Kod Oluştur</span>
                  </button>
                )}

                {onOpenCodesManager && (
                  <button
                    id="btn-hero-admin-manage-codes"
                    onClick={onOpenCodesManager}
                    className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kodları & Stokları Yönet</span>
                  </button>
                )}

                {onOpenCreateItem && (
                  <button
                    id="btn-hero-admin-create-item"
                    onClick={onOpenCreateItem}
                    className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 px-4 py-2 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni İlan Ekle</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        {/* Category switcher tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              currentCategory === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            Tüm İlanlar ({items.length})
          </button>
          <button
            onClick={() => onSelectCategory('steal-brainrot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentCategory === 'steal-brainrot'
                ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-pink-400" />
            <span>Steal a Brainrot</span>
          </button>
          <button
            onClick={() => onSelectCategory('mm2')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentCategory === 'mm2'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-cyan-400" />
            <span>MM2 İtemleri</span>
          </button>
        </div>

        {/* Search and Rarity Filter */}
        <div className="flex items-center gap-2.5">
          {/* Rarity Select */}
          <div className="relative">
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="all">Tüm Nadirlikler</option>
              <option value="Secret">Secret (Gizli)</option>
              <option value="Ancient">Ancient (MM2)</option>
              <option value="Godly">Godly (MM2)</option>
              <option value="Mythic">Mythic</option>
              <option value="Legendary">Legendary</option>
              <option value="Rare">Rare</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlan ara (örn: Tung Tung, Bat)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aradığınız kriterlere uygun ilan bulunamadı</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Farklı bir arama terimi deneyin veya kategoriyi 'Tümü' olarak değiştirin.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRarity('all');
              onSelectCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              userSession={userSession}
              isInCart={cartItemIds.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
