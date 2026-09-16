export type ItemCategory = 'steal-brainrot' | 'mm2';

export type ItemRarity = 'Secret' | 'Mythic' | 'Godly' | 'Ancient' | 'Legendary' | 'Rare';

export interface ShopItem {
  id: string;
  title: string;
  category: ItemCategory;
  price: number; // Robux
  image: string;
  description: string;
  stock: number;
  rarity: ItemRarity;
  badgeText?: string;
  gamepassName?: string;
  createdAt: number;
}

export interface PromoCode {
  id: string;
  code: string;
  rewardItem: string;
  category: ItemCategory;
  initialStock: number;
  remainingStock: number;
  createdAt: number;
  claimedBy: Array<{
    robloxUsername: string;
    claimedAt: number;
    ticketId: string;
  }>;
}

export interface CartItem {
  item: ShopItem;
  quantity: number;
}

export interface OrderItem {
  itemId: string;
  title: string;
  category: ItemCategory;
  price: number;
  quantity: number;
  image: string;
  rarity: ItemRarity;
}

export interface Order {
  id: string;
  robloxUsername: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending_gamepass' | 'gamepass_bought' | 'delivered';
  ticketId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'system';
  senderName: string;
  text: string;
  timestamp: number;
}

export interface ChatThread {
  id: string; // ticketId
  robloxUsername: string;
  title: string;
  type: 'order' | 'code_claim' | 'support';
  status: 'open' | 'delivered' | 'closed';
  orderId?: string;
  codeClaimed?: string;
  rewardItem?: string;
  totalRobux?: number;
  createdAt: number;
  lastMessageAt: number;
  messages: ChatMessage[];
}

export interface UserSession {
  role: 'admin' | 'user';
  robloxUsername?: string;
  displayName?: string;
  name?: string;
  email?: string;
  adminToken?: string;
}
