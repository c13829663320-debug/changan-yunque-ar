/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * marker-layer — 现场 marker 识别 + 遗址复原叠加层（feature/ar-xrframe）
 *
 * 组件契约（页面 ar-camera 已按此接线，勿改）：
 *  properties：scene(ScenePoint) / active(Boolean) / enableGlb(Boolean) / markerPath(String) / reloadKey(Number)
 *  事件：status{text} / detected{anchorId} / lost / fallback{from,to,reason}
 *  生命周期：observers 监听 active/reloadKey 启动；detached 销毁 VKSession、停 rAF、释放 WebGL。
 *
 *  降级链：真机 VKSession 失败/渲染异常 → fallback{from:'marker'}（页面切 lbs，自带 camera/主题背景）；
 *          VKSession 不可用（开发者工具 / ?simulate=1）→ 内置模拟路径（主题背景 + 复原图叠加），绝不黑白屏。
 */
import { MarkerTracker, shouldSimulate, makeSimulatePose } from '../../ar-libs/marker-tracker';
import { VkRenderer } from '../../ar-libs/vk-render';
import { detectCapability } from '../../ar-libs/capability';
import config from '../../../config/index';
import { ScenePoint } from '../../../data/types/scene';

Component({
  properties: {
    scene: { type: Object, value: {} as ScenePoint },
    active: { type: Boolean, value: false },
    enableGlb: { type: Boolean, value: true },
    markerPath: { type: String, value: '' },
    reloadKey: { type: Number, value: 0 },
  },

  data: {
    /** true=模拟路径（CSS 主题背景+复原图）；false=真机 webgl 画布 */
    simulate: false,
    restoreSrc: '',
    themeBg: '',
    overlayOn: false,
  },

  observers: {
    'active, reloadKey'(active: boolean, _reloadKey: number) {
      if (active) {
        // 等待 wxml 完成本轮渲染（canvas 节点就位）后再初始化
        setTimeout(() => (this as any).boot(), 60);
      }
    },
  },

  lifetimes: {
    detached() {
      (this as any).teardown();
    },
  },

  methods: {
    /** 入口：解析模式 → 真机 / 模拟 */
    boot() {
      this.teardown();
      const self = this as any;
      const gen = (self._gen = (self._gen || 0) + 1);

      const scene: ScenePoint = this.data.scene || ({} as ScenePoint);
      const restoreSrc = scene.arRestoreImage || '';
      const themeBg = scene.bg || '';
      this.setData({ restoreSrc, themeBg, overlayOn: false });

      // glb 升级项：仅当 enableGlb 且 cdnBase+arModel 可解析时才尝试；当前 cdnBase 为空 → 走复原图
      const cdn = (config && config.cdnBase) || '';
      const model = scene.arModel || '';
      self._glbUrl = this.properties.enableGlb && cdn && model ? cdn.replace(/\/+$/, '') + '/' + model : '';

      const cap = detectCapability();
      const querySim = readQuerySimulate();
      if (gen !== self._gen) return;

      if (shouldSimulate(cap, querySim)) {
        this.startSimulate(gen);
      } else {
        this.startReal(gen, cap);
      }
    },

    /** 模拟路径：主题背景 + 复原图叠加（无真机也能演示） */
    startSimulate(gen: number) {
      this.setData({ simulate: true });
      this.triggerEvent('status', { text: '模拟环境：演示 marker 识别与殿宇叠加' });
      setTimeout(() => {
        const self = this as any;
        if (gen !== self._gen) return;
        const scene: ScenePoint = this.data.scene || ({} as ScenePoint);
        makeSimulatePose(); // 引用纯逻辑，保持模拟锚点口径
        this.setData({ overlayOn: true });
        this.triggerEvent('detected', { anchorId: 'sim-' + (scene.id || 'marker') });
      }, 700);
    },

    /** 真机路径：webgl 画布 + VKSession */
    startReal(gen: number, cap: ReturnType<typeof detectCapability>) {
      this.setData({ simulate: false });
      const self = this as any;
      const query = this.createSelectorQuery();
      query.select('#arCanvas').node();
      query.exec((res: any) => {
        if (gen !== self._gen) return;
        let canvasNode: any = null;
        let gl: any = null;
        try {
          canvasNode = res && res[0] && res[0].node;
          if (!canvasNode) throw new Error('canvas node 不存在');
          gl = canvasNode.getContext('webgl', { antialias: true, alpha: false });
          if (!gl) throw new Error('获取 webgl 上下文失败');
          const wxA: any = wx;
          const win = wxA.getWindowInfo ? wxA.getWindowInfo() : wx.getSystemInfoSync();
          const dpr = win.pixelRatio || 2;
          canvasNode.width = Math.floor((win.windowWidth || 375) * dpr);
          canvasNode.height = Math.floor((win.windowHeight || 667) * dpr);
        } catch (e) {
          this.safeFallback('AR 相机画布初始化失败');
          return;
        }

        let renderer: VkRenderer;
        try {
          renderer = new VkRenderer(canvasNode, gl, this.data.restoreSrc);
        } catch (e) {
          this.safeFallback('AR 渲染器初始化失败');
          return;
        }
        self._renderer = renderer;

        const tracker = new MarkerTracker({
          markerPath: this.properties.markerPath,
          platform: cap.platform,
          verticalPlaneSupport: cap.verticalPlaneSupport,
          getSize: () => ({ w: canvasNode.width, h: canvasNode.height }),
          callbacks: {
            onStatus: (t: string) => this.triggerEvent('status', { text: t }),
            onDetected: (anchorId: string) => this.triggerEvent('detected', { anchorId }),
            onLost: () => this.triggerEvent('lost', {}),
            onFrame: (frame: any, camera: any, pose: number[] | null) => {
              try {
                renderer.render(frame, camera, pose);
              } catch (e) {
                this.safeFallbackOnce('AR 实时渲染失败');
              }
            },
          },
        });
        self._tracker = tracker;

        tracker.start().catch(() => {
          this.safeFallback('AR 识别启动失败，已为你切换方位引导');
        });
      });
    },

    /** 触发一次降级（幂等） */
    safeFallbackOnce(reason: string) {
      const self = this as any;
      if (self._fbFired) return;
      self._fbFired = true;
      this.safeFallback(reason);
    },

    /** 立即降级到 lbs/static（由页面 nextFallbackMode 决议） */
    safeFallback(reason: string) {
      this.teardown();
      this.triggerEvent('fallback', { from: 'marker', to: 'lbs', reason });
    },

    /** 销毁会话、停 rAF、释放 WebGL、使进行中的异步回调失效 */
    teardown() {
      const self = this as any;
      self._gen = (self._gen || 0) + 1;
      try {
        if (self._tracker) self._tracker.destroy();
      } catch (e) {
        /* ignore */
      }
      try {
        if (self._renderer) self._renderer.destroy();
      } catch (e) {
        /* ignore */
      }
      self._tracker = null;
      self._renderer = null;
      self._fbFired = false;
    },
  },
});

/** 读取冷/热启动 query 是否带 ?simulate=1（组件无法直接拿页面 query，用启动选项兜底） */
function readQuerySimulate(): boolean {
  try {
    const wxA: any = wx;
    const opt = wxA.getEnterOptionsSync
      ? wxA.getEnterOptionsSync()
      : wxA.getLaunchOptionsSync
        ? wxA.getLaunchOptionsSync()
        : {};
    return !!(opt && opt.query && opt.query.simulate === '1');
  } catch (e) {
    return false;
  }
}
