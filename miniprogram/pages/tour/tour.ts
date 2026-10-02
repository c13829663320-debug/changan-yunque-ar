import { getScenesBySpot } from '../../data/repositories/sceneRepo';
import { getProgressStore } from '../../store/progress';
import { ScenePoint } from '../../data/types/scene';

type SceneState = 'completed' | 'unlocked' | 'locked';

interface SceneVM extends ScenePoint {
  state: SceneState;
  stateLabel: string;
}

Page({
  data: {
    mode: 'cloud' as 'cloud' | 'onsite',
    scenes: [] as SceneVM[],
    scaleCount: 0,
    total: 7,
    percent: 0,
    continueText: '开始巡游',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const store = getProgressStore();
    const completed = store.snapshot.completedSceneIds.length;
    const scenes: SceneVM[] = getScenesBySpot('daminggong').map((s) => {
      let state: SceneState;
      if (store.isCompleted(s.id)) state = 'completed';
      else if (s.index <= completed + 1) state = 'unlocked';
      else state = 'locked';
      const stateLabel =
        state === 'completed' ? '已完成' : state === 'unlocked' ? '可进入' : '待解锁';
      return { ...s, state, stateLabel };
    });

    const total = scenes.length;
    const scaleCount = store.scaleCount;
    const currentId = store.snapshot.currentSceneId;

    this.setData({
      scenes,
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
          if (res.confirm) this.setData({ mode: 'onsite' });
        },
      });
      return;
    }
    this.setData({ mode });
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
    wx.navigateTo({
      url: `/package-tour/pages/scene/scene?id=${id}&mode=${this.data.mode}`,
    });
  },
});
