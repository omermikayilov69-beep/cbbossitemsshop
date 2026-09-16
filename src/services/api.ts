import { ShopItem, PromoCode, Order, ChatThread, ChatMessage, ItemCategory, ItemRarity } from '../types';

export const ROBLOX_STORE_URL = 'https://www.roblox.com/tr/games/77956189816312/Youtube-CBBOSS#!/store';
export const ADMIN_SECRET_TOKEN = 'cbboss_admin_secret_token_9941';

// Local storage helper for codes fallback
function getLocalCodes(): PromoCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cbboss_saved_codes');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCode(newCode: PromoCode) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalCodes().filter((c) => c.code.toUpperCase() !== newCode.code.toUpperCase());
    list.unshift(newCode);
    localStorage.setItem('cbboss_saved_codes', JSON.stringify(list));
  } catch {}
}

function removeLocalCode(codeId: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalCodes().filter((c) => c.id !== codeId);
    localStorage.setItem('cbboss_saved_codes', JSON.stringify(list));
  } catch {}
}

// User-specific code claim tracking (ensures 1 claim per user per code)
function hasUserClaimedCode(code: string, username: string): boolean {
  if (typeof window === 'undefined' || !code || !username) return false;
  try {
    const raw = localStorage.getItem('cbboss_user_claimed_codes');
    const data: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const key = username.trim().toLowerCase();
    const codes = data[key] || [];
    return codes.includes(code.trim().toUpperCase());
  } catch {
    return false;
  }
}

function recordUserCodeClaim(code: string, username: string) {
  if (typeof window === 'undefined' || !code || !username) return;
  try {
    const raw = localStorage.getItem('cbboss_user_claimed_codes');
    const data: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const key = username.trim().toLowerCase();
    const codeKey = code.trim().toUpperCase();
    if (!data[key]) data[key] = [];
    if (!data[key].includes(codeKey)) {
      data[key].push(codeKey);
    }
    localStorage.setItem('cbboss_user_claimed_codes', JSON.stringify(data));
  } catch {}
}

// Local storage helper for items fallback & instant persistence
function getLocalCustomItems(): ShopItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cbboss_custom_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomItem(item: ShopItem) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalCustomItems().filter((i) => i.id !== item.id);
    list.unshift(item);
    localStorage.setItem('cbboss_custom_items', JSON.stringify(list));
  } catch {}
}

function removeLocalCustomItem(itemId: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalCustomItems().filter((i) => i.id !== itemId);
    localStorage.setItem('cbboss_custom_items', JSON.stringify(list));

    // Also remember deleted items
    const delRaw = localStorage.getItem('cbboss_deleted_items');
    const delList: string[] = delRaw ? JSON.parse(delRaw) : [];
    if (!delList.includes(itemId)) {
      delList.push(itemId);
      localStorage.setItem('cbboss_deleted_items', JSON.stringify(delList));
    }
  } catch {}
}

function getDeletedItemIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const delRaw = localStorage.getItem('cbboss_deleted_items');
    return new Set(delRaw ? JSON.parse(delRaw) : []);
  } catch {
    return new Set();
  }
}

// Helper for auth headers
function getHeaders(token?: string) {
  let activeToken = token;
  if (!activeToken && typeof window !== 'undefined') {
    try {
      const sess = JSON.parse(localStorage.getItem('cbboss_session') || '{}');
      if (sess?.role === 'admin') {
        activeToken = sess.adminToken || ADMIN_SECRET_TOKEN;
      }
    } catch {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
    headers['x-admin-token'] = activeToken;
  }
  return headers;
}

// Bulletproof JSON parsing helper: protects against HTML 404/502 pages or non-JSON responses
async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return fallback;
    }
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed) as T;
      } catch (parseErr) {
        console.warn('JSON parse error:', parseErr);
        return fallback;
      }
    }
    return fallback;
  } catch (err) {
    console.warn('Stream reading error:', err);
    return fallback;
  }
}

