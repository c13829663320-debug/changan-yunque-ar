import { getScene, getNextScene } from '../../../data/repositories/sceneRepo';
import { getProgressStore } from '../../../store/progress';
import { ScenePoint, DialogNode, ChoiceFeedback } from '../../../data/types/scene';

let audioCtx: WechatMiniprogram.InnerAudioContext | null = null;

Page({
  data: {
    mode: 'cloud' as 'cloud' | 'onsite',
    scene: {} as ScenePoint,
    node: {} as DialogNode,
    dialogIndex: 0,
    total: 0,
    showChoices: false,
    showFeedback: false,
    feedback: {} as ChoiceFeedback,
    showSource: false,
    showAR: false,
    arTip: '',
    arWatched: false,
    finished: false,
    scaleCount: 0,
    hasNext: false,
    nextLabel: '继续',
    actorDisplay: '',
    figureLabel: '',
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = query?.id || 'danfengmen';
    const mode: 'cloud' | 'onsite' = query?.mode === 'onsite' ? 'onsite' : 'cloud';
    const scene = getScene(id);
    if (!scene) {
      wx.showToast({ title: '点位不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({ mode, scene, total: scene.dialogs.length });
    this.renderNode(0);
  },

  onUnload() {
    audioCtx?.destroy();
    audioCtx = null;
  },

  renderNode(i: number) {
    const node = this.data.scene.dialogs[i];
    if (!node) return;
    this.playAudio(node.audio);

    const actorDisplay =
      node.actorName ||
      (node.actor === 'yunque' ? '云阙' : node.actor === 'narrator' ? '旁白' : node.actor);
    const figureLabel =
      node.actor === 'yunque'
        ? '云阙'
        : node.actor === 'narrator'
        ? '旁白'
        : node.actorName
        ? node.actorName.charAt(0)
        : '';

    let nextLabel = '继续';
    if (node.action?.type === 'ar_restore') nextLabel = '开启AR复原';
    if (node.action?.type === 'collect_scale') nextLabel = '接过龙鳞';

    this.setData({
      dialogIndex: i,
      node,
      showChoices: !!node.choices && node.choices.length > 0,
      actorDisplay,
      figureLabel,
      nextLabel,
      arWatched: false,
    });
  },

  onNext() {
    const { node, dialogIndex, scene } = this.data;
    if (node.action?.type === 'ar_restore' && !this.data.arWatched) {
      this.openAR();
      return;
    }
    if (node.action?.type === 'collect_scale') {
      this.finishScene();
      return;
    }
    if (dialogIndex + 1 >= scene.dialogs.length) {
      this.finishScene();
      return;
    }
    this.renderNode(dialogIndex + 1);
  },

  onChoose(e: WechatMiniprogram.TouchEvent) {
    const choiceId = (e.currentTarget.dataset as { id: string }).id;
    const choice = this.data.node.choices?.find((c) => c.id === choiceId);
    if (!choice) return;
    this.setData({ showChoices: false, showFeedback: true, feedback: choice.feedback });
  },

  dismissFeedback() {
    this.setData({ showFeedback: false });
    const { dialogIndex, scene } = this.data;
    if (dialogIndex + 1 >= scene.dialogs.length) {
      this.finishScene();
      return;
    }
    this.renderNode(dialogIndex + 1);
  },

  openAR() {
    const arTip =
      this.data.mode === 'onsite'
        ? '现场将通过识别图与方位在遗址上叠加殿宇（M2接入真机AR）'
        : '示意复原；M1接入XRFrame后呈现完整3D殿宇与光影';
    this.setData({ showAR: true, arTip });
  },

  closeAR() {
    this.setData({ showAR: false, arWatched: true });
  },

  openSource() {
    this.setData({ showSource: true });
  },

  closeSource() {
    this.setData({ showSource: false });
  },

  noop() {},

  playAudio(src?: string) {
    if (!src) return;
    try {
      audioCtx?.destroy();
      const ctx = wx.createInnerAudioContext();
      ctx.src = src;
      ctx.play();
      audioCtx = ctx;
    } catch (err) {
      console.warn('[audio] play failed:', err);
    }
  },

  finishScene() {
    const store = getProgressStore();
    store.completeScene(this.data.scene);
    const next = getNextScene(this.data.scene.id);
    this.setData({ finished: true, scaleCount: store.scaleCount, hasNext: !!next });
  },

  goNext() {
    const next = getNextScene(this.data.scene.id);
    if (!next) {
      this.backMap();
      return;
    }
    wx.redirectTo({
      url: `/package-tour/pages/scene/scene?id=${next.id}&mode=${this.data.mode}`,
    });
  },

  backMap() {
    wx.switchTab({ url: '/pages/tour/tour' });
  },
});
