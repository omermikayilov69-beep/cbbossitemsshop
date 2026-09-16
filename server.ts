import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// CORS & Preflight headers for cross-origin or iframe requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Persistent storage setup
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial items
const DEFAULT_ITEMS = [
  {
    id: "brainrot-1",
    title: "Tung Tung Sahur Brainrot",
    category: "steal-brainrot",
    price: 450,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    description: "Özel ses efektli, ultra hızlı koşu ve süper çalma gücüne sahip efsanevi gizli Brainrot!",
    stock: 8,
    rarity: "Secret",
    badgeText: "🔥 EN ÇOK SATAN",
    gamepassName: "450 Robux Gamepass",
    createdAt: Date.now() - 10000000,
  },
  {
    id: "brainrot-2",
    title: "Trallallero Trallalla Brainrot",
    category: "steal-brainrot",
    price: 250,
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    description: "İtalyan melodili, rakiplerin kafasını karıştıran Mythic sınıfı nadir brainrot pet.",
    stock: 12,
    rarity: "Mythic",
    badgeText: "⭐ POPÜLER",
    gamepassName: "250 Robux Gamepass",
    createdAt: Date.now() - 9000000,
  },
  {
    id: "brainrot-3",
    title: "Skibidi Toilet Titan Brainrot",
    category: "steal-brainrot",
    price: 180,
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    description: "Devasa boyutlu lazer saldırısı ve özel dans animasyonlu Legendary Brainrot.",
    stock: 15,
    rarity: "Legendary",
    badgeText: "⚡ FIRSAT",
    gamepassName: "180 Robux Gamepass",
    createdAt: Date.now() - 8000000,
  },
  {
    id: "brainrot-4",
    title: "Sigma Boy Giga Brainrot",
    category: "steal-brainrot",
    price: 320,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    description: "Altın çene hatları ve durdurulamaz savunma aurası ile Mythic koruma sağlar.",
    stock: 5,
    rarity: "Mythic",
    badgeText: "💎 AZ STOK",
    gamepassName: "320 Robux Gamepass",
    createdAt: Date.now() - 7000000,
  },
  {
    id: "mm2-1",
    title: "Harvester Ancient Crossbow",
    category: "mm2",
    price: 1200,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    description: "Murder Mystery 2 tarihinin en değerli ve güçlü Ancient yay silahı. Özel vurma efekti!",
    stock: 4,
    rarity: "Ancient",
    badgeText: "👑 KRAL İTEM",
    gamepassName: "1200 Robux Gamepass",
    createdAt: Date.now() - 6000000,
  },
  {
    id: "mm2-2",
    title: "Corrupt Godly Knife",
    category: "mm2",
    price: 950,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    description: "Klasik ve efsanevi MM2 Godly bıçağı. Yüksek değer ve takas popülaritesi.",
    stock: 3,
    rarity: "Godly",
    badgeText: "⚔️ GODLY",
    gamepassName: "950 Robux Gamepass",
    createdAt: Date.now() - 5000000,
  },
  {
    id: "mm2-3",
    title: "Bat Ancient Knife",
    category: "mm2",
    price: 850,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    description: "Karanlık kanatlı özel tasarım MM2 Ancient bıçak. Cadılar bayramı etkinliği klasiği.",
    stock: 6,
    rarity: "Ancient",
    badgeText: "🦇 ANCIENT",
    gamepassName: "850 Robux Gamepass",
    createdAt: Date.now() - 4000000,
  },
  {
    id: "mm2-4",
    title: "Heartblade Godly Knife",
    category: "mm2",
    price: 150,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80",
    description: "Pembe parıltılı, sevilen pembe efektli uygun fiyatlı MM2 Godly.",
    stock: 20,
    rarity: "Godly",
    badgeText: "💖 HIZLI TESLİM",
    gamepassName: "150 Robux Gamepass",
    createdAt: Date.now() - 3000000,
  },
];

const DEFAULT_CODES = [
  {
    id: "code-1",
    code: "CBBOSS2026",
    rewardItem: "Mega Trallallero Brainrot",
    category: "steal-brainrot",
    initialStock: 5,
    remainingStock: 5,
    createdAt: Date.now() - 2000000,
    claimedBy: [],
  },
  {
    id: "code-2",
    code: "MM2FREE",
    rewardItem: "Heartblade Godly Knife",
    category: "mm2",
    initialStock: 3,
    remainingStock: 3,
    createdAt: Date.now() - 1000000,
    claimedBy: [],
  },
  {
    id: "code-3",
    code: "BRAINROT100",
    rewardItem: "Skibidi Toilet Titan Brainrot",
    category: "steal-brainrot",
    initialStock: 10,
    remainingStock: 10,
    createdAt: Date.now() - 500000,
    claimedBy: [],
  }
];

