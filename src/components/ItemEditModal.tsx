import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { ShopItem, ItemCategory, ItemRarity } from '../types';

interface ItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => Promise<void>;
  itemToEdit: ShopItem | null;
}

const PRESET_IMAGES = [
  { name: 'Tung Tung Brainrot', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', cat: 'steal-brainrot' },
  { name: 'Trallallero Brainrot', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80', cat: 'steal-brainrot' },
  { name: 'Skibidi Titan', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', cat: 'steal-brainrot' },
  { name: 'Sigma Boy Giga', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', cat: 'steal-brainrot' },
  { name: 'Harvester MM2 Crossbow', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', cat: 'mm2' },
  { name: 'Corrupt MM2 Knife', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', cat: 'mm2' },
  { name: 'Bat Ancient Knife', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', cat: 'mm2' },
  { name: 'Heartblade Godly', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80', cat: 'mm2' },
];

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('steal-brainrot');
  const [price, setPrice] = useState<number>(100);
  const [stock, setStock] = useState<number>(10);
  const [image, setImage] = useState('');
  const [rarity, setRarity] = useState<ItemRarity>('Mythic');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setCategory(itemToEdit.category);
      setPrice(itemToEdit.price);
      setStock(itemToEdit.stock);
      setImage(itemToEdit.image);
      setRarity(itemToEdit.rarity);
      setDescription(itemToEdit.description);
      setBadgeText(itemToEdit.badgeText || '');
    } else {
      setTitle('');
      setCategory('steal-brainrot');
      setPrice(200);
      setStock(10);
      setImage(PRESET_IMAGES[0].url);
      setRarity('Mythic');
      setDescription('');
      setBadgeText('YENİ');
    }
    setError('');
    setSuccessMsg('');
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('İlan başlığı zorunludur.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Fiyat 0 Robux’tan büyük bir sayı olmalıdır.');
      return;
    }
    const numStock = Number(stock);
    const validStock = !isNaN(numStock) && numStock >= 0 ? numStock : 10;

    setIsSubmitting(true);
    setError('');
    try {
      await onSave({
        title: cleanTitle,
        category,
        price: numPrice,
        stock: validStock,
        image: image.trim() || PRESET_IMAGES[0].url,
        rarity,
        description: description.trim() || 'Roblox CBBOSS SHOP özel ürünü.',
        badgeText: badgeText.trim(),
        gamepassName: `${numPrice} Robux Gamepass`,
      });
      setSuccessMsg(itemToEdit ? 'İlan başarıyla güncellendi!' : 'İlan başarıyla mağazaya eklendi ve tüm kullanıcılarda yayında!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Kaydedilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-white my-8">
        <button
          id="btn-close-item-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            {itemToEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {itemToEdit ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}
            </h3>
            <p className="text-xs text-slate-400">
              Yapılan tüm değişiklikler anında bütün kullanıcılara yansır.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 font-bold animate-pulse">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">İlan Başlığı</label>
              <input
                id="input-item-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Tung Tung Sahur Brainrot"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
              <select
                id="select-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="steal-brainrot">🧠 Steal a Brainrot</option>
                <option value="mm2">🔪 MM2 (Murder Mystery 2)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fiyat (Robux)</label>
              <input
                id="input-item-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min="1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stok Adedi</label>
              <input
                id="input-item-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Rarity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nadirlik (Rarity)</label>
              <select
                id="select-item-rarity"
                value={rarity}
                onChange={(e) => setRarity(e.target.value as ItemRarity)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Secret">Secret (Gizli)</option>
                <option value="Ancient">Ancient (Kadim MM2)</option>
                <option value="Godly">Godly (MM2)</option>
                <option value="Mythic">Mythic</option>
                <option value="Legendary">Legendary</option>
                <option value="Rare">Rare</option>
              </select>
            </div>
          </div>

          {/* Badge & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Öne Çıkan Etiketi (Opsiyonel)</label>
              <input
                id="input-item-badge"
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Örn: 🔥 EN ÇOK SATAN, ⭐ POPÜLER"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Görsel URL</label>
              <div className="flex items-center gap-2">
                <input
                  id="input-item-image"
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Preset Images for Quick Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hızlı Hazır Görsellerden Seç (Tıklayın):</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                    image === preset.url ? 'ring-2 ring-amber-400 border-amber-400 scale-95' : 'border-slate-800 hover:border-slate-600'
                  }`}
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  {image === preset.url && (
                    <div className="absolute inset-0 bg-amber-500/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ürün Açıklaması</label>
            <textarea
              id="textarea-item-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ürünün oyun içi özellikleri, güçleri veya takas değeri..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              İptal
            </button>
            <button
              id="btn-save-item-submit"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Kaydediliyor...' : itemToEdit ? 'Güncellemeyi Kaydet' : 'İlanı Yayınla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
