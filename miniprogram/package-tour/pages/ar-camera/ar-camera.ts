/**
 * 现场 AR 相机页（薄编排层）
 * 职责：能力探测 → 相机/定位授权 → 模式决议 → 挂载 marker-layer 或 lbs-layer；
 *      处理运行时二次降级与权限重试。具体识别/渲染/方位逻辑下沉到组件与 ar-libs。
 *
 * 任何异常都收敛到 static（复原图 + 方位指引），保证不白屏、不崩溃。
 */
import { getScene } from '../../../data/repositories/sceneRepo';
import { ScenePoint } from '../../../data/types/scene';
import { detectCapability } from '../../ar-libs/capability';
import { requestARPermissions, guideOpenSetting } from '../../ar-libs/permission';
import { decideMode, nextFallbackMode } from '../../ar-libs/degrade';
import { ASSET_PATHS, ARMode, BootState } from '../../ar-libs/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
Page({
  data: {
    scene: {} as ScenePoint,
    sceneName: '',
    bootState: 'probing' as BootState,
    mode: 'static' as ARMode,
    statusText: '正在初始化 AR…',
    // 授权状态
    locationGranted: false,
    // 传给组件
    markerPath: '',
    enableGlb: true,
    reloadKey: 0,
    restoreSrc: '',
    // 模拟旁路：?simulate=1 时强制 marker 层（开发者工具内用模拟锚点演示叠加）
    simulate: false,
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = query?.id || 'danfengmen';
    const simulate = query?.simulate === '1';
    const scene = getScene(id);
    if (!scene) {
      wx.showToast({ title: '点位不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({
      scene,
      sceneName: scene.name,
      restoreSrc: scene.arRestoreImage || '',
      markerPath: ASSET_PATHS.markerDir + scene.id + '.png',
      simulate,
    });
    this.boot();
  },

  /** 启动流程：探测 → 授权 → 决议 */
  async boot() {
    try {
      // 模拟旁路：直接进入 marker 层，由组件以模拟锚点演示
      if (this.data.simulate) {
        this.setData({
          mode: 'marker',
          statusText: '模拟环境：演示 marker 识别与殿宇叠加',
          bootState: 'ready',
        });
        return;
      }
      detectCapability(); // 提前探测并缓存
      // 相机 + 定位都尝试申请；marker 模式失败时可无缝降级到 lbs
      const permission = await requestARPermissions(true);
      const decision = decideMode(detectCapability(), permission);
      this.setData({
        mode: decision.mode,
        locationGranted: permission.location === 'granted',
        statusText: decision.reason,
        bootState: 'ready',
      });
    } catch (e) {
      // 启动异常：直接进入静态兜底
      this.setData({
        mode: 'static',
        bootState: 'ready',
        statusText: 'AR 初始化异常，已为你展示复原图与方位指引',
      });
    }
  },

  /** 组件状态文案 */
  onLayerStatus(e: WechatMiniprogram.CustomEvent<{ text: string }>) {
    if (e.detail && e.detail.text) this.setData({ statusText: e.detail.text });
  },

  /** marker 识别命中 */
  onDetected(e: WechatMiniprogram.CustomEvent<{ anchorId?: string }>) {
    this.setData({ statusText: '已识别，殿宇已叠加在遗址之上' });
  },

  onLost() {
    this.setData({ statusText: '追踪已丢失，移动镜头重新对准识别图' });
  },

  onArrive() {
    this.setData({ statusText: '已进入点位范围，殿宇复原已叠加' });
  },

  /**
   * 组件请求降级（VKSession 初始化失败 / 相机渲染失败 / 传感器不可用）。
   */
  onLayerFallback(
    e: WechatMiniprogram.CustomEvent<{ from?: ARMode; reason?: string }>,
  ) {
    const from = e.detail?.from || this.data.mode;
    const next = nextFallbackMode(
      from,
      this.data.locationGranted ? 'granted' : 'permanently-denied',
    );
    if (next === this.data.mode) return;
    this.setData({
      mode: next,
      statusText:
        (e.detail?.reason ? e.detail.reason + '；' : '') +
        (next === 'lbs'
          ? '已切换 LBS/罗盘方位引导'
          : '已切换复原图 + 方位指引'),
      reloadKey: this.data.reloadKey + 1,
    });
  },

  /**
   * lbs-layer 请求开启权限（相机/定位被拒后的入口）。
   */
  async onRequestPermission(
    e: WechatMiniprogram.CustomEvent<{ scope?: string }>,
  ) {
    const scope = e.detail?.scope || 'scope.camera';
    const isLocation = scope === 'scope.userLocation';
    const granted = await guideOpenSetting({
      scope,
      title: isLocation ? '需要定位权限' : '需要相机权限',
      content: isLocation
        ? '开启定位后，可在现场依据距离与罗盘方位叠加殿宇复原'
        : '开启相机后，可在遗址之上实时叠加殿宇复原',
    });
    if (!granted) return;
    // 成功后重新决议并强制组件重建
    const permission = await requestARPermissions(true);
    const decision = decideMode(detectCapability(), permission);
    this.setData({
      mode: decision.mode,
      locationGranted: permission.location === 'granted',
      statusText: decision.reason,
      reloadKey: this.data.reloadKey + 1,
    });
  },

  /** 手动重新识别（页面级兜底入口） */
  onRetry() {
    this.setData({ reloadKey: this.data.reloadKey + 1 });
  },

  noop() {},
});