interface DatabaseSchema {
  items: any[];
  codes: any[];
  orders: any[];
  chats: any[];
  version: number;
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading db file, restoring defaults", err);
  }

  const initialDB: DatabaseSchema = {
    items: DEFAULT_ITEMS,
    codes: DEFAULT_CODES,
    orders: [],
    chats: [],
    version: 1,
  };
  saveDB(initialDB);
  return initialDB;
}

function saveDB(data: DatabaseSchema) {
  try {
    data.version = (data.version || 0) + 1;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db file", err);
  }
}

let db = loadDB();

// Fixed Admin credentials requested by user
const ADMIN_EMAIL = "omermikayilov69@gmail.com";
const ADMIN_PASSWORD = "Baku2026_123123";
const ADMIN_TOKEN_SECRET = "cbboss_admin_secret_token_9941";
const ADMIN_ROBLOX_USERNAME = "CBBOSSTEAM";
const ADMIN_DISPLAY_NAME = "YTCBBOSS";

// Auth middleware helper
function checkAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenFromBearer = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
  const tokenFromHeader = (req.headers['x-admin-token'] as string || '').trim();
  const tokenFromQuery = (req.query.token as string || '').trim();

  const token = tokenFromBearer || tokenFromHeader || tokenFromQuery;
  if (token === ADMIN_TOKEN_SECRET) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Yetkisiz erişim! Yönetici yetkiniz bulunmamaktadır.",
  });
}

// ---------------- API ROUTES ----------------

// 1. Version / sync endpoint
app.get("/api/state-version", (req, res) => {
  res.json({ version: db.version });
});

// 2. Auth: Admin Login
app.post("/api/auth/admin", (req, res) => {
  const { email, password } = req.body;
  
  if (
    typeof email === "string" &&
    typeof password === "string" &&
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password.trim() === ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN_SECRET,
      user: {
        email: ADMIN_EMAIL,
        name: ADMIN_DISPLAY_NAME,
        displayName: ADMIN_DISPLAY_NAME,
        robloxUsername: ADMIN_ROBLOX_USERNAME,
        role: "admin",
      },
    });
  }

  // Strict refusal on invalid credentials
  return res.status(401).json({
    success: false,
    message: "Şifre veya e-posta hatalı! Kesinlikle yönetici yetkisi verilemez.",
  });
});

// 3. Auth: User Login via Roblox username
app.post("/api/auth/roblox", (req, res) => {
  const { robloxUsername } = req.body;
  if (!robloxUsername || typeof robloxUsername !== "string" || robloxUsername.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Geçerli bir Roblox kullanıcı adı giriniz (en az 2 karakter).",
    });
  }

  const cleanUsername = robloxUsername.trim();
  res.json({
    success: true,
    user: {
      robloxUsername: cleanUsername,
      role: "user",
    },
  });
});

// 4. Items: Get all
app.get("/api/items", (req, res) => {
  res.json({
    success: true,
    items: db.items,
    version: db.version,
  });
});

// 5. Items: Create (Admin only)
app.post("/api/items", checkAdminAuth, (req, res) => {
  const { title, category, price, image, description, stock, rarity, badgeText, gamepassName } = req.body;
  
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) {
    return res.status(400).json({ success: false, message: "İlan başlığı zorunludur." });
  }

  const numPrice = Number(price);
  const finalPrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 100;
  const numStock = Number(stock);
  const finalStock = !isNaN(numStock) && numStock >= 0 ? numStock : 10;
  const finalCat = category === "mm2" ? "mm2" : "steal-brainrot";

  const newItem = {
    id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    title: cleanTitle,
    category: finalCat,
    price: finalPrice,
    image: (image && String(image).trim()) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    description: (description && String(description).trim()) || "Roblox CBBOSS SHOP özel ürünü.",
    stock: finalStock,
    rarity: rarity || "Mythic",
    badgeText: badgeText ? String(badgeText).trim() : "",
    gamepassName: gamepassName || `${finalPrice} Robux Gamepass`,
    createdAt: Date.now(),
  };

  db.items.unshift(newItem);
  saveDB(db);

  res.json({ success: true, item: newItem });
});

