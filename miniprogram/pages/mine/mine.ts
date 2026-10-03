import { getProgressStore } from '../../store/progress';
import { getSpots } from '../../data/repositories/spotRepo';
import { getScenesBySpot } from '../../data/repositories/sceneRepo';
import { getRelicsBySpot } from '../../data/repositories/relicRepo';
import { Spot } from '../../data/types/spot';

/** 五色珐琅：鳞片按单元在 celadon/azurite/cinnabar/jade/ivory 间依次循环 */
const ENAMELS = ['celadon', 'azurite', 'cinnabar', 'jade', 'ivory'];

interface ScaleCell {
  name: string;
  hall: string;
  got: boolean;
  enamel: string;
}

/** 龙鳞墙分组：一个景点一组 */
interface ScaleWallGroup {
  spotId: string;
  spotName: string;
  got: number;
  total: number;
  cells: ScaleCell[];
}

/** 文物图鉴缩略格：未收录=灰玉卡+鎏金锁；已收录=真实缩略图 */
interface RelicCell {
  id: string;
  image: string;
  collected: boolean;
}

/** 景点 + 纯展示用到访态（不改动 Spot 原始字段语义） */
interface SpotCard extends Spot {
  visitedCount: number;
  totalCount: number;
  visitedText: string;
}

Page({
  data: {
    scaleCount: 0,
    stampCount: 0,
    relicCount: 0,
    relicTotal: 0,
    scaleGroups: [] as ScaleWallGroup[],
    scaleTotal: 0,
    wallSummary: '',
    spotCards: [] as SpotCard[],
    relicCells: [] as RelicCell[],
    /** 缩略图加载失败兜底：key=relicId，true 时渲染鎏金框 */
    relicImgError: {} as Record<string, boolean>,
  },

  onLoad() {
    // 景点列表由数据驱动（大雁塔分支聚合后自动出现，不在此写死景点）
  },

  onShow() {
    this.syncProgress();
  },

  /** 读取真实进度，驱动分组龙鳞墙、文物图鉴与景点到访态（纯展示计算） */
  syncProgress() {
    const store = getProgressStore();

    // 龙鳞墙按景点分组：每景点一组，组内每场景一片鳞；五色珐琅按全局顺序循环
    let enamelIdx = 0;
    const scaleGroups: ScaleWallGroup[] = getSpots()
      .map((sp) => {
        const scenes = getScenesBySpot(sp.id);
        const gotNames = new Set(store.getScales(sp.id));
        const cells: ScaleCell[] = scenes.map((sc) => ({
          name: sc.scaleName,
          hall: sc.name,
          got: gotNames.has(sc.scaleName),
          enamel: ENAMELS[enamelIdx++ % ENAMELS.length],
        }));
        return {
          spotId: sp.id,
          spotName: sp.name,
          got: cells.filter((c) => c.got).length,
          total: cells.length,
          cells,
        };
      })
      .filter((g) => g.total > 0);

    const scaleTotal = scaleGroups.reduce((sum, g) => sum + g.total, 0);

    // 文物图鉴：大明宫 5 件真实文物，按收录态区分锁/真图
    const relicCells: RelicCell[] = getRelicsBySpot('daminggong').map((r) => ({
      id: r.id,
      image: r.image,
      collected: store.isRelicCollected(r.id),
    }));

    const doneScenes = new Set(store.snapshot.completedSceneIds);
    const spotCards: SpotCard[] = getSpots().map((sp) => {
      const visitedCount = sp.sceneIds.filter((id) => doneScenes.has(id)).length;
      const totalCount = sp.sceneIds.length;
      return {
        ...sp,
        visitedCount,
        totalCount,
        visitedText:
          visitedCount > 0 ? `已到访 ${visitedCount}/${totalCount} 处` : '尚未到访',
      };
    });

    this.setData({
      scaleCount: store.scaleCount,
      stampCount: store.stampCount,
      relicCount: store.relicCount,
      scaleGroups,
      scaleTotal,
      wallSummary:
        scaleTotal > 0
          ? `共 ${scaleTotal} 片龙鳞 · 已集 ${store.scaleCount} 片`
          : '巡游即将开放',
      spotCards,
      relicCells,
      relicTotal: relicCells.length,
    });
  },

  /** 文物缩略图加载失败：退回鎏金框（不裂图） */
  onRelicImgError(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    if (!id) return;
    this.setData({ [`relicImgError.${id}`]: true });
  },

  /** 龙鳞谱 / 通关文牒详情（新页，query.type 区分） */
  goDetail(e: WechatMiniprogram.TouchEvent) {
    const type = (e.currentTarget.dataset as { type: string }).type;
    wx.navigateTo({ url: `/pages/mine/detail/detail?type=${type}` });
  },

  /** 文物图鉴（分包页，已有） */
  goAlbum() {
    wx.navigateTo({ url: '/package-tour/pages/album/album' });
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
          this.syncProgress();
          wx.showToast({ title: '已重置', icon: 'success' });
        }
      },
    });
  },
});
