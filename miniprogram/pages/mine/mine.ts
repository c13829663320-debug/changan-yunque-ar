import { getProgressStore } from '../../store/progress';
import { getSpots } from '../../data/repositories/spotRepo';
import { Spot } from '../../data/types/spot';

Page({
  data: {
    scaleCount: 0,
    stampCount: 0,
    spots: [] as Spot[],
  },

  onLoad() {
    this.setData({ spots: getSpots() });
  },

  onShow() {
    const s = getProgressStore().snapshot;
    this.setData({
      scaleCount: s.scales.length,
      stampCount: s.stamps.length,
    });
  },

  goSpot(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({ url: `/package-spot/pages/spot-detail/spot-detail?id=${id}` });
  },

  onMenu(e: WechatMiniprogram.TouchEvent) {
    const k = (e.currentTarget.dataset as { k: string }).k;
    if (k === 'intention') {
      wx.navigateTo({ url: '/package-mall/pages/intention/intention' });
      return;
    }
    const map: Record<string, string> = {
      booking: '体验预约即将上线',
      source: '史料卡将在巡游中收集',
      share: '完成玄武门终章后可生成祈愿分享',
      about: '长安云阙 · 盛唐文物活化 AR文旅助手 v0.1.0',
    };
    wx.showToast({ title: map[k] || '即将上线', icon: 'none' });
  },

  onReset() {
    wx.showModal({
      title: '重置进度',
      content: '将清空已收集的龙鳞与集章，确定吗？',
      success: (res) => {
        if (res.confirm) {
          getProgressStore().reset();
          this.setData({ scaleCount: 0, stampCount: 0 });
          wx.showToast({ title: '已重置', icon: 'success' });
        }
      },
    });
  },
});
