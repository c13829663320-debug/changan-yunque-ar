import { getScenesBySpot } from '../../data/repositories/sceneRepo';
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

Page({
  data: {
    mode: 'cloud' as 'cloud' | 'onsite',
    scenes: [] as SceneVM[],
    scaleCells: [] as ScaleCell[],
    scaleCount: 0,
    total: 0,
    percent: 0,
    continueText: '开始巡游',
    modeHint: '云游模式 · 在线复原盛唐宫殿',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const store = getProgressStore();
    const completed = store.snapshot.completedSceneIds.length;
    const raw: ScenePoint[] = getScenesBySpot('daminggong');
    const scenes: SceneVM[] = raw.map((s) => {
      let state: SceneState;
      if (store.isCompleted(s.id)) state = 'completed';
      else if (s.index <= completed + 1) state = 'unlocked';
      else state = 'locked';
      const stateLabel =
        state === 'completed' ? '已完成' : state === 'unlocked' ? '可进入' : '待解锁';
      // 纯展示：线性推进下，首个未完成即当前点位
      const isCurrent = state === 'unlocked';
      return { ...s, state, stateLabel, isCurrent };
    });

    const total = scenes.length;
    const scaleCount = store.scaleCount;
    const currentId = store.snapshot.currentSceneId;

    // 纯展示：七片龙鳞，已得数前 N 片点亮
    const scaleCells: ScaleCell[] = scenes.map((s, i) => ({
      n: s.index,
      got: i < scaleCount,
    }));

    this.setData({
      scenes,
      scaleCells,
      total,
      scaleCount,
      percent: Math.round((scaleCount / total) * 100),
      continueText: scaleCount === 0 ? '开始巡游' : scaleCount >= total ? '重温巡游' : '继续巡游',
    });
    void currentId;
  },

  switchMode(e: WechatMiniprogram.TouchEvent) {
    const mode = (e.currentTarget.dataset as { mode: 'cloud' | 'onsite' }).mode;
    if (mode === 'onsite') {
      wx.showModal({
        title: '现场巡游',
        content: '请确保你已在大明宫国家遗址公园内，将使用定位与摄像头进行AR复原与集章。是否继续？',
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
    const store = getProgressStore();
    const currentId = store.snapshot.currentSceneId;
    this.enterScene(currentId);
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
    return {
      title: '我在大明宫跟着云阙AR巡游，集齐七片龙鳞，你来吗？',
      imageUrl: '/assets/brand/share-cover.jpg',
      path: '/pages/tour/tour',
    };
  },
});
