import { getCartDetail, changeCartQty, removeFromCart, stageItems, clearCart } from '../../../data/repositories/goodsRepo';

interface CartLineVM {
  id: string;
  qty: number;
  goods: {
    id: string;
    name: string;
    price: number;
    cover?: string;
    category?: string;
  };
  categoryLabel: string;
  subtotal: number;
}

Page({
  data: {
    lines: [] as CartLineVM[],
    total: '0.00',
    count: 0,
    loading: true,
    submitting: false,
  },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ loading: true });
    try {
      const detail = await getCartDetail();
      const lines = (detail.lines || []) as CartLineVM[];
      this.setData({
        lines,
        total: (detail.total || 0).toFixed(2),
        count: detail.count || 0,
        loading: false,
      });
    } catch (err) {
      this.setData({ lines: [], total: '0.00', count: 0, loading: false });
      wx.showToast({ title: '购物车加载失败', icon: 'none' });
    }
  },

  async changeQty(e: WechatMiniprogram.TouchEvent) {
    const { id, qty, delta } = e.currentTarget.dataset as { id: string; qty: number; delta: number };
    try {
      // 已为 1 时再点 − 视为移除
      if (Number(qty) <= 1 && Number(delta) < 0) {
        await removeFromCart(id);
        wx.showToast({ title: '已移除', icon: 'none' });
        await this.load();
        return;
      }
      await changeCartQty(id, Number(delta));
      wx.vibrateShort({ type: 'light' });
      await this.load();
    } catch (err) {
      wx.showToast({ title: '数量更新失败', icon: 'none' });
    }
  },

  remove(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.showModal({
      title: '移除商品',
      content: '确定将该商品移出购物车吗？',
      confirmColor: '#9e4a2a',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await removeFromCart(id);
          wx.showToast({ title: '已移除', icon: 'none' });
          await this.load();
        } catch (err) {
          wx.showToast({ title: '移除失败', icon: 'none' });
        }
      },
    });
  },

  async checkout() {
    if (this.data.submitting) return;
    if (!this.data.lines.length) {
      wx.showToast({ title: '购物车还是空的', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      const items = this.data.lines.map((l) => ({ id: l.id, qty: l.qty }));
      await stageItems(items);
      await clearCart();
      wx.redirectTo({ url: '/package-mall/pages/intention/intention' });
    } catch (err) {
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      this.setData({ submitting: false });
    }
  },

  goMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  },
});
