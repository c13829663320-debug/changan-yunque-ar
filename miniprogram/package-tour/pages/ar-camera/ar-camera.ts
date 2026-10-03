import { getScene } from '../../../data/repositories/sceneRepo';
import { ScenePoint } from '../../../data/types/scene';

/* eslint-disable @typescript-eslint/no-explicit-any */
let session: WechatMiniprogram.VKSession | null = null;

Page({
  data: {
    scene: {} as ScenePoint,
    sceneName: '',
    detected: false,
    vkStatus: '',
    mode: 'vksession' as 'vksession' | 'lbs' | 'demo',
    distance: '',
    heading: '',
    restoreSrc: '',
    restoreVideo: '',
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = query?.id || 'danfengmen';
    const scene = getScene(id);
    if (!scene) {
      wx.showToast({ title: '点位不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    const hasVK = typeof (wx as any).createVKSession === 'function';
    this.setData({
      scene,
      sceneName: scene.name,
      restoreSrc: scene.arRestoreImage || '',
      restoreVideo: scene.restoreVideo || '',
      mode: hasVK ? 'vksession' : 'lbs',
      vkStatus: hasVK
        ? 'VisionKit 可用，正在初始化 marker 识别…'
        : '当前环境不支持 VisionKit，已切换 LBS/罗盘 方位叠加',
    });
    if (hasVK) {
      this.initVK(scene);
    } else {
      this.initLBS(scene);
    }
  },

  onUnload() {
    try {
      (session as any)?.destroy?.();
    } catch (e) {
      /* noop */
    }
    session = null;
    try {
      wx.stopCompass();
      wx.offCompassChange?.();
    } catch (e) {
      /* noop */
    }
  },

  /** 真机：VKSession v2，marker 识别 + 平面，识别成功后叠加复原 */
  initVK(scene: ScenePoint) {
    try {
      session = (wx as any).createVKSession({
        track: { plane: { mode: 1 }, marker: true },
        version: 'v2',
      }) as WechatMiniprogram.VKSession;
      session.start((err: any) => {
        if (err) {
          this.initLBS(scene);
          return;
        }
        this.setData({ vkStatus: 'AR 已启动：对准解说牌 / 识别图即可叠加复原' });
      });
      session.on('updateAnchors', (res: any) => {
        if (res && res.anchors && res.anchors.length) this.markDetected();
      });
      session.on('removeAnchors', () => this.setData({ detected: false }));
    } catch (e) {
      this.initLBS(scene);
    }
  },

  /** 兜底：LBS 距离 + 罗盘朝向，进入触发半径自动叠加 */
  initLBS(scene: ScenePoint) {
    this.setData({
      mode: 'lbs',
      vkStatus: 'LBS/罗盘 方位叠加：进入点位触发半径即自动复原',
    });
    wx.getLocation({
      type: 'gcj02',
      success: (loc) => this.updateDistance(scene, loc),
      fail: () =>
        this.setData({
          mode: 'demo',
          vkStatus: '未获得定位授权，可点按下方按钮手动演示叠加',
        }),
    });
    wx.startCompass();
    wx.onCompassChange?.((c) => {
      this.setData({ heading: '朝向 ' + Math.round(c.direction) + '°' });
    });
  },

  updateDistance(scene: ScenePoint, loc: WechatMiniprogram.GetLocationSuccessCallbackResult) {
    if (!scene.geo) return;
    const d = this.haversine(
      loc.latitude,
      loc.longitude,
      scene.geo.latitude,
      scene.geo.longitude,
    );
    const inside = d <= (scene.geo.radius || 120);
    this.setData({
      distance: d < 1000 ? Math.round(d) + ' 米' : (d / 1000).toFixed(1) + ' 公里',
      detected: inside,
    });
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

  markDetected() {
    if (!this.data.detected) {
      this.setData({ detected: true });
      wx.showToast({ title: '已识别，殿宇已叠加', icon: 'none' });
    }
  },

  /** 无真机 / 无定位时手动演示 */
  onDetect() {
    this.setData({ detected: !this.data.detected });
  },

  onCamError() {
    wx.showToast({ title: '相机开启失败，请检查权限', icon: 'none' });
  },
});
