import { getScene, getNextScene } from '../../../data/repositories/sceneRepo';
import { getProgressStore } from '../../../store/progress';
import { ScenePoint, DialogNode, ChoiceFeedback } from '../../../data/types/scene';

let audioCtx: WechatMiniprogram.InnerAudioContext | null = null;
const MUTED_KEY = 'changan_yunque_muted';

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
    // 终章祈愿分享卡（仅 xuanwumen 结算后出现，数据驱动，不影响其余剧场）
    showShareCard: false,
    wishText: '',
    shareImagePath: '',
    // 配音开关与集鳞仪式动画
    voiceMuted: false,
    collectingScale: false,
    // 复原视频是否真正开始播放（用于隐藏兜底画面，杜绝黑屏）
    stageReady: false,
    arReady: false,
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
    const voiceMuted = wx.getStorageSync(MUTED_KEY) === true;
    this.setData({ mode, scene, total: scene.dialogs.length, voiceMuted }, () => {
      this.playStageVideo();
    });
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
      if (this.data.collectingScale) return;
      this.setData({ collectingScale: true });
      setTimeout(() => {
        this.setData({ collectingScale: false });
        this.finishScene();
      }, 1300);
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
    // 记录用户所选祈愿取向，供终章分享卡使用（泛化：取所选文案）
    this.setData({ showChoices: false, showFeedback: true, feedback: choice.feedback, wishText: choice.text });
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
    this.setData({ showAR: true, arTip, arReady: false }, () => {
      try {
        wx.createVideoContext('arVideo').play();
      } catch (e) {
        /* noop */
      }
    });
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

  // 主动播放舞台视频（模拟器 autoplay 可能不生效；兜底画面已保证不黑）
  playStageVideo() {
    try {
      wx.createVideoContext('stageVideo').play();
    } catch (e) {
      /* noop */
    }
  },

  // ===== 复原视频：加载即播，真正 bindplay 后才隐藏兜底画面 =====
  onStageMeta() {
    try {
      wx.createVideoContext('stageVideo').play();
    } catch (e) {
      /* noop */
    }
  },
  onStagePlay() {
    if (!this.data.stageReady) this.setData({ stageReady: true });
  },
  onStageError() {
    this.setData({ stageReady: false });
  },

  onArMeta() {
    try {
      wx.createVideoContext('arVideo').play();
    } catch (e) {
      /* noop */
    }
  },
  onArPlay() {
    if (!this.data.arReady) this.setData({ arReady: true });
  },
  onArError() {
    this.setData({ arReady: false });
  },

  playAudio(src?: string) {
    try {
      audioCtx?.destroy();
      audioCtx = null;
    } catch (e) {
      /* noop */
    }
    if (!src || this.data.voiceMuted) return;
    try {
      const ctx = wx.createInnerAudioContext();
      ctx.src = src;
      ctx.play();
      audioCtx = ctx;
    } catch (err) {
      console.warn('[audio] play failed:', err);
    }
  },

  toggleMute() {
    const voiceMuted = !this.data.voiceMuted;
    wx.setStorageSync(MUTED_KEY, voiceMuted);
    this.setData({ voiceMuted });
    if (voiceMuted) {
      try {
        audioCtx?.destroy();
        audioCtx = null;
      } catch (e) {
        /* noop */
      }
    } else {
      this.playAudio(this.data.node.audio);
    }
  },

  replayAudio() {
    this.playAudio(this.data.node.audio);
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

  // ===== 终章祈愿分享卡 =====
  openShareCard() {
    this.setData({ showShareCard: true });
  },

  onShareCardReady(e: WechatMiniprogram.CustomEvent<{ tempFilePath: string }>) {
    // 记录分享卡临时图，供 onShareAppMessage 使用
    this.setData({ shareImagePath: e.detail.tempFilePath });
  },

  onShareCardClose() {
    this.setData({ showShareCard: false });
  },

  onShareAppMessage() {
    const wish = this.data.wishText || '愿此刻长安，久一点。';
    return {
      title: `我在大明宫玄武门投了一愿：「${wish}」，你也来云阙巡游集齐七鳞吧`,
      imageUrl: this.data.shareImagePath || undefined,
      path: '/pages/tour/tour',
    };
  },
});
