import { getGoods } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';
import config from '../../../config/index';

const INTENTION_KEY = 'changan_yunque_intentions';
const SUBMITTED_KEY = 'changan_yunque_intentions_done';

interface IntVM extends Goods {
  categoryLabel: string;
}

Page({
  data: {
    items: [] as IntVM[],
    name: '',
    phone: '',
    remark: '',
    submitting: false,
    submitted: false,
    cloudReady: false,
  },

  onShow() {
    const doneIds = (wx.getStorageSync(SUBMITTED_KEY) as string[]) || [];
    const ids = (wx.getStorageSync(INTENTION_KEY) as string[]) || [];
    const pending = ids.filter((id) => !doneIds.includes(id));
    const showIds = pending.length ? pending : doneIds;
    const items: IntVM[] = showIds
      .map((id) => getGoods(id))
      .filter((g): g is Goods => !!g)
      .map((g) => ({ ...g, categoryLabel: CATEGORY_LABEL[g.category] }));
    const cloudReady = !!(wx.cloud && (wx.cloud as { callFunction?: unknown }).callFunction);
    this.setData({
      items,
      submitted: pending.length === 0 && doneIds.length > 0,
      cloudReady,
    });
    if (cloudReady && !config.useMock) this.queryCloud();
  },

  /** 云端模式：从云函数查询当前用户的历史意向 */
  queryCloud() {
    wx.cloud.callFunction({
      name: 'intention',
      data: { action: 'query' },
      success: (res) => {
        const result = res.result as
          | { success?: boolean; list?: { goodsId: string }[] }
          | undefined;
        const list = result?.list;
        if (result?.success && Array.isArray(list) && list.length) {
          const cloudIds = Array.from(new Set(list.map((x) => x.goodsId)));
          const cloudItems: IntVM[] = cloudIds
            .map((id) => getGoods(id))
            .filter((g): g is Goods => !!g)
            .map((g) => ({ ...g, categoryLabel: CATEGORY_LABEL[g.category] }));
          this.setData({ items: cloudItems, submitted: true });
        }
      },
    });
  },

  onName(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },
  onPhone(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value });
  },
  onRemark(e: WechatMiniprogram.Input) {
    this.setData({ remark: e.detail.value });
  },

  submit() {
    const { name, phone, items, remark, cloudReady } = this.data;
    if (!items.length) {
      wx.showToast({ title: '没有意向商品', icon: 'none' });
      return;
    }
    if (!name.trim()) {
      wx.showToast({ title: '请填写称呼', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请填写正确手机号', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const goodsIds = items.map((g) => g.id);
    const done = () => {
      const existing = (wx.getStorageSync(SUBMITTED_KEY) as string[]) || [];
      wx.setStorageSync(SUBMITTED_KEY, Array.from(new Set([...existing, ...goodsIds])));
      wx.setStorageSync(INTENTION_KEY, []);
      this.setData({ submitting: false, submitted: true });
    };

    if (cloudReady) {
      wx.cloud.callFunction({
        name: 'intention',
        data: { goodsIds, name: name.trim(), phone, remark },
        success: (res) => {
          const result = res.result as { success?: boolean } | undefined;
          if (result && result.success) {
            done();
          } else {
            done();
            wx.showToast({ title: '云端暂不可用，已本地登记', icon: 'none' });
          }
        },
        fail: () => {
          done();
          wx.showToast({ title: '演示模式：已本地登记', icon: 'none' });
        },
      });
    } else {
      done();
      wx.showToast({ title: '演示模式：已本地登记', icon: 'none' });
    }
  },

  clear() {
    wx.showModal({
      title: '清空意向单',
      content: '确定清空全部意向登记吗？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync(INTENTION_KEY, []);
          wx.setStorageSync(SUBMITTED_KEY, []);
          this.setData({ items: [], submitted: false });
        }
      },
    });
  },

  goMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  },
});
