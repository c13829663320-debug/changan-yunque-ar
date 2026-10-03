import { getScene, getNextScene, getTotalCount, getScenesBySpot } from '../../../data/repositories/sceneRepo';
import { getSpot } from '../../../data/repositories/spotRepo';
import { getProgressStore } from '../../../store/progress';
import { ScenePoint, DialogNode, ChoiceFeedback } from '../../../data/types/scene';

let audioCtx: WechatMiniprogram.InnerAudioContext | null = null;
const MUTED_KEY = 'changan_yunque_muted';
/** 珐琅五色按点位顺序轮换（仅展示字段，不参与逻辑/数据流） */
const ENAMELS = ['celadon', 'azurite', 'cinnabar', 'jade', 'ivory'];
/** 复原视频“确有帧”看门狗：真机 timeupdate 未按时到达时始终保留 poster 兜底 */
let stageWatchdog: ReturnType<typeof setTimeout> | null = null;
let arWatchdog: ReturnType<typeof setTimeout> | null = null;

Page({
  data: {
    mode: 'cloud' as 'cloud' | 'onsite',
    scene: {} as ScenePoint,
    node: {} as DialogNode,
    dialogIndex: 0,
    dialogTotal: 0,
    scaleTotal: 0,
    /** 当前景点名（数据驱动，用于结算与分享文案，不写死大明宫） */
    spotName: '',
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
    /** 本点位龙鳞珐琅色（展示用，由 scene.index 映射，WXML 不取模） */
    scaleEnamel: 'celadon' as string,
    // 复原视频是否真正开始播放（用于隐藏兜底画面，杜绝黑屏）
    stageReady: false,
    arReady: false,
    /** 是否运行在开发者工具模拟器：模拟器 video 同层渲染会纯黑，故永不渲染 video、只放 poster */
    isDevtools: false,
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
    let isDevtools = false;
    try {
      isDevtools = wx.getSystemInfoSync().platform === 'devtools';
    } catch (e) {
      isDevtools = false;
    }
    const voiceMuted = wx.getStorageSync(MUTED_KEY) === true;
    // 龙鳞分母 = 当前景点的点位(场景)数（每个场景集一片鳞），不写死、支持多景点扩展
    const scaleTotal = getTotalCount(scene.spotId);
    const spotName = getSpot(scene.spotId)?.name || '长安';
    // 展示字段：珐琅色按点位顺序轮换，供结算弹窗与集鳞仪式复用同一 dragon-scale got 态
    const scaleEnamel = ENAMELS[(scene.index - 1) % ENAMELS.length];
    this.setData(
      { mode, scene, dialogTotal: scene.dialogs.length, scaleTotal, spotName, voiceMuted, isDevtools, scaleEnamel },
      () => {
        this.startStagePlayback();
      }
    );
    this.renderNode(0);
  },

  onUnload() {
    if (stageWatchdog) {
      clearTimeout(stageWatchdog);
      stageWatchdog = null;
    }
    if (arWatchdog) {
      clearTimeout(arWatchdog);
      arWatchdog = null;
    }
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
      this.startArPlayback();
    });
  },

  closeAR() {
    if (arWatchdog) {
      clearTimeout(arWatchdog);
      arWatchdog = null;
    }
    this.setData({ showAR: false, arWatched: true });
  },

  openSource() {
    this.setData({ showSource: true });
  },

  closeSource() {
    this.setData({ showSource: false });
  },

  noop() {},

  // ===== 复原视频：模拟器只放 poster；真机须 timeupdate 确认有帧才淡入 video =====
  /** 舞台视频：真机才播放并挂 1.5s 看门狗；模拟器直接返回（只放 poster） */
  startStagePlayback() {
    if (stageWatchdog) {
      clearTimeout(stageWatchdog);
      stageWatchdog = null;
    }
    if (this.data.isDevtools) return; // 模拟器：永不渲染 video，绝不黑
    try {
      wx.createVideoContext('stageVideo').play();
    } catch (e) {
      /* noop */
    }
    stageWatchdog = setTimeout(() => {
      if (!this.data.stageReady) {
        try {
          wx.createVideoContext('stageVideo').play();
        } catch (e) {
          /* noop */
        }
      }
    }, 1500);
  },

  /** AR 层视频：真机才播放并挂看门狗；模拟器只放 poster */
  startArPlayback() {
    if (arWatchdog) {
      clearTimeout(arWatchdog);
      arWatchdog = null;
    }
    if (this.data.isDevtools) return;
    try {
      wx.createVideoContext('arVideo').play();
    } catch (e) {
      /* noop */
    }
    arWatchdog = setTimeout(() => {
      if (!this.data.arReady) {
        try {
          wx.createVideoContext('arVideo').play();
        } catch (e) {
          /* noop */
        }
      }
    }, 1500);
  },

  onStageMeta() {
    if (this.data.isDevtools) return;
    try {
      wx.createVideoContext('stageVideo').play();
    } catch (e) {
      /* noop */
    }
  },
  /** 不再轻信 bindplay（模拟器会触发 bindplay 却渲染纯黑）；currentTime>0.2 确有帧才淡入 */
  onStageTimeUpdate(e: WechatMiniprogram.CustomEvent<{ currentTime: number }>) {
    if (this.data.isDevtools) return;
    const currentTime = e?.detail?.currentTime || 0;
    if (currentTime > 0.2 && !this.data.stageReady) {
      if (stageWatchdog) {
        clearTimeout(stageWatchdog);
        stageWatchdog = null;
      }
      this.setData({ stageReady: true });
    }
  },
  onStagePlay() {
    /* 仅 bindplay 不足以证明已渲染出帧，ready 交给 bindtimeupdate 判定 */
  },
  onStageError() {
    if (stageWatchdog) {
      clearTimeout(stageWatchdog);
      stageWatchdog = null;
    }
    this.setData({ stageReady: false });
  },

  onArMeta() {
    if (this.data.isDevtools) return;
    try {
      wx.createVideoContext('arVideo').play();
    } catch (e) {
      /* noop */
    }
  },
  onArTimeUpdate(e: WechatMiniprogram.CustomEvent<{ currentTime: number }>) {
    if (this.data.isDevtools) return;
    const currentTime = e?.detail?.currentTime || 0;
    if (currentTime > 0.2 && !this.data.arReady) {
      if (arWatchdog) {
        clearTimeout(arWatchdog);
        arWatchdog = null;
      }
      this.setData({ arReady: true });
    }
  },
  onArPlay() {
    /* ready 交给 bindtimeupdate 判定 */
  },
  onArError() {
    if (arWatchdog) {
      clearTimeout(arWatchdog);
      arWatchdog = null;
    }
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
    // 结算龙鳞计数按「当前景点」统计，与分母 scaleTotal(本景点) 一致，跨景点不错位
    const spotDone = getScenesBySpot(this.data.scene.spotId).filter((s) =>
      store.isCompleted(s.id)
    ).length;
    this.setData({ finished: true, scaleCount: spotDone, hasNext: !!next });
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
    // 文案依据当前景点与点位动态生成，不写死「大明宫玄武门」，多景点通用
    const spot = this.data.spotName || '长安';
    const point = this.data.scene?.name || '巡游';
    return {
      title: `我在${spot}·${point}投了一愿：「${wish}」，你也来云阙巡游集齐龙鳞吧`,
      imageUrl: this.data.shareImagePath || undefined,
      path: '/pages/tour/tour',
    };
  },
});