// 6. Items: Update (Admin only)
app.put("/api/items/:id", checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = db.items.findIndex((i) => i.id === id);

  if (index === -1) {
    const numPrice = Number(req.body.price) > 0 ? Number(req.body.price) : 100;
    const fallbackItem = {
      ...req.body,
      id,
      price: numPrice,
      stock: Number(req.body.stock) >= 0 ? Number(req.body.stock) : 10,
    };
    db.items.unshift(fallbackItem);
    saveDB(db);
    return res.json({ success: true, item: fallbackItem });
  }

  const current = db.items[index];
  const updated = {
    ...current,
    ...req.body,
    id: current.id, // preserve id
    price: req.body.price !== undefined && !isNaN(Number(req.body.price)) ? Number(req.body.price) : current.price,
    stock: req.body.stock !== undefined && !isNaN(Number(req.body.stock)) ? Number(req.body.stock) : current.stock,
  };

  db.items[index] = updated;
  saveDB(db);

  res.json({ success: true, item: updated });
});

// 7. Items: Delete (Admin only)
app.delete("/api/items/:id", checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const initialCount = db.items.length;
  db.items = db.items.filter((i) => i.id !== id);

  if (db.items.length === initialCount) {
    return res.status(404).json({ success: false, message: "İlan bulunamadı." });
  }

  saveDB(db);
  res.json({ success: true, message: "İlan başarıyla silindi." });
});

// 8. Promo Codes: Get (Admin sees all with details, users see public counts)
app.get("/api/codes", (req, res) => {
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader === `Bearer ${ADMIN_TOKEN_SECRET}`;

  if (isAdmin) {
    return res.json({ success: true, codes: db.codes });
  }

  // Public summary without secret code values if needed, or list of active public codes
  const publicList = db.codes.map((c) => ({
    id: c.id,
    rewardItem: c.rewardItem,
    category: c.category,
    remainingStock: c.remainingStock,
    initialStock: c.initialStock,
    isActive: c.remainingStock > 0,
  }));

  res.json({ success: true, codes: publicList });
});

// 9. Promo Codes: Create (Admin only)
app.post("/api/codes", checkAdminAuth, (req, res) => {
  const { code, rewardItem, category, stock } = req.body;
  if (!code || !rewardItem) {
    return res.status(400).json({ success: false, message: "Kod adı ve ödül itemi zorunludur." });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const existing = db.codes.find((c) => c.code.toUpperCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ success: false, message: "Bu kod zaten mevcut!" });
  }

  const numStock = Number(stock) > 0 ? Number(stock) : 5;
  const newCode = {
    id: "code-" + Date.now(),
    code: cleanCode,
    rewardItem: String(rewardItem).trim(),
    category: category === "mm2" ? "mm2" : "steal-brainrot",
    initialStock: numStock,
    remainingStock: numStock,
    createdAt: Date.now(),
    claimedBy: [],
  };

  db.codes.unshift(newCode);
  saveDB(db);

  res.json({ success: true, code: newCode });
});

// 10. Promo Codes: Delete (Admin only)
app.delete("/api/codes/:id", checkAdminAuth, (req, res) => {
  const { id } = req.params;
  db.codes = db.codes.filter((c) => c.id !== id);
  saveDB(db);
  res.json({ success: true, message: "Kod silindi." });
});

