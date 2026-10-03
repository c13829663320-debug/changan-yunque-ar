import { getRelicsBySpot } from '../../../data/repositories/relicRepo';
import { getProgressStore } from '../../../store/progress';
import { Relic } from '../../../data/types/relic';

interface AlbumCell {
  id: string;
  name: string;
  era: string;
  image: string;
  got: boolean;
}

Page({
  data: {
    cells: [] as AlbumCell[],
    gotCount: 0,
    total: 0,
    // 详情弹层
    detail: null as Relic | null,
    lines: [] as string[],
  },

  onLoad() {
    this.build();
  },

  onShow() {
    this.build();
  },

  build() {
    const got = new Set(getProgressStore().snapshot.collectedRelicIds);
    const all = getRelicsBySpot('daminggong');
    const cells: AlbumCell[] = all.map((r) => ({
      id: r.id,
      name: r.name,
      era: r.era,
      image: r.image,
      got: got.has(r.id),
    }));
    this.setData({
      cells,
      gotCount: cells.filter((c) => c.got).length,
      total: cells.length,
    });
  },

  onTapCell(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const cell = this.data.cells.find((c) => c.id === id);
    if (!cell) return;
    if (!cell.got) {
      wx.showToast({ title: '到现场扫描该文物即可收录', icon: 'none' });
      return;
    }
    const relic = getRelicsBySpot('daminggong').find((r) => r.id === id);
    if (!relic) return;
    this.setData({ detail: relic, lines: relic.yunqueLines });
  },

  closeDetail() {
    this.setData({ detail: null });
  },

  noop() {},

  onViewGoods() {
    const id = this.data.detail?.goodsId;
    if (!id) return;
    wx.navigateTo({ url: `/package-mall/pages/goods-detail/goods-detail?id=${id}` });
  },

  goScan() {
    wx.redirectTo({ url: '/package-tour/pages/ar-camera/ar-camera' });
  },
});
