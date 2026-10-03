import { getRelicsBySpot, getRelic } from '../../../data/repositories/relicRepo';
import { getScenesBySpot } from '../../../data/repositories/sceneRepo';
import { getEnabledSpots, getSpot } from '../../../data/repositories/spotRepo';
import { getProgressStore } from '../../../store/progress';
import { Relic } from '../../../data/types/relic';

interface AlbumCell {
  id: string;
  name: string;
  era: string;
  image: string;
  got: boolean;
  /** 缩略图是否已加载完成（微光底淡入淡出用，纯展示态，不改业务数据流） */
  loaded: boolean;
  /** 缩略图加载失败：移除微光底，回退容器底色 */
  err: boolean;
}

interface SpotTab {
  id: string;
  shortName: string;
}

/** 从景点全名提炼卷首短名（与 tour 页同一口径）：取「·」前主名并去掉长后缀 */
function shortSpotName(full: string): string {
  const head = (full || '').split('·')[0].trim();
  return head.replace(/国家遗址公园|大慈恩寺/g, '').trim() || full;
}

Page({
  data: {
    /** 当前景点 id（入口可带 spotId，缺省大明宫） */
    spotId: 'daminggong',
    /** 头部景点切换 tab（仅已上线景点，单景点时自隐） */
    spots: [] as SpotTab[],
    /** 当前景点短名（用于空态文案） */
    spotName: '大明宫',
    cells: [] as AlbumCell[],
    gotCount: 0,
    total: 0,
    /** 该景点是否已有文物数据；无数据景点走「整理收录」空态，不回退 */
    hasRelics: true,
    // 详情弹层
    detail: null as Relic | null,
    lines: [] as string[],
  },

  onLoad(options: Record<string, string | undefined>) {
    const spots: SpotTab[] = getEnabledSpots().map((s) => ({
      id: s.id,
      shortName: shortSpotName(s.name),
    }));
    const entry = options && options.spotId && getSpot(options.spotId) ? options.spotId : 'daminggong';
    this.setData({ spots, spotId: entry });
    this.build();
  },

  onShow() {
    this.build();
  },

  build() {
    const spotId = this.data.spotId;
    const spot = getSpot(spotId);
    const relics = getRelicsBySpot(spotId);
    const got = new Set(getProgressStore().snapshot.collectedRelicIds);
    const cells: AlbumCell[] = relics.map((r) => ({
      id: r.id,
      name: r.name,
      era: r.era,
      image: r.image,
      got: got.has(r.id),
      loaded: false,
      err: false,
    }));
    this.setData({
      spotName: spot ? shortSpotName(spot.name) : '文物图鉴',
      cells,
      gotCount: cells.filter((c) => c.got).length,
      total: cells.length,
      hasRelics: relics.length > 0,
    });
  },

  switchSpot(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    if (!id || id === this.data.spotId) return;
    // 切换景点时收起详情，避免跨景点残留
    this.setData({ spotId: id, detail: null }, () => this.build());
  },

  onTapCell(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const cell = this.data.cells.find((c) => c.id === id);
    if (!cell) return;
    if (!cell.got) {
      wx.showToast({ title: '到现场扫描该文物即可收录', icon: 'none' });
      return;
    }
    const relic = getRelic(id);
    if (!relic) return;
    this.setData({ detail: relic, lines: relic.yunqueLines });
  },

  closeDetail() {
    this.setData({ detail: null });
  },

  noop() {},

  /** 缩略图加载完成：淡入图片、露出后微光底自然被不透明图片覆盖 */
  onRelicImgLoad(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const idx = this.data.cells.findIndex((c) => c.id === id);
    if (idx < 0) return;
    this.setData({ [`cells.${idx}.loaded`]: true });
  },

  /** 缩略图失败：无既有图片兜底可复用，移除微光、回退容器浅玉底色（与现状一致，不新增兜底样式） */
  onRelicImgError(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const idx = this.data.cells.findIndex((c) => c.id === id);
    if (idx < 0) return;
    this.setData({ [`cells.${idx}.err`]: true });
  },

  onViewGoods() {
    const id = this.data.detail?.goodsId;
    if (!id) return;
    wx.navigateTo({ url: `/package-mall/pages/goods-detail/goods-detail?id=${id}` });
  },

  goScan() {
    // ar-camera 仅以 query.id（场景）反推所属景点、并定位序列起点；
    // 带当前景点首个场景 id 进入，使大雁塔图鉴「去现场扫描」进入大雁塔序列（而非默认大明宫）
    const first = getScenesBySpot(this.data.spotId)[0];
    const id = first ? first.id : '';
    wx.redirectTo({
      url: id
        ? `/package-tour/pages/ar-camera/ar-camera?id=${id}`
        : '/package-tour/pages/ar-camera/ar-camera',
    });
  },
});
