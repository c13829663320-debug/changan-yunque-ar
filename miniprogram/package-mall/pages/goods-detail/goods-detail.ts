import { getGoods } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';

const CART_KEY = 'changan_yunque_cart';
const INTENTION_KEY = 'changan_yunque_intentions';

Page({
  data: {
    goods: null as Goods | null,
    categoryLabel: '',
    showAR: false,
    arTip: '',
  },

  onLoad(query) {
    const id = query?.id || '';
    const goods = getGoods(id);
    this.setData({
      goods: goods || null,
      categoryLabel: goods ? CATEGORY_LABEL[goods.category] : '',
    });
  },

  previewAR() {
    this.setData({
      showAR: true,
      arTip: 'M1接入XRFrame后将呈现商品3D模型；扫描实物可召唤云阙与文物讲解',
    });
  },

  closeAR() {
    this.setData({ showAR: false });
  },

  noop() {},

  addCart() {
    try {
      const cart = (wx.getStorageSync(CART_KEY) as string[]) || [];
      const id = this.data.goods?.id;
      if (id && !cart.includes(id)) cart.push(id);
      wx.setStorageSync(CART_KEY, cart);
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '加入失败', icon: 'none' });
    }
  },

  registerIntention() {
    try {
      const list = (wx.getStorageSync(INTENTION_KEY) as string[]) || [];
      const id = this.data.goods?.id;
      if (id && !list.includes(id)) list.push(id);
      wx.setStorageSync(INTENTION_KEY, list);
      wx.navigateTo({ url: '/package-mall/pages/intention/intention' });
    } catch (err) {
      wx.showToast({ title: '登记失败', icon: 'none' });
    }
  },

  goCart() {
    wx.navigateTo({ url: '/package-mall/pages/cart/cart' });
  },
});