// 11. Promo Codes: Redeem (User)
app.post("/api/codes/redeem", (req, res) => {
  const { code, robloxUsername } = req.body;
  if (!code || !robloxUsername) {
    return res.status(400).json({ success: false, message: "Kod ve Roblox kullanıcı adı zorunludur." });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const cleanUsername = String(robloxUsername).trim();

  const targetCode = db.codes.find((c) => c.code.toUpperCase() === cleanCode);
  if (!targetCode) {
    return res.status(404).json({ success: false, message: "Geçersiz veya bulunamayan kod!" });
  }

  targetCode.claimedBy = targetCode.claimedBy || [];

  // Check if this username has already claimed this code (case-insensitive & whitespace trimmed)
  const alreadyClaimed = targetCode.claimedBy.some((claim: any) => {
    const claimedName = typeof claim === "string" ? claim : claim?.robloxUsername;
    return claimedName && String(claimedName).trim().toLowerCase() === cleanUsername.toLowerCase();
  });

  if (alreadyClaimed) {
    return res.status(400).json({
      success: false,
      alreadyClaimed: true,
      message: "Bu kodu zaten kullandınız! Her kullanıcı bir promosyon kodunu yalnızca 1 kez kullanabilir.",
    });
  }

  if (targetCode.remainingStock <= 0) {
    return res.status(400).json({ success: false, message: "Bu kodun stokları tükenmiştir!" });
  }

  // Deduct stock automatically
  targetCode.remainingStock -= 1;

  // Create ticket and chat thread for this claim
  const ticketId = "TICKET-" + Date.now().toString(36).toUpperCase();
  targetCode.claimedBy.push({
    robloxUsername: cleanUsername,
    claimedAt: Date.now(),
    ticketId,
  });

  const chatThread = {
    id: ticketId,
    robloxUsername: cleanUsername,
    title: `🎁 Kod Ödülü: ${targetCode.rewardItem}`,
    type: "code_claim",
    status: "open",
    codeClaimed: targetCode.code,
    rewardItem: targetCode.rewardItem,
    createdAt: Date.now(),
    lastMessageAt: Date.now(),
    messages: [
      {
        id: "msg-init-" + Date.now(),
        sender: "system",
        senderName: "Sistem",
        text: `🎉 Tebrikler! ${cleanUsername} kullanıcısı '${targetCode.code}' kodunu kullandı ve '${targetCode.rewardItem}' kazandı! Admin teslimatı için bekleniyor.`,
        timestamp: Date.now(),
      },
      {
        id: "msg-admin-auto-" + Date.now(),
        sender: "admin",
        senderName: `${ADMIN_DISPLAY_NAME} (@${ADMIN_ROBLOX_USERNAME})`,
        text: `Selam ${cleanUsername}! Kodun başarıyla onaylandı. Roblox hesabım @${ADMIN_ROBLOX_USERNAME} (Görünen adım: ${ADMIN_DISPLAY_NAME}). Ödülün olan '${targetCode.rewardItem}' eşyasını teslim etmek için hazırım. Oyuna girip beni arkadaş ekle veya sohbete yaz!`,
        timestamp: Date.now() + 100,
      }
    ],
  };

  db.chats.unshift(chatThread);
  saveDB(db);

  res.json({
    success: true,
    message: "Tebrikler! Kod başarıyla kullanıldı.",
    rewardItem: targetCode.rewardItem,
    remainingStock: targetCode.remainingStock,
    ticketId,
  });
});

// 12. Orders: Create Order from Cart
app.post("/api/orders", (req, res) => {
  const { robloxUsername, items, totalPrice } = req.body;
  if (!robloxUsername || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Sepet veya kullanıcı adı boş olamaz." });
  }

  const cleanUsername = String(robloxUsername).trim();
  const orderId = "ORD-" + Date.now().toString(36).toUpperCase();
  const ticketId = "CHAT-" + Date.now().toString(36).toUpperCase();

  const itemSummary = items.map((i: any) => `${i.title} (${i.quantity}x)`).join(", ");

  const newOrder = {
    id: orderId,
    robloxUsername: cleanUsername,
    items,
    totalPrice: Number(totalPrice) || 0,
    status: "pending_gamepass",
    ticketId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const newChat = {
    id: ticketId,
    robloxUsername: cleanUsername,
    title: `🛒 Sipariş: ${itemSummary.length > 50 ? itemSummary.substring(0, 47) + "..." : itemSummary}`,
    type: "order",
    status: "open",
    orderId,
    totalRobux: newOrder.totalPrice,
    createdAt: Date.now(),
    lastMessageAt: Date.now(),
    messages: [
      {
        id: "msg-sys-order",
        sender: "system",
        senderName: "Sistem",
        text: `Sipariş #${orderId} oluşturuldu. Toplam: ${newOrder.totalPrice} Robux. Gamepass alımı bekleniyor.`,
        timestamp: Date.now(),
      }
    ],
  };

  db.orders.unshift(newOrder);
  db.chats.unshift(newChat);
  saveDB(db);

  res.json({
    success: true,
    orderId,
    ticketId,
    robloxStoreUrl: "https://www.roblox.com/tr/games/77956189816312/Youtube-CBBOSS#!/store",
  });
});

// 13. Orders: Confirm Gamepass Bought
app.post("/api/orders/:id/confirm-gamepass", (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Sipariş bulunamadı." });
  }

  order.status = "gamepass_bought";
  order.updatedAt = Date.now();

  // Deduct stock of items in order
  for (const ordItem of order.items) {
    const it = db.items.find((x) => x.id === ordItem.itemId);
    if (it && it.stock > 0) {
      it.stock = Math.max(0, it.stock - ordItem.quantity);
    }
  }

  // Update chat thread
  const chat = db.chats.find((c) => c.id === order.ticketId);
  if (chat) {
    chat.lastMessageAt = Date.now();
    chat.messages.push({
      id: "msg-bought-" + Date.now(),
      sender: "system",
      senderName: "Sistem",
      text: `🎉 Kullanıcı Roblox mağazasından Gamepass aldığını bildirdi! (Toplam: ${order.totalPrice} Robux). Canlı teslimat başladı.`,
      timestamp: Date.now(),
    });
    chat.messages.push({
      id: "msg-adm-welcome-" + Date.now(),
      sender: "admin",
      senderName: `${ADMIN_DISPLAY_NAME} (@${ADMIN_ROBLOX_USERNAME})`,
      text: `Merhaba ${order.robloxUsername}! Tebrikler ve teşekkürler! Roblox mağazasındaki gamepass alımını gördüm. Roblox kullanıcı adım: @${ADMIN_ROBLOX_USERNAME} (Görünen adım: ${ADMIN_DISPLAY_NAME}). Oyunda sana ürünlerini teslim etmek için hazırım. Roblox ismin '${order.robloxUsername}' doğru mu? Bana buradan yaz, oyuna girip teslimatı tamamlayalım!`,
      timestamp: Date.now() + 50,
    });
  }

  saveDB(db);
  res.json({
    success: true,
    message: "Congrats! Gamepass alımı onaylandı.",
    ticketId: order.ticketId,
  });
});

// 14. Chats: Get list
app.get("/api/chats", (req, res) => {
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader === `Bearer ${ADMIN_TOKEN_SECRET}`;
  const { username } = req.query;

  if (isAdmin) {
    return res.json({ success: true, chats: db.chats });
  }

  if (username && typeof username === "string") {
    const userChats = db.chats.filter(
      (c) => c.robloxUsername.toLowerCase() === username.trim().toLowerCase()
    );
    return res.json({ success: true, chats: userChats });
  }

  res.json({ success: true, chats: [] });
});

// 15. Chats: Get single thread
app.get("/api/chats/:id", (req, res) => {
  const { id } = req.params;
  const chat = db.chats.find((c) => c.id === id);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Sohbet odası bulunamadı." });
  }
  res.json({ success: true, chat });
});

