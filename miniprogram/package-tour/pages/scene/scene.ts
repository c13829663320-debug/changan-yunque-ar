import { getScene, getNextScene } from '../../../data/repositories/sceneRepo';
import { getProgressStore } from '../../../store/progress';
import { ScenePoint, DialogNode, ChoiceFeedback, YunqueExpression } from '../../../data/types/scene';

let audioCtx: WechatMiniprogram.InnerAudioContext | null = null;
// AR 观看倒计时句柄（模块级，避免挂在 Page 对象上）
let arTickTimer: ReturnType<typeof setInterval> | null = null;
let arReadyTimer: ReturnType<typeof setTimeout> | null = null;
// 本次进入剧场后已自动弹过史料卡的节点下标，防止同一节点重复弹
let autoSourceIndex = -1;

/** 云阙表情 → 运行时切图路径契约（衍生图由美术同步补齐，此处仅做映射） */
const YUNQUE_FIGURE: Record<YunqueExpression, string> = {
  normal: '/assets/characters/yunque-girl.jpg',
  curious: '/assets/characters/expressions/yunque-curious.jpg',
  surprised: '/assets/characters/expressions/yunque-surprised.jpg',
  happy: '/assets/characters/expressions/yunque-happy.jpg',
  daze: '/assets/characters/expressions/yunque-daze.jpg',
};

