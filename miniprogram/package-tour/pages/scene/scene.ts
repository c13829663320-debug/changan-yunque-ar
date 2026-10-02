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
    // 云游全景 viewer 接线（AR 升级；现场模式不使用）
    panoramaPath: '',
    arReloadKey: 0,
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
    // 现场模式：行为保持不变（现场走 ar-camera，其内部不改动）。
    if (this.data.mode === 'onsite') {
      this.setData({
        showAR: true,
        arTip: '现场将通过识别图与方位在遗址上叠加殿宇（M2接入真机AR）',
      });
      return;
    }
    // 云游模式：进入全景环视 viewer（XRFrame → 全景视差 → 复原图 三级回退）
    const scene = this.data.scene;
    const panoramaPath = `/package-tour/assets/panorama/${scene.id}.jpg`;
    this.setData({
      showAR: true,
      panoramaPath,
      arReloadKey: (this.data.arReloadKey || 0) + 1,
      arTip: '拖动屏幕或转动手机环视殿宇复原，已为你叠加晨昏光影',
    });
  },

  closeAR() {
    this.setData({ showAR: false, arWatched: true });
  },

  /** viewer 状态文案透传（可选展示） */
  onArStatus(e: WechatMiniprogram.CustomEvent<{ text: string }>) {
    const text = e.detail && e.detail.text;
    if (text) this.setData({ arTip: text });
  },

  /** viewer 内部已自动降级，这里仅记录，不白屏 */
  onArFallback(e: WechatMiniprogram.CustomEvent<{ reason: string }>) {
    console.warn('[AR] panorama-viewer fallback:', e.detail && e.detail.reason);
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
