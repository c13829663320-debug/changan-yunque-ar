import { getGoods } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';

const INTENTION_KEY = 'changan_yunque_intentions';

interface IntVM extends Goods {
  categoryLabel: string;
}

Page({
  data: {
    items: [] as IntVM[],
  },

  onShow() {
    this.load();
  },

  load() {
    const ids = (wx.getStorageSync(INTENTION_KEY) as string[]) || [];
    const items: IntVM[] = ids
      .map((id) => getGoods(id))
      .filter((g): g is Goods => !!g)
      .map((g) => ({ ...g, categoryLabel: CATEGORY_LABEL[g.category] }));
    this.setData({ items });
  },

  clear() {
    wx.showModal({
      title: '清空意向单',
      content: '确定清空全部意向登记吗？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync(INTENTION_KEY, []);
          this.setData({ items: [] });
        }
      },
    });
  },

  goMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  },
});