/** 哈维斯尼大圆距离（米），用于现场 LBS 半径判定 */
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Page({
  data: {
    mode: 'cloud' as 'cloud' | 'onsite',
    scene: {} as ScenePoint,
    sceneId: '',
    node: {} as DialogNode,
    dialogIndex: 0,
    total: 0,
    // 是否已通过入场门禁（云游放行 / 现场已解锁 / 定位在半径内），未通过前不渲染对话
    entered: false,
    showChoices: false,
    showFeedback: false,
    feedback: {} as ChoiceFeedback,
    feedbackCorrect: false,
    feedbackEasterEgg: '',
    showSource: false,
    showAR: false,
    arTip: '',
    arWatched: false,
    arCanClose: false,
    arCountdown: 0,
    finished: false,
    scaleCount: 0,
    hasNext: false,
    nextLabel: '继续',
    actorDisplay: '',
    figureLabel: '',
    figureSrc: '',
    stageBg: '',
    // 终章祈愿分享卡（仅 xuanwumen 结算后出现，数据驱动，不影响其余剧场）
    showShareCard: false,
    wishText: '',
    shareImagePath: '',
    // 现场定位拦截弹层
    geoBlock: false,
    geoBlockReason: 'range' as 'range' | 'fail',
    geoDistance: 0,
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
    autoSourceIndex = -1;
    this.setData({ mode, scene, sceneId: id, total: scene.dialogs.length });

    // 云游模式直接放行
    if (mode === 'cloud') {
      this.enterScene();
      return;
    }
    // 现场模式：已解锁过则直接进入
    const store = getProgressStore();
    if (store.isUnlocked(id)) {
      this.enterScene();
      return;
    }
    this.checkLocation();
  },

  onUnload() {
    this.clearArTimers();
    audioCtx?.destroy();
    audioCtx = null;
  },

  /** 通过门禁后正式渲染第一幕 */
  enterScene() {
    this.setData({ entered: true, geoBlock: false });
    this.renderNode(0);
  },

  /** 现场定位：在半径内则解锁并进入，否则/失败则弹层拦截 */
  checkLocation() {
    const scene = this.data.scene;
    const geo = scene.geo;
    if (!geo) {
      this.enterScene();
      return;
    }
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const dist = haversineM(res.latitude, res.longitude, geo.latitude, geo.longitude);
        const radius = geo.radius || 100;
        if (dist <= radius) {
          getProgressStore().unlockScene(scene.id);
          this.enterScene();
        } else {
          this.setData({
            geoBlock: true,
            geoBlockReason: 'range',
            geoDistance: Math.round(dist / 10) * 10,
          });
        }
      },
      fail: () => {
        this.setData({ geoBlock: true, geoBlockReason: 'fail' });
      },
    });
  },

  /** 弹层上「重新检测定位」 */
  retryLocation() {
    this.setData({ geoBlock: false });
    this.checkLocation();
  },

  /** 弹层上「先云游体验」：重定向到同 id 的云游模式剧场页 */
  goCloud() {
    wx.redirectTo({
      url: `/package-tour/pages/scene/scene?id=${this.data.sceneId}&mode=cloud`,
    });
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
    // 云阙按 expression 切图，缺省 normal；非云阙维持姓氏字逻辑
    const figureSrc =
      node.actor === 'yunque' ? YUNQUE_FIGURE[node.expression || 'normal'] : '';
    // 舞台背景：节点级覆盖优先，缺省回退 scene.bg
    const stageBg = node.stageBg || this.data.scene.bg || '';

    let nextLabel = '继续';
    if (node.action?.type === 'ar_restore') nextLabel = '开启AR复原';
    if (node.action?.type === 'collect_scale') nextLabel = '接过龙鳞';

    // 史料卡：open_source_card 节点进入后自动弹一次；切到普通节点先关闭
    const isSourceNode = node.action?.type === 'open_source_card';
    const autoPop = isSourceNode && autoSourceIndex !== i;
    if (autoPop) autoSourceIndex = i;

    this.clearArTimers();
    this.setData({
      dialogIndex: i,
      node,
      showChoices: !!node.choices && node.choices.length > 0,
      actorDisplay,
      figureLabel,
      figureSrc,
      stageBg,
      nextLabel,
      arWatched: false,
      arCanClose: false,
      arCountdown: 0,
      showSource: autoPop,
    });
  },

  onNext() {
    const { node, dialogIndex, scene, arWatched } = this.data;
    // AR 复原未观看：只打开 AR 层，绝不前进
    if (node.action?.type === 'ar_restore' && !arWatched) {
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
    const correct = choice.correct === true;
    if (correct) {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (err) {
        console.warn('[vibrate] failed:', err);
      }
    }
    this.setData({
      showChoices: false,
      showFeedback: true,
      feedback: choice.feedback,
      feedbackCorrect: correct,
      feedbackEasterEgg: correct && choice.easterEgg ? choice.easterEgg : '',
    });
    // 仅玄武门终章把所选愿望写入分享卡，避免其它剧场礼仪选项污染终章文案
    if (this.data.scene.id === 'xuanwumen') {
      this.setData({ wishText: choice.text });
    }
  },

  dismissFeedback() {
    this.setData({ showFeedback: false, feedbackCorrect: false, feedbackEasterEgg: '' });
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
        ? '现场通过识别图与方位，在遗址之上叠加殿宇复原'
        : '盛唐殿宇复原图，可在此环视历史原貌';
    this.clearArTimers();
    // 强制最小观看 2.5 秒：期间不可关闭，按钮倒计时 3→2→1
    this.setData({ showAR: true, arTip, arCanClose: false, arCountdown: 3 });
    arTickTimer = setInterval(() => {
      if (this.data.arCountdown > 1) {
        this.setData({ arCountdown: this.data.arCountdown - 1 });
      }
    }, 1000);
    arReadyTimer = setTimeout(() => {
      this.clearArTimers();
      this.setData({ arCanClose: true, arCountdown: 0 });
    }, 2500);
  },

  clearArTimers() {
    if (arTickTimer) {
      clearInterval(arTickTimer);
      arTickTimer = null;
    }
    if (arReadyTimer) {
      clearTimeout(arReadyTimer);
      arReadyTimer = null;
    }
  },

  closeAR() {
    // 倒计时未结束前，遮罩与按钮均不响应
    if (!this.data.arCanClose) return;
    this.clearArTimers();
    this.setData({ showAR: false, arWatched: true, nextLabel: '继续' });
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
