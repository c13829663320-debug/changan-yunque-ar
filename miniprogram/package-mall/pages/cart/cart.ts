import { getGoods } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';

const CART_KEY = 'changan_yunque_cart';
const INTENTION_KEY = 'changan_yunque_intentions';

interface CartVM extends Goods {
  categoryLabel: string;
}

Page({
  data: {
    items: [] as CartVM[],
    total: '0',
  },

  onShow() {
    this.load();
  },

  load() {
    const ids = (wx.getStorageSync(CART_KEY) as string[]) || [];
    const items: CartVM[] = ids
      .map((id) => getGoods(id))
      .filter((g): g is Goods => !!g)
      .map((g) => ({ ...g, categoryLabel: CATEGORY_LABEL[g.category] }));
    const sum = items.reduce((acc, g) => acc + g.price, 0);
    this.setData({ items, total: sum.toFixed(2) });
  },

  remove(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const ids = ((wx.getStorageSync(CART_KEY) as string[]) || []).filter((x) => x !== id);
    wx.setStorageSync(CART_KEY, ids);
    this.load();
  },

  checkout() {
    const ids = (wx.getStorageSync(CART_KEY) as string[]) || [];
    const existing = (wx.getStorageSync(INTENTION_KEY) as string[]) || [];
    const merged = Array.from(new Set([...existing, ...ids]));
    wx.setStorageSync(INTENTION_KEY, merged);
    wx.setStorageSync(CART_KEY, []);
    wx.redirectTo({ url: '/package-mall/pages/intention/intention' });
  },

  goMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  },
});
