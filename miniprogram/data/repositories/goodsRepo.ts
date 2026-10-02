import catalog from '../goods/catalog';
import { Goods, GoodsCategory, CATEGORY_LABEL } from '../types/goods';

/**
 * goodsRepo — 云阙商城数据访问层（M1 数据层切换）
 *
 * - 商品：同步读本地 catalog（保留原有同步签名，供 pages/home、pages/mall、
 *   package-spot/spot-detail 等既有调用方直接依赖）。
 * - 购物车 / 意向：async，底层用 wx.storage 同步读写并 try/catch 包裹，绝不抛裸异常。
 * - 数据模式：local（默认，纯本地）| cloud（云函数 intention）。
 *   cloud 不可用或云函数传输失败时，意向自动回退本地，前端无感。
 */

// ---------- 常量 ----------
export const CART_KEY = 'changan_yunque_cart';
export const INTENTION_KEY = 'changan_yunque_intentions';
export const DATA_MODE_KEY = 'changan_yunque_data_mode';

// ---------- 类型 ----------
export type DataMode = 'local' | 'cloud';

export interface CartLine {
  id: string;
  qty: number;
}

export interface IntentionItem {
  id: string;
  qty: number;
}

export interface IntentionRecord {
  _id?: string;
  items: IntentionItem[];
  goodsIds: string[];
  goodsCount: number;
  name: string;
  phone: string;
  remark: string;
  createdAt: number | object;
  source?: 'local' | 'cloud';
  notified?: boolean;
}

export interface IntentionLocalStore {
  pending: IntentionItem[];
  records: IntentionRecord[];
}

// ---------- wx 安全封装（storage / cloud 均不抛裸异常） ----------
function safeGet<T>(key: string, fallback: T): T {
  try {
    const v = wx.getStorageSync(key);
    if (v === '' || v === null || v === undefined) return fallback;
    return v as unknown as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    wx.setStorageSync(key, value);
  } catch {
    /* 忽略写入异常，保证调用链不中断 */
  }
}

// ---------- 数据模式 ----------
export function getDataMode(): DataMode {
  const v = safeGet<string>(DATA_MODE_KEY, 'local');
  return v === 'cloud' ? 'cloud' : 'local';
}

export function setDataMode(m: DataMode): void {
  safeSet(DATA_MODE_KEY, m);
}

export function isCloudAvailable(): boolean {
  try {
    return !!(wx && wx.cloud && wx.cloud.callFunction);
  } catch {
    return false;
  }
}

// ---------- 商品（同步，签名保持不变） ----------
export function getAllGoods(): Goods[] {
  return catalog;
}

export function getGoodsByCategory(category: GoodsCategory): Goods[] {
  return catalog.filter((g) => g.category === category);
}

export function getGoods(id: string): Goods | undefined {
  return catalog.find((g) => g.id === id);
}

export function getFeaturedGoods(limit = 6): Goods[] {
  return catalog.slice(0, limit);
}

/** 文物类判定：由 culturalNote 文本推导（不改 data/types） */
export function isCulturalRelic(g?: Goods | null): boolean {
  return /文物灵感/.test((g && g.culturalNote) || '');
}

export function relicBadgeText(): string {
  return '文物灵感 · AIGC再现 · 非原文物';
}

// ---------- 购物车 ----------
function readCart(): CartLine[] {
  const raw = safeGet<CartLine[]>(CART_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l) => l && typeof l.id === 'string' && typeof l.qty === 'number' && l.qty > 0)
    .map((l) => ({ id: l.id, qty: Math.floor(l.qty) }));
}

function writeCart(lines: CartLine[]): void {
  safeSet(CART_KEY, lines);
}

export async function getCartLines(): Promise<CartLine[]> {
  return readCart();
}

export interface CartDetailLine extends CartLine {
  goods: Goods;
  categoryLabel: string;
  subtotal: number;
}

