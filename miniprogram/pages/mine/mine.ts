import { getProgressStore } from '../../store/progress';
import { getSpots } from '../../data/repositories/spotRepo';
import { getScenesBySpot } from '../../data/repositories/sceneRepo';
import { Spot } from '../../data/types/spot';

/** 当前景点（龙鳞墙按景点场景数动态生成，不写死，支持多景点扩展） */
const ACTIVE_SPOT = 'daminggong';

interface ScaleCell {
  name: string;
  hall: string;
  got: boolean;
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
    relicTotal: 5,
    spots: [] as Spot[],
    scaleWall: [] as ScaleCell[],
    scaleTotal: 0,
    spotCards: [] as SpotCard[],
  },

  onLoad() {
    this.setData({ spots: getSpots() });
  },

  onShow() {
    this.syncProgress();
  },

  /** 读取真实进度，驱动龙鳞墙与景点到访态（纯展示计算） */
  syncProgress() {
    const s = getProgressStore().snapshot;

    const gotScales = new Set(s.scales);
    // 龙鳞墙按当前景点的场景动态生成：每场景一片鳞，分母=场景数
    const spotScenes = getScenesBySpot(ACTIVE_SPOT);
    const scaleWall: ScaleCell[] = spotScenes.map((sc) => ({
      name: sc.scaleName,
      hall: sc.name,
      got: gotScales.has(sc.scaleName),
    }));

    const doneScenes = new Set(s.completedSceneIds);
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
      scaleCount: s.scales.length,
      stampCount: s.stamps.length,
      relicCount: s.collectedRelicIds.length,
      scaleWall,
      scaleTotal: spotScenes.length,
      spotCards,
    });
  },

  goSpot(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({ url: `/package-spot/pages/spot-detail/spot-detail?id=${id}` });
  },

  /** 文物图鉴（分包页） */
  goAlbum() {
    wx.navigateTo({ url: '/package-tour/pages/album/album' });
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
