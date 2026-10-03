import { getScene, getScenesBySpot } from '../../../data/repositories/sceneRepo';
import { getRelic, getRelicsByScene } from '../../../data/repositories/relicRepo';
import { getProgressStore } from '../../../store/progress';
import { ScenePoint, SourceCard } from '../../../data/types/scene';
import { Relic } from '../../../data/types/relic';

/* eslint-disable @typescript-eslint/no-explicit-any */
let vkSession: WechatMiniprogram.VKSession | null = null;
let scanTimer: ReturnType<typeof setTimeout> | null = null;
let recTimer: ReturnType<typeof setTimeout> | null = null;
let audioCtx: WechatMiniprogram.InnerAudioContext | null = null;

type Phase = 'scanning' | 'recognizing' | 'briefing';
type TargetKind = 'spot' | 'relic';

interface YunqueLine {
  text: string;
  audio?: string;
}

interface SeqItem {
  kind: TargetKind;
  id: string;
}

/** 演示扫描序列：每个景点后跟其关联文物，景点与文物交替出现 */
function buildSequence(spotId = 'daminggong'): SeqItem[] {
  const seq: SeqItem[] = [];
  getScenesBySpot(spotId).forEach((s) => {
    seq.push({ kind: 'spot', id: s.id });
    getRelicsByScene(s.id).forEach((r) => seq.push({ kind: 'relic', id: r.id }));
  });
  return seq;
}