export interface CartDetail {
  lines: CartDetailLine[];
  total: number;
  count: number;
}

export async function getCartDetail(): Promise<CartDetail> {
  const lines = readCart();
  const detailLines: CartDetailLine[] = [];
  for (const l of lines) {
    const goods = getGoods(l.id);
    if (!goods) continue; // 缺失商品过滤
    const subtotal = +(goods.price * l.qty).toFixed(2);
    detailLines.push({
      id: l.id,
      qty: l.qty,
      goods,
      categoryLabel: CATEGORY_LABEL[goods.category] || '',
      subtotal,
    });
  }
  const total = +detailLines.reduce((s, l) => s + l.subtotal, 0).toFixed(2);
  const count = detailLines.reduce((s, l) => s + l.qty, 0);
  return { lines: detailLines, total, count };
}

export async function addToCart(id: string, qty = 1): Promise<void> {
  const lines = readCart();
  const found = lines.find((l) => l.id === id);
  if (found) {
    found.qty += qty; // 已存在累加
  } else {
    lines.push({ id, qty });
  }
  writeCart(lines);
}

export async function changeCartQty(id: string, delta: number): Promise<void> {
  const lines = readCart();
  const idx = lines.findIndex((l) => l.id === id);
  if (idx < 0) return;
  lines[idx].qty += delta;
  if (lines[idx].qty <= 0) lines.splice(idx, 1); // 结果 <=0 移除
  writeCart(lines);
}

export async function setCartQty(id: string, qty: number): Promise<void> {
  const lines = readCart();
  if (qty <= 0) {
    writeCart(lines.filter((l) => l.id !== id));
    return;
  }
  const idx = lines.findIndex((l) => l.id === id);
  if (idx < 0) {
    lines.push({ id, qty });
  } else {
    lines[idx].qty = qty;
  }
  writeCart(lines);
}

export async function removeFromCart(id: string): Promise<void> {
  writeCart(readCart().filter((l) => l.id !== id));
}

export async function clearCart(): Promise<void> {
  writeCart([]);
}

// ---------- 意向登记 ----------
function readIntention(): IntentionLocalStore {
  const s = safeGet<IntentionLocalStore>(INTENTION_KEY, { pending: [], records: [] });
  if (!s || !Array.isArray(s.pending) || !Array.isArray(s.records)) {
    return { pending: [], records: [] };
  }
  return s;
}

function writeIntention(s: IntentionLocalStore): void {
  safeSet(INTENTION_KEY, s);
}

export function getPendingItems(): IntentionItem[] {
  return readIntention().pending;
}

/** 合并同 id（按累加实现） */
export function stageItems(items: IntentionItem[]): IntentionItem[] {
  const store = readIntention();
  const map = new Map<string, number>();
  const push = (arr: IntentionItem[]) => {
    for (const it of arr) {
      if (!it || !it.id) continue;
      map.set(it.id, (map.get(it.id) || 0) + (it.qty > 0 ? Math.floor(it.qty) : 0));
    }
  };
  push(store.pending);
  push(items || []);
  const pending: IntentionItem[] = Array.from(map.entries())
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ id, qty }));
  store.pending = pending;
  writeIntention(store);
  return pending;
}

export function clearPending(): void {
  const store = readIntention();
  store.pending = [];
  writeIntention(store);
}

/** 清空本地待提交与本地记录（云端后台记录保留） */
export function clearIntentions(): void {
  writeIntention({ pending: [], records: [] });
}

function buildLocalRecord(
  input: { name: string; phone: string; remark: string },
  items: IntentionItem[],
): IntentionRecord {
  return {
    items: items.map((it) => ({ id: it.id, qty: it.qty })),
    goodsIds: items.map((it) => it.id),
    goodsCount: items.reduce((s, it) => s + it.qty, 0),
    name: input.name,
    phone: input.phone,
    remark: input.remark,
    createdAt: Date.now(),
    source: 'local',
    notified: false,
  };
}

