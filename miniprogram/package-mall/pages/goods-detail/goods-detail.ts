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
    activeImage: '',
    thumbList: [] as { url: string }[],
    isSummoning: false,
  },

  _summonTimer: 0 as number,

  onLoad(query) {
    const id = query?.id || '';
    const goods = getGoods(id);
    const gallery = goods?.gallery || [];
    const cover = goods?.cover || '';
    // gallery 缩略条：本地封面 + 高清网络图
    const thumbList = [cover, ...gallery].filter(Boolean).map((url) => ({ url: url as string }));
    const hasGlb = !!goods?.arPreview && /\.glb($|\?)/.test(goods.arPreview);
    this.setData({
      goods: goods || null,
      categoryLabel: goods ? CATEGORY_LABEL[goods.category] : '',
      activeImage: cover,
      thumbList,
      arTip: hasGlb
        ? '已接入 XRFrame 后将可 360° 旋转查看商品模型；当前以封面示意召唤效果。'
        : '将镜头对准商品或实物卡片，云阙会为你召唤文物故事与讲解。',
    });
  },

  pickImage(e: WechatMiniprogram.TouchEvent) {
    const url = (e.currentTarget.dataset as { url: string }).url;
    if (url) this.setData({ activeImage: url });
  },

  previewAR() {
    clearTimeout(this._summonTimer);
    this.setData({ showAR: true, isSummoning: true });
    // 召唤动效结束后进入「已召唤」态（无 glb 时用封面优雅示意）
    this._summonTimer = setTimeout(() => {
      this.setData({ isSummoning: false });
    }, 1800);
  },

  closeAR() {
    clearTimeout(this._summonTimer);
    this.setData({ showAR: false, isSummoning: false });
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