// 16. Chats: Send Message
app.post("/api/chats/:id/messages", (req, res) => {
  const { id } = req.params;
  const { text, sender, senderName } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ success: false, message: "Mesaj metni boş olamaz." });
  }

  const chat = db.chats.find((c) => c.id === id);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Sohbet odası bulunamadı." });
  }

  const authHeader = req.headers.authorization;
  const isAdmin = authHeader === `Bearer ${ADMIN_TOKEN_SECRET}`;

  const message = {
    id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    sender: isAdmin ? "admin" : (sender === "admin" ? "user" : "user"),
    senderName: isAdmin ? `${ADMIN_DISPLAY_NAME} (@${ADMIN_ROBLOX_USERNAME})` : (senderName || chat.robloxUsername),
    text: text.trim(),
    timestamp: Date.now(),
  };

  chat.messages.push(message);
  chat.lastMessageAt = Date.now();
  saveDB(db);

  res.json({ success: true, message, chat });
});

// 17. Chats: Mark as Delivered (Admin only)
app.patch("/api/chats/:id/deliver", checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const chat = db.chats.find((c) => c.id === id);
  if (!chat) {
    return res.status(404).json({ success: false, message: "Sohbet odası bulunamadı." });
  }

  chat.status = "delivered";
  chat.messages.push({
    id: "msg-deliv-" + Date.now(),
    sender: "system",
    senderName: "Sistem",
    text: "✅ ÜRÜN BAŞARIYLA OYUN İÇİNDE TESLİM EDİLDİ! CBBOSS SHOP'u tercih ettiğiniz için teşekkür ederiz.",
    timestamp: Date.now(),
  });

  if (chat.orderId) {
    const order = db.orders.find((o) => o.id === chat.orderId);
    if (order) {
      order.status = "delivered";
      order.updatedAt = Date.now();
    }
  }

  saveDB(db);
  res.json({ success: true, chat });
});

// Catch-all for API endpoints to ensure JSON is ALWAYS returned (never HTML)
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `API rotası bulunamadı: ${req.method} ${req.originalUrl}` });
});

// Central error handler for /api
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("API error caught:", err);
  if (req.path.startsWith("/api")) {
    return res.status(500).json({ success: false, message: err?.message || "Sunucu hatası oluştu." });
  }
  next(err);
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CBBOSS SHOP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
