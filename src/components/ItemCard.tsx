import React from 'react';
import { ShoppingCart, Edit3, Trash2, Check, Sparkles, BrainCircuit, Swords } from 'lucide-react';
import { ShopItem, UserSession } from '../types';

interface ItemCardProps {
  item: ShopItem;
  onAddToCart: (item: ShopItem) => void;
  onEditItem?: (item: ShopItem) => void;
  onDeleteItem?: (itemId: string) => void;
  userSession: UserSession | null;
  isInCart: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onAddToCart,
  onEditItem,
  onDeleteItem,
  userSession,
  isInCart,
}) => {
  const isAdmin = userSession?.role === 'admin';

  // Rarity styling helpers
  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Secret':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10';
      case 'Ancient':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-orange-500/10';
      case 'Godly':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/10';
      case 'Mythic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/10';
      case 'Legendary':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-500/10';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const isOutOfStock = item.stock <= 0;

  return (
    <div className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-rose-500/5">
      {/* Top Image Container */}
      <div className="relative aspect-video sm:aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // fallback image if broken link
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-sm ${
              item.category === 'steal-brainrot'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {item.category === 'steal-brainrot' ? (
              <span className="flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" /> Brainrot
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Swords className="w-3 h-3" /> MM2
              </span>
            )}
          </span>

          {item.badgeText && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow-md uppercase">
              {item.badgeText}
            </span>
          )}
        </div>

        {/* Rarity Tag */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border backdrop-blur-md ${getRarityBadge(item.rarity)}`}>
            {item.rarity}
          </span>
        </div>

        {/* Stock status overlay */}
        <div className="absolute bottom-2.5 left-3">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/80 text-white">
              TÜKENDİ
            </span>
          ) : item.stock <= 3 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/80 text-black animate-pulse">
              Son {item.stock} Adet!
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/80 text-emerald-400 border border-emerald-500/30">
              Stok: {item.stock}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Roblox Gamepass
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                R$
              </span>
              <span className="text-lg font-black text-amber-400 tracking-tight">
                {item.price} <span className="text-xs font-bold text-slate-400">Robux</span>
              </span>
            </div>
          </div>

          <button
            id={`btn-add-cart-${item.id}`}
            onClick={() => onAddToCart(item)}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-rose-500/20 active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Sepette</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Tükendi' : 'Sepete Ekle'}</span>
              </>
            )}
          </button>
        </div>

        {/* Admin actions (Instant real-time edit and delete) */}
        {isAdmin && (
          <div className="mt-3 pt-2.5 border-t border-amber-500/30 flex items-center justify-between gap-2 bg-amber-950/20 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Yönetici
            </span>
            <div className="flex items-center gap-1.5">
              {onEditItem && (
                <button
                  id={`btn-admin-edit-${item.id}`}
                  onClick={() => onEditItem(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-cyan-400" />
                  <span>Düzenle</span>
                </button>
              )}
              {onDeleteItem && (
                <button
                  id={`btn-admin-del-${item.id}`}
                  onClick={() => onDeleteItem(item.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-red-800/40"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  <span>Sil</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