export const api = {
  // Auth: Admin Login
  async loginAdmin(email: string, password: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await safeJson(res, null);
      if (res.ok && data?.success) {
        return data;
      }
      if (data && data.message) {
        return data;
      }
    } catch (err) {
      console.warn('Backend fetch error for loginAdmin, fallback to local verify:', err);
    }

    // Direct fallback verify
    if (
      cleanEmail === 'omermikayilov69@gmail.com' &&
      cleanPassword === 'Baku2026_123123'
    ) {
      return {
        success: true,
        token: ADMIN_SECRET_TOKEN,
        user: {
          email: 'omermikayilov69@gmail.com',
          name: 'YTCBBOSS',
          displayName: 'YTCBBOSS',
          robloxUsername: 'CBBOSSTEAM',
          role: 'admin',
        },
      };
    }

    return {
      success: false,
      message: 'Şifre veya e-posta hatalı! Kesinlikle yönetici yetkisi verilemez.',
    };
  },

  // Auth: Roblox User Login
  async loginRoblox(robloxUsername: string) {
    const clean = (robloxUsername || '').trim();
    if (!clean || clean.length < 2) {
      return { success: false, message: 'Geçersiz Roblox kullanıcı adı (en az 2 karakter olmalıdır).' };
    }

    try {
      const res = await fetch('/api/auth/roblox', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ robloxUsername: clean }),
      });

      const data = await safeJson(res, null);
      if (res.ok && data?.success) {
        return data;
      }
      if (data && data.message) {
        return data;
      }
    } catch (err) {
      console.warn('Backend fetch error for loginRoblox, fallback to client session:', err);
    }

    return {
      success: true,
      user: {
        robloxUsername: clean,
        role: 'user',
      },
    };
  },

  // Items: Bulletproof retrieval with local backup & server sync
  async getItems(): Promise<{ success: boolean; items: ShopItem[]; version: number }> {
    let serverItems: ShopItem[] = [];
    let serverVersion = 1;
    try {
      const res = await fetch('/api/items', { headers: getHeaders() });
      const data = await safeJson(res, { success: false, items: [], version: 1 });
      if (data.success && Array.isArray(data.items)) {
        serverItems = data.items;
        serverVersion = data.version || 1;
      }
    } catch (err) {
      console.warn('Backend items fetch notice:', err);
    }

    const deletedIds = getDeletedItemIds();
    const localItems = getLocalCustomItems();

    // Combine server and local items cleanly
    const map = new Map<string, ShopItem>();

    // 1. Put local custom items first
    for (const item of localItems) {
      if (!deletedIds.has(item.id)) {
        map.set(item.id, item);
      }
    }

    // 2. Add server items
    for (const item of serverItems) {
      if (!deletedIds.has(item.id)) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }

    const combinedItems = Array.from(map.values());
    return {
      success: true,
      items: combinedItems.length > 0 ? combinedItems : serverItems,
      version: serverVersion,
    };
  },

  async createItem(
    token: string,
    data: {
      title: string;
      category: ItemCategory;
      price: number;
      image: string;
      description: string;
      stock: number;
      rarity: ItemRarity;
      badgeText?: string;
      gamepassName?: string;
    }
  ): Promise<{ success: boolean; item?: ShopItem; message?: string }> {
    const activeToken = token || ADMIN_SECRET_TOKEN;
    const cleanTitle = (data.title || '').trim();
    const numPrice = Number(data.price) > 0 ? Number(data.price) : 100;
    const numStock = Number(data.stock) >= 0 ? Number(data.stock) : 10;

    const fallbackItem: ShopItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: cleanTitle,
      category: data.category === 'mm2' ? 'mm2' : 'steal-brainrot',
      price: numPrice,
      image: data.image?.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      description: data.description?.trim() || 'Roblox CBBOSS SHOP özel ürünü.',
      stock: numStock,
      rarity: data.rarity || 'Mythic',
      badgeText: data.badgeText?.trim() || '',
      gamepassName: data.gamepassName || `${numPrice} Robux Gamepass`,
      createdAt: Date.now(),
    };

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: getHeaders(activeToken),
        body: JSON.stringify({
          title: cleanTitle,
          category: data.category,
          price: numPrice,
          image: data.image,
          description: data.description,
          stock: numStock,
          rarity: data.rarity,
          badgeText: data.badgeText,
          gamepassName: data.gamepassName,
        }),
      });
      const resData = await safeJson<{ success: boolean; item?: ShopItem; message?: string }>(res, { success: false });
      if (res.ok && resData && resData.success && resData.item) {
        saveLocalCustomItem(resData.item);
        return { success: true, item: resData.item };
      }
      if (resData && resData.message) {
        console.warn('Backend createItem message:', resData.message);
      }
    } catch (err) {
      console.warn('Network issue in createItem, fallback applied:', err);
    }

    // Always ensure the new item is saved and available
    saveLocalCustomItem(fallbackItem);
    return { success: true, item: fallbackItem };
  },

  async updateItem(token: string, id: string, data: Partial<ShopItem>): Promise<{ success: boolean; item?: ShopItem; message?: string }> {
    const activeToken = token || ADMIN_SECRET_TOKEN;

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getHeaders(activeToken),
        body: JSON.stringify(data),
      });
      const resData = await safeJson<{ success: boolean; item?: ShopItem; message?: string }>(res, { success: false });
      if (res.ok && resData && resData.success && resData.item) {
        saveLocalCustomItem(resData.item);
        return { success: true, item: resData.item };
      }
    } catch (err) {
      console.warn('Network issue in updateItem:', err);
    }

    const currentItems = getLocalCustomItems();
    const existing = currentItems.find((i) => i.id === id);
    const merged = { ...(existing || {}), ...data, id } as ShopItem;
    saveLocalCustomItem(merged);
    return { success: true, item: merged };
  },

  async deleteItem(token: string, id: string): Promise<{ success: boolean; message?: string }> {
    const activeToken = token || ADMIN_SECRET_TOKEN;
    removeLocalCustomItem(id);

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: getHeaders(activeToken),
      });
      return await safeJson(res, { success: true, message: 'İlan silindi.' });
    } catch {
      return { success: true, message: 'İlan yerel olarak silindi.' };
    }
  },

  // Promo Codes: Get all
  async getCodes(token?: string): Promise<{ success: boolean; codes: PromoCode[] }> {
    let serverCodes: PromoCode[] = [];
    try {
      const res = await fetch('/api/codes', {
        headers: getHeaders(token || ADMIN_SECRET_TOKEN),
      });
      const data = await safeJson(res, { success: false, codes: [] });
      if (data.success && Array.isArray(data.codes)) {
        serverCodes = data.codes;
      }
    } catch (err) {
      console.warn('Network error in getCodes:', err);
    }

    // Merge server codes with any locally created backup codes
    const localCodes = getLocalCodes();
    const map = new Map<string, PromoCode>();
    for (const c of serverCodes) {
      if (c && c.code) map.set(c.code.toUpperCase(), c);
    }
    for (const c of localCodes) {
      if (c && c.code && !map.has(c.code.toUpperCase())) {
        map.set(c.code.toUpperCase(), c);
      }
    }

    return { success: true, codes: Array.from(map.values()) };
  },

  // Promo Codes: Create
  async createCode(
    token: string,
    data: {
      code: string;
      rewardItem: string;
      category: ItemCategory;
      stock: number;
    }
  ): Promise<{ success: boolean; code?: PromoCode; message?: string }> {
    const cleanCode = (data.code || '').trim().toUpperCase();
    const cleanReward = (data.rewardItem || '').trim();
    const numStock = Number(data.stock) > 0 ? Number(data.stock) : 5;
    const activeToken = token || ADMIN_SECRET_TOKEN;

    const fallbackCode: PromoCode = {
      id: 'code-' + Date.now(),
      code: cleanCode,
      rewardItem: cleanReward,
      category: data.category || 'steal-brainrot',
      initialStock: numStock,
      remainingStock: numStock,
      createdAt: Date.now(),
      claimedBy: [],
    };

    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: getHeaders(activeToken),
        body: JSON.stringify({
          code: cleanCode,
          rewardItem: cleanReward,
          category: data.category,
          stock: numStock,
        }),
      });

      const resData = await safeJson(res, null);
      if (res.ok && resData?.success && resData.code) {
        saveLocalCode(resData.code);
        return { success: true, code: resData.code };
      }
      if (resData && resData.message) {
        return { success: false, message: resData.message };
      }
    } catch (err) {
      console.warn('createCode backend call failed, saving to local state:', err);
    }

    // Offline / fallback save
    saveLocalCode(fallbackCode);
    return { success: true, code: fallbackCode };
  },

  // Promo Codes: Delete
  async deleteCode(token: string, id: string): Promise<{ success: boolean; message?: string }> {
    removeLocalCode(id);
    try {
      const res = await fetch(`/api/codes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(token || ADMIN_SECRET_TOKEN),
      });
      return await safeJson(res, { success: true, message: 'Kod silindi.' });
    } catch {
      return { success: true, message: 'Kod yerel olarak silindi.' };
    }
  },

  // Promo Codes: Redeem
  async redeemCode(code: string, robloxUsername: string): Promise<{
    success: boolean;
    rewardItem?: string;
    remainingStock?: number;
    ticketId?: string;
    message?: string;
  }> {
    const cleanCode = (code || '').trim().toUpperCase();
    const cleanUsername = (robloxUsername || '').trim();

    if (!cleanCode) {
      return { success: false, message: 'Lütfen bir promosyon kodu yazınız.' };
    }
    if (!cleanUsername) {
      return { success: false, message: 'Lütfen Roblox kullanıcı adınızı giriniz.' };
    }

    // 1. Check if this username already claimed this code on this client
    if (hasUserClaimedCode(cleanCode, cleanUsername)) {
      return {
        success: false,
        message: 'Bu kodu zaten kullandınız! Her kullanıcı bir promosyon kodunu yalnızca 1 kez kullanabilir.',
      };
    }

    try {
      const res = await fetch('/api/codes/redeem', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code: cleanCode, robloxUsername: cleanUsername }),
      });
      const data = await safeJson<{
        success: boolean;
        rewardItem?: string;
        remainingStock?: number;
        ticketId?: string;
        message?: string;
        alreadyClaimed?: boolean;
      } | null>(res, null);

      if (res.ok && data?.success) {
        recordUserCodeClaim(cleanCode, cleanUsername);
        return data;
      }
      if (data && data.message) {
        if (data.alreadyClaimed || data.message.includes('zaten') || data.message.includes('kullandınız')) {
          recordUserCodeClaim(cleanCode, cleanUsername);
        }
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('redeemCode backend failed, checking local codes:', err);
    }

    // Check local fallback codes with strict 1-time check
    const localCodes = getLocalCodes();
    const target = localCodes.find((c) => c.code.toUpperCase() === cleanCode);
    if (target) {
      target.claimedBy = target.claimedBy || [];
      const alreadyClaimedLocal = target.claimedBy.some((cl: any) => {
        const u = typeof cl === 'string' ? cl : cl?.robloxUsername;
        return u && String(u).trim().toLowerCase() === cleanUsername.toLowerCase();
      });

      if (alreadyClaimedLocal || hasUserClaimedCode(cleanCode, cleanUsername)) {
        recordUserCodeClaim(cleanCode, cleanUsername);
        return {
          success: false,
          message: 'Bu kodu zaten kullandınız! Her kullanıcı bir promosyon kodunu yalnızca 1 kez kullanabilir.',
        };
      }

      if (target.remainingStock <= 0) {
        return { success: false, message: 'Bu kodun stokları tükenmiştir!' };
      }

      target.remainingStock -= 1;
      const ticketId = 'TICKET-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      target.claimedBy.push({
        robloxUsername: cleanUsername,
        claimedAt: Date.now(),
        ticketId,
      });
      saveLocalCode(target);
      recordUserCodeClaim(cleanCode, cleanUsername);
      return {
        success: true,
        rewardItem: target.rewardItem,
        remainingStock: target.remainingStock,
        ticketId,
      };
    }

    // Default known codes fallback if offline
    if (['CBBOSS2026', 'MM2FREE', 'BRAINROT100'].includes(cleanCode)) {
      if (hasUserClaimedCode(cleanCode, cleanUsername)) {
        return {
          success: false,
          message: 'Bu kodu zaten kullandınız! Her kullanıcı bir promosyon kodunu yalnızca 1 kez kullanabilir.',
        };
      }
      recordUserCodeClaim(cleanCode, cleanUsername);
      const rewards: Record<string, { reward: string; stock: number }> = {
        CBBOSS2026: { reward: 'Mega Trallallero Brainrot', stock: 4 },
        MM2FREE: { reward: 'Heartblade Godly Knife', stock: 2 },
        BRAINROT100: { reward: 'Skibidi Toilet Titan Brainrot', stock: 9 },
      };
      const info = rewards[cleanCode];
      return {
        success: true,
        rewardItem: info.reward,
        remainingStock: info.stock,
        ticketId: 'TICKET-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      };
    }

    return { success: false, message: 'Geçersiz veya bulunamayan promosyon kodu!' };
  },

  // Orders
  async createOrder(data: {
    robloxUsername: string;
    items: Array<{
      itemId: string;
      title: string;
      category: ItemCategory;
      price: number;
      quantity: number;
      image: string;
      rarity: ItemRarity;
    }>;
    totalPrice: number;
  }): Promise<{
    success: boolean;
    orderId?: string;
    ticketId?: string;
    robloxStoreUrl?: string;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await safeJson(res, {
        success: false,
        message: 'Sipariş oluşturulamadı.',
        robloxStoreUrl: ROBLOX_STORE_URL,
      });
    } catch {
      return {
        success: false,
        message: 'Sunucuya bağlanılamadı.',
        robloxStoreUrl: ROBLOX_STORE_URL,
      };
    }
  },

  async confirmGamepass(orderId: string): Promise<{
    success: boolean;
    ticketId?: string;
    message?: string;
  }> {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-gamepass`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await safeJson(res, { success: false, message: 'Gamepass onayı alınamadı.' });
    } catch {
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  // Chats
  async getChats(token?: string, username?: string): Promise<{ success: boolean; chats: ChatThread[] }> {
    try {
      const query = username ? `?username=${encodeURIComponent(username)}` : '';
      const res = await fetch(`/api/chats${query}`, {
        headers: getHeaders(token || ADMIN_SECRET_TOKEN),
      });
      return await safeJson(res, { success: false, chats: [] });
    } catch {
      return { success: false, chats: [] };
    }
  },

  async getChat(id: string): Promise<{ success: boolean; chat?: ChatThread; message?: string }> {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        headers: getHeaders(),
      });
      return await safeJson(res, { success: false, message: 'Sohbet bulunamadı.' });
    } catch {
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  async sendMessage(
    id: string,
    text: string,
    sender: 'user' | 'admin',
    senderName: string,
    token?: string
  ): Promise<{ success: boolean; message?: ChatMessage; chat?: ChatThread }> {
    try {
      const res = await fetch(`/api/chats/${id}/messages`, {
        method: 'POST',
        headers: getHeaders(token || ADMIN_SECRET_TOKEN),
        body: JSON.stringify({ text, sender, senderName }),
      });
      return await safeJson(res, { success: false });
    } catch {
      return { success: false };
    }
  },

  async markDelivered(token: string, id: string): Promise<{ success: boolean; chat?: ChatThread }> {
    try {
      const res = await fetch(`/api/chats/${id}/deliver`, {
        method: 'PATCH',
        headers: getHeaders(token || ADMIN_SECRET_TOKEN),
      });
      return await safeJson(res, { success: false });
    } catch {
      return { success: false };
    }
  },

  async checkVersion(): Promise<{ version: number }> {
    try {
      const res = await fetch('/api/state-version', { headers: getHeaders() });
      return await safeJson(res, { version: 1 });
    } catch {
      return { version: 1 };
    }
  },

  hasUserClaimedCode,
  recordUserCodeClaim,
};