Page({
  data: {
    phase: 'scanning' as Phase,
    hasVK: false,
    targetKind: 'spot' as TargetKind,
    // 通用
    targetName: '',
    era: '',
    intro: '',
    yunqueLines: [] as YunqueLine[],
    sourceCard: null as SourceCard | null,
    culturalNote: '',
    showSource: false,
    statusText: '将镜头对准宫殿 / 文物，云阙将为你讲解',
    // 景点
    scene: null as ScenePoint | null,
    restoreVideo: '',
    poster: '',
    scaleName: '',
    collected: false,
    // 文物
    relic: null as Relic | null,
    relicImage: '',
    relicInAlbum: false,
    goodsId: '',
    // 序列
    seqIndex: 0,
    seqTotal: 0,
  },

  onLoad(query: Record<string, string | undefined>) {
    const seq = buildSequence();
    let startIdx = 0;
    if (query?.id) {
      const k = seq.findIndex((t) => t.id === query.id);
      if (k >= 0) startIdx = k;
    }
    this.setData({ seqTotal: seq.length });
    this.loadSeqIndex(startIdx);

    const hasVK = typeof (wx as any).createVKSession === 'function';
    this.setData({ hasVK });
    if (hasVK) {
      this.initVK();
    } else {
      this.initLBSFallback();
      this.scheduleDemoScan();
    }
  },

  /** 加载序列指定位置目标 */
  loadSeqIndex(i: number) {
    const seq = buildSequence();
    const idx = Math.max(0, Math.min(i, seq.length - 1));
    const t = seq[idx];
    this.setData({ seqIndex: idx });
    if (t.kind === 'spot') this.loadSpot(t.id);
    else this.loadRelic(t.id);
  },

  /** 加载景点，组装云阙讲解（复原视频 + 配音 + 龙鳞） */
  loadSpot(id: string) {
    const scene = getScene(id);
    if (!scene) return;
    const yunqueLines: YunqueLine[] = scene.dialogs
      .filter((d) => d.actor === 'yunque' && d.text && d.text.trim().length > 6)
      .slice(0, 3)
      .map((d) => ({ text: d.text, audio: d.audio }));
    this.setData({
      targetKind: 'spot',
      scene,
      targetName: scene.name,
      era: '',
      restoreVideo: scene.restoreVideo || '',
      poster: scene.poster || '',
      intro: scene.intro,
      yunqueLines,
      sourceCard: scene.sourceCard,
      culturalNote: '',
      scaleName: scene.scaleName,
      collected: getProgressStore().isCompleted(scene.id),
      relic: null,
      relicImage: '',
      relicInAlbum: false,
      goodsId: '',
      showSource: false,
      statusText: `将镜头对准「${scene.name}」，云阙将为你讲解`,
    });
  },

  /** 加载文物，组装云阙讲解（文物图 + 文字 + 图鉴，无视频/配音） */
  loadRelic(id: string) {
    const relic = getRelic(id);
    if (!relic) return;
    const yunqueLines: YunqueLine[] = relic.yunqueLines.map((t) => ({ text: t }));
    this.setData({
      targetKind: 'relic',
      relic,
      targetName: relic.name,
      era: relic.era,
      relicImage: relic.image,
      relicInAlbum: getProgressStore().isRelicCollected(relic.id),
      goodsId: relic.goodsId || '',
      intro: relic.intro,
      yunqueLines,
      sourceCard: relic.sourceCard || null,
      culturalNote: relic.culturalNote || '',
      restoreVideo: '',
      poster: '',
      scene: null,
      scaleName: '',
      collected: false,
      showSource: false,
      statusText: `将镜头对准「${relic.name}」，云阙将为你讲解`,
    });
  },

  /* ---------- 真机：VKSession marker 识别 ---------- */
  initVK() {
    try {
      vkSession = (wx as any).createVKSession({
        track: { plane: { mode: 1 }, marker: true },
        version: 'v2',
      }) as WechatMiniprogram.VKSession;
      vkSession.start((err: any) => {
        if (err) {
          this.initLBSFallback();
          this.scheduleDemoScan();
        }
      });
      vkSession.on('updateAnchors', (res: any) => {
        if (res && res.anchors && res.anchors.length) this.startRecognize();
      });
    } catch (e) {
      this.initLBSFallback();
      this.scheduleDemoScan();
    }
  },

  /* ---------- 兜底：LBS 进入触发半径（仅景点有坐标） ---------- */
  initLBSFallback() {
    wx.getLocation({
      type: 'gcj02',
      success: (loc) => {
        const scene = this.data.scene;
        if (scene?.geo) {
          const d = this.haversine(
            loc.latitude,
            loc.longitude,
            scene.geo.latitude,
            scene.geo.longitude,
          );
          if (d <= (scene.geo.radius || 120)) this.startRecognize();
        }
      },
      fail: () => {},
    });
  },

  /* ---------- 演示：自动模拟对准识别 ---------- */
  scheduleDemoScan() {
    this.clearTimers();
    scanTimer = setTimeout(() => this.startRecognize(), 2600);
  },

  startRecognize() {
    if (this.data.phase !== 'scanning') return;
    this.setData({ phase: 'recognizing', statusText: '正在识别图像特征…' });
    this.clearTimers();
    recTimer = setTimeout(() => this.onRecognized(), 1300);
  },

  onRecognized() {
    if (this.data.phase === 'briefing') return;
    this.clearTimers();
    const isSpot = this.data.targetKind === 'spot';
    this.setData({ phase: 'briefing' }, () => {
      if (isSpot) {
        setTimeout(() => {
          try {
            wx.createVideoContext('briefVideo', this).play();
          } catch (e) {
            /* noop */
          }
        }, 120);
      }
    });
    try {
      (wx as any).vibrateShort?.({ type: 'light' });
    } catch (e) {
      /* noop */
    }
    this.playYunqueAudio();
  },

  playYunqueAudio() {
    const line = this.data.yunqueLines.find((l) => l.audio);
    if (line?.audio) {
      try {
        audioCtx = wx.createInnerAudioContext();
        audioCtx.src = line.audio;
        audioCtx.play();
      } catch (e) {
        /* noop */
      }
    }
  },

  stopAudio() {
    try {
      audioCtx?.stop();
      audioCtx?.destroy();
    } catch (e) {
      /* noop */
    }
    audioCtx = null;
  },

  /* ---------- 讲解面板操作 ---------- */
  onCollect() {
    if (this.data.targetKind === 'spot' && this.data.scene) {
      getProgressStore().completeScene(this.data.scene);
      this.setData({ collected: true });
      wx.showToast({ title: `已集「${this.data.scaleName}」`, icon: 'none' });
    } else if (this.data.targetKind === 'relic' && this.data.relic) {
      getProgressStore().collectRelic(this.data.relic.id);
      this.setData({ relicInAlbum: true });
      wx.showToast({ title: '已收入文物图鉴', icon: 'none' });
    }
  },

  onToggleSource() {
    this.setData({ showSource: !this.data.showSource });
  },

  onRescan() {
    this.stopAudio();
    this.setData({ phase: 'scanning', showSource: false });
    this.scheduleDemoScan();
  },

  onNext() {
    this.stopAudio();
    const next = this.data.seqIndex + 1;
    if (next < this.data.seqTotal) {
      this.setData({ phase: 'scanning', showSource: false });
      this.loadSeqIndex(next);
      this.scheduleDemoScan();
    } else {
      this.setData({ phase: 'scanning', showSource: false });
      wx.showToast({ title: '景点与文物已全部扫描完成', icon: 'none' });
    }
  },

  /** 文物 → 商城查看复刻 / 实物 */
  onViewGoods() {
    const id = this.data.goodsId;
    if (!id) return;
    wx.navigateTo({ url: `/package-mall/pages/goods-detail/goods-detail?id=${id}` });
  },

  onManualDetect() {
    if (this.data.phase === 'scanning') this.startRecognize();
  },

  /** 退出到首页 */
  onExit() {
    this.stopAudio();
    wx.switchTab({ url: '/pages/home/home' });
  },

  haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  },

  clearTimers() {
    if (scanTimer) {
      clearTimeout(scanTimer);
      scanTimer = null;
    }
    if (recTimer) {
      clearTimeout(recTimer);
      recTimer = null;
    }
  },

  onCamError() {
    wx.showToast({ title: '相机开启失败，请检查权限', icon: 'none' });
  },

  onUnload() {
    this.clearTimers();
    this.stopAudio();
    try {
      (vkSession as any)?.destroy?.();
    } catch (e) {
      /* noop */
    }
    vkSession = null;
  },
});
