import { getGoods, isCulturalRelic, relicBadgeText, addToCart, stageItems } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';

const AR_INIT = { x: 0, y: 0, rotate: 0, scale: 1 };

Page({
  data: {
    goods: null as Goods | null,
    categoryLabel: '',
    // gallery 轮播
    images: [] as string[],
    current: 0,
    // 文物灵感卡
    isRelic: false,
    relicBadge: '',
    // AR 预览
    showAR: false,
    isSummoning: false,
    arImage: '',
    arTransform: 'translate(0px,0px) rotate(0deg) scale(1)',
    arTip: '单指拖动旋转 · 双指捏合缩放',
    // 防连点
    adding: false,
  },

  _summonTimer: 0 as number,
  // AR 手势交互态（非响应式）
  _ar: { ...AR_INIT } as typeof AR_INIT,
  _gesture: null as null | {
    mode: 'rotate' | 'pinch';
    startAngle: number;
    startDist: number;
    startX: number;
    startY: number;
    baseRotate: number;
    baseScale: number;
    baseTx: number;
    baseTy: number;
    cx: number;
    cy: number;
  },

  onLoad(query: Record<string, string>) {
    const id = query?.id || '';
    let goods: Goods | undefined;
    try {
      goods = getGoods(id);
    } catch (err) {
      goods = undefined;
    }
    if (!goods) {
      this.setData({ goods: null });
      return;
    }

    // gallery：封面 + gallery 去重
    const raw = [goods.cover, ...(goods.gallery || [])].filter(Boolean) as string[];
    const images = Array.from(new Set(raw));
    const isRelic = isCulturalRelic(goods);

    this.setData({
      goods,
      categoryLabel: CATEGORY_LABEL[goods.category] || '',
      images,
      current: 0,
      isRelic,
      relicBadge: isRelic ? relicBadgeText() : '',
      arImage: images[0] || goods.cover || '',
    });
  },

  onUnload() {
    clearTimeout(this._summonTimer);
  },

  // —— gallery 轮播 ——
  onSwiperChange(e: WechatMiniprogram.SwiperChange) {
    const current = e.detail.current;
    this.setData({ current, arImage: this.data.images[current] || this.data.arImage });
  },

  pickImage(e: WechatMiniprogram.TouchEvent) {
    const idx = Number((e.currentTarget.dataset as { idx: number }).idx);
    if (Number.isNaN(idx)) return;
    this.setData({ current: idx, arImage: this.data.images[idx] });
  },

  previewImageCurrent() {
    const { images, current } = this.data;
    if (!images.length) return;
    wx.previewImage({ urls: images, current: images[current] });
  },

  // —— AR 预览 ——
  previewAR() {
    clearTimeout(this._summonTimer);
    this.resetArTransform();
    this.setData({ showAR: true, isSummoning: true });
    // 召唤动效结束后进入可交互态
    this._summonTimer = setTimeout(() => {
      this.setData({ isSummoning: false });
      this.measureViewfinder();
    }, 1800);
  },

  closeAR() {
    clearTimeout(this._summonTimer);
    this._gesture = null;
    this.setData({ showAR: false, isSummoning: false });
  },

  noop() {},

  measureViewfinder() {
    wx.createSelectorQuery()
      .select('.ar-viewfinder')
      .boundingClientRect((rect) => {
        const r = rect as WechatMiniprogram.BoundingClientRectCallbackResult | null;
        if (r) {
          this._viewCenter = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        }
      })
      .exec();
  },

  _viewCenter: { cx: 220, cy: 220 },

  resetArTransform() {
    this._ar = { ...AR_INIT };
    this.setData({ arTransform: this.composeTransform() });
  },

  composeTransform() {
    const a = this._ar;
    return `translate(${a.x}px, ${a.y}px) rotate(${a.rotate}deg) scale(${a.scale})`;
  },

  _angle(x: number, y: number) {
    const { cx, cy } = this._viewCenter;
    return Math.atan2(y - cy, x - cx);
  },

  arTouchStart(e: WechatMiniprogram.TouchEvent) {
    if (this.data.isSummoning) return;
    const t = e.touches;
    if (t.length === 1) {
      const touch = t[0];
      this._gesture = {
        mode: 'rotate',
        startAngle: this._angle(touch.clientX, touch.clientY),
        startDist: 0,
        startX: touch.clientX,
        startY: touch.clientY,
        baseRotate: this._ar.rotate,
        baseScale: this._ar.scale,
        baseTx: this._ar.x,
        baseTy: this._ar.y,
        cx: this._viewCenter.cx,
        cy: this._viewCenter.cy,
      };
    } else if (t.length === 2) {
      const [a, b] = t;
      const dx = b.clientX - a.clientX;
      const dy = b.clientY - a.clientY;
      this._gesture = {
        mode: 'pinch',
        startAngle: Math.atan2(dy, dx),
        startDist: Math.max(1, Math.hypot(dx, dy)),
        startX: 0,
        startY: 0,
        baseRotate: this._ar.rotate,
        baseScale: this._ar.scale,
        baseTx: this._ar.x,
        baseTy: this._ar.y,
        cx: this._viewCenter.cx,
        cy: this._viewCenter.cy,
      };
    }
  },

  arTouchMove(e: WechatMiniprogram.TouchEvent) {
    const g = this._gesture;
    if (!g || this.data.isSummoning) return;
    const t = e.touches;

    if (g.mode === 'rotate' && t.length === 1) {
      const touch = t[0];
      const now = this._angle(touch.clientX, touch.clientY);
      let deg = (now - g.startAngle) * 180 / Math.PI;
      const rotate = g.baseRotate + deg;
      // 单指：以旋转为主，叠加轻微位移（阻尼 0.3）
      const x = g.baseTx + (touch.clientX - g.startX) * 0.3;
      const y = g.baseTy + (touch.clientY - g.startY) * 0.3;
      this._ar = { x, y, rotate, scale: g.baseScale };
      this.setData({ arTransform: this.composeTransform() });
    } else if (g.mode === 'pinch' && t.length === 2) {
      const [a, b] = t;
      const dx = b.clientX - a.clientX;
      const dy = b.clientY - a.clientY;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const nowAngle = Math.atan2(dy, dx);
      const deg = (nowAngle - g.startAngle) * 180 / Math.PI;
      let scale = g.baseScale * (dist / g.startDist);
      scale = Math.min(3, Math.max(0.5, scale));
      this._ar = { x: g.baseTx, y: g.baseTy, rotate: g.baseRotate + deg, scale };
      this.setData({ arTransform: this.composeTransform() });
    }
  },

  arTouchEnd() {
    this._gesture = null;
  },

  // —— 底部操作 ——
  goCart() {
    wx.navigateTo({ url: '/package-mall/pages/cart/cart' });
  },

  async addCart() {
    if (this.data.adding || !this.data.goods) return;
    this.setData({ adding: true });
    try {
      await addToCart(this.data.goods.id, 1);
      wx.vibrateShort({ type: 'light' });
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '加入购物车失败', icon: 'none' });
    } finally {
      setTimeout(() => this.setData({ adding: false }), 600);
    }
  },

  async register() {
    if (!this.data.goods) return;
    try {
      await stageItems([{ id: this.data.goods.id, qty: 1 }]);
      wx.navigateTo({ url: '/package-mall/pages/intention/intention' });
    } catch (err) {
      wx.showToast({ title: '登记失败，请重试', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },
});
