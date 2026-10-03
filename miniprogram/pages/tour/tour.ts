import { getScenesBySpot, getTotalCount } from '../../data/repositories/sceneRepo';
import { getEnabledSpots, getSpot } from '../../data/repositories/spotRepo';
import { getProgressStore } from '../../store/progress';
import { ScenePoint } from '../../data/types/scene';

type SceneState = 'completed' | 'unlocked' | 'locked';

interface SceneVM extends ScenePoint {
  state: SceneState;
  stateLabel: string;
  /** 纯展示：当前下一点位（未完成的首个 unlocked），用于视觉高亮 */
  isCurrent: boolean;
}

interface ScaleCell {
  n: number;
  got: boolean;
}

interface SpotTab {
  id: string;
  /** 卷首短名（用于分段控件，避免长名拥挤） */
  shortName: string;
  name: string;
}

/** 从景点全名提炼卷首短名：去掉「国家遗址公园」等后缀，取「·」前主名 */
function shortSpotName(full: string): string {
  const head = (full || '').split('·')[0].trim();
  return head.replace(/国家遗址公园|大慈恩寺/g, '').trim() || full;
}

Page({
  data: {
    mode: 'cloud' as 'cloud' | 'onsite',
    /** 当前选中景点（默认取首个已上线景点） */
    spotId: 'daminggong',
    spots: [] as SpotTab[],
    spotName: '大明宫',
    headSub: '大明宫 · 七阙长卷',
    scenes: [] as SceneVM[],
    scaleCells: [] as ScaleCell[],
    scaleCount: 0,
    total: 0,
    percent: 0,
    continueText: '开始巡游',
    modeHint: '云游模式 · 在线复原盛唐宫殿',
  },

  onLoad() {
    // 仅列出已上线景点；默认选中第一个（后续可按进度/最近到访优化）
    const enabled = getEnabledSpots();
    const spots: SpotTab[] = enabled.map((s) => ({
      id: s.id,
      shortName: shortSpotName(s.name),
      name: s.name,
    }));
    const spotId = spots.length ? spots[0].id : 'daminggong';
    this.setData({ spots, spotId });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const store = getProgressStore();
    const spotId = this.data.spotId;
    const spot = getSpot(spotId);
    const spotName = spot ? shortSpotName(spot.name) : '本阙';

    const raw: ScenePoint[] = getScenesBySpot(spotId);
    // 龙鳞/进度按「当前景点」重算：只统计本景点内已完成点位
    const completedInSpot = raw.filter((s) => store.isCompleted(s.id)).length;

    const scenes: SceneVM[] = raw.map((s) => {
      let state: SceneState;
      if (store.isCompleted(s.id)) state = 'completed';
      else if (s.index <= completedInSpot + 1) state = 'unlocked';
      else state = 'locked';
      const stateLabel =
        state === 'completed' ? '已完成' : state === 'unlocked' ? '可进入' : '待解锁';
      // 纯展示：线性推进下，首个未完成即当前点位
      const isCurrent = state === 'unlocked';
      return { ...s, state, stateLabel, isCurrent };
    });

    const total = getTotalCount(spotId);
    const scaleCount = completedInSpot;

    // 龙鳞托：本景点每集一点位亮一片
    const scaleCells: ScaleCell[] = raw.map((s) => ({
      n: s.index,
      got: store.isCompleted(s.id),
    }));

    this.setData({
      scenes,
      scaleCells,
      total,
      scaleCount,
      spotName,
      headSub: `${spotName} · ${total}阙长卷`,
      percent: total ? Math.round((scaleCount / total) * 100) : 0,
      continueText:
        scaleCount === 0 ? '开始巡游' : scaleCount >= total ? '重温巡游' : '继续巡游',
    });
  },

  switchSpot(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    if (!id || id === this.data.spotId) return;
    this.setData({ spotId: id }, () => this.refresh());
  },

  switchMode(e: WechatMiniprogram.TouchEvent) {
    const mode = (e.currentTarget.dataset as { mode: 'cloud' | 'onsite' }).mode;
    if (mode === 'onsite') {
      wx.showModal({
        title: '现场巡游',
        content: `请确保你已在${this.data.spotName}景区内，将使用定位与摄像头进行AR复原与集章。是否继续？`,
        confirmText: '我在现场',
        success: (res) => {
          if (res.confirm) {
            this.setData({ mode: 'onsite', modeHint: '现场模式 · AR实景复原与集章' });
          }
        },
      });
      return;
    }
    this.setData({ mode, modeHint: '云游模式 · 在线复原盛唐宫殿' });
  },

  onTapScene(e: WechatMiniprogram.TouchEvent) {
    const ds = e.currentTarget.dataset as { id: string; state: SceneState };
    if (ds.state === 'locked') {
      wx.showToast({ title: '先完成前面的点位哦', icon: 'none' });
      return;
    }
    this.enterScene(ds.id);
  },

  onContinue() {
    // 按当前景点找下一点：首个未完成点位；若已通关则回到首点重温
    const next =
      this.data.scenes.find((s) => s.state !== 'completed') || this.data.scenes[0];
    if (!next) {
      wx.showToast({ title: '长卷待展', icon: 'none' });
      return;
    }
    this.enterScene(next.id);
  },

  enterScene(id: string) {
    getProgressStore().setCurrent(id);
    const url =
      this.data.mode === 'onsite'
        ? `/package-tour/pages/ar-camera/ar-camera?id=${id}`
        : `/package-tour/pages/scene/scene?id=${id}&mode=cloud`;
    wx.navigateTo({ url });
  },

  onShareAppMessage() {
    const { spotName, total } = this.data;
    return {
      title: `我在${spotName}跟着云阙AR巡游，集齐${total}片龙鳞，你来吗？`,
      imageUrl: '/assets/brand/share-cover.jpg',
      path: '/pages/tour/tour',
    };
  },
});