function appendLocalRecord(input: { name: string; phone: string; remark: string }): IntentionRecord {
  const store = readIntention();
  const record = buildLocalRecord(input, store.pending);
  store.records.push(record);
  store.pending = []; // 本地提交后清空 pending
  writeIntention(store);
  return record;
}

export type SubmitIntentionResult =
  | { success: true; source: 'local'; record: IntentionRecord; message?: string }
  | { success: true; source: 'cloud'; id: string }
  | { success: false; source: 'cloud'; message: string };

export async function submitIntention(input: {
  name: string;
  phone: string;
  remark: string;
}): Promise<SubmitIntentionResult> {
  const pending = getPendingItems();

  if (getDataMode() === 'cloud' && isCloudAvailable()) {
    try {
      const res = (await wx.cloud!.callFunction({
        name: 'intention',
        data: { action: 'create', items: pending, name: input.name, phone: input.phone, remark: input.remark },
      })) as { result?: { success?: boolean; id?: string; message?: string } };
      const r = res && res.result;
      if (r && r.success) {
        clearPending(); // 云端成功才清 pending
        return { success: true, source: 'cloud', id: r.id as string };
      }
      // 业务失败：不清 pending、不本地落库
      return { success: false, source: 'cloud', message: (r && r.message) || '提交失败，请稍后重试' };
    } catch {
      // 传输异常：回退本地登记
      const record = appendLocalRecord(input);
      return { success: true, source: 'local', record, message: '云端不可用，已本地登记' };
    }
  }

  // local 模式
  const record = appendLocalRecord(input);
  return { success: true, source: 'local', record };
}

/** 兼容云端文档：items/goodsIds 缺失时用 goodsId 兜底、qty=1；createdAt 原样；_id 保留 */
function normalizeRecord(raw: any): IntentionRecord {
  if (!raw || typeof raw !== 'object') {
    return { items: [], goodsIds: [], goodsCount: 0, name: '', phone: '', remark: '', createdAt: Date.now() };
  }
  let items: IntentionItem[] = Array.isArray(raw.items)
    ? raw.items
        .map((it: any) => ({
          id: String((it && (it.id ?? it.goodsId)) || ''),
          qty: it && Number(it.qty ?? 1),
        }))
        .filter((it: IntentionItem) => !!it.id)
    : [];
  let goodsIds: string[] = Array.isArray(raw.goodsIds) && raw.goodsIds.length
    ? raw.goodsIds.map(String)
    : items.map((it) => it.id);
  // 云端可能直接以 goodsId 字段表示单条
  if (items.length === 0 && raw.goodsId) {
    items = [{ id: String(raw.goodsId), qty: 1 }];
    goodsIds = [String(raw.goodsId)];
  }
  return {
    _id: raw._id,
    items,
    goodsIds,
    goodsCount: items.reduce((s, it) => s + (it.qty || 0), 0),
    name: raw.name || '',
    phone: raw.phone || '',
    remark: raw.remark || '',
    createdAt: raw.createdAt,
    source: raw.source || 'cloud',
    notified: !!raw.notified,
  };
}

export type ListIntentionsResult =
  | { success: true; source: 'cloud'; list: IntentionRecord[] }
  | { success: true; source: 'local'; list: IntentionRecord[]; message?: string };

export async function listIntentions(): Promise<ListIntentionsResult> {
  if (getDataMode() === 'cloud' && isCloudAvailable()) {
    try {
      const res = (await wx.cloud!.callFunction({
        name: 'intention',
        data: { action: 'query' },
      })) as { result?: { list?: any[] } };
      const list = ((res && res.result && res.result.list) || []).map(normalizeRecord);
      return { success: true, source: 'cloud', list };
    } catch {
      const store = readIntention();
      return { success: true, source: 'local', list: store.records, message: '云端不可用，已显示本地' };
    }
  }
  const store = readIntention();
  return { success: true, source: 'local', list: store.records };
}
