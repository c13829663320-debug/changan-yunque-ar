/**
 * 云游模式 AR 层：全景环视 viewer（feature/ar-xrframe）。
 *
 * 三级回退（任何一级失败都不白屏）：
 *   1) XRFrame：capability.xrframeSupport 为门控，xr-scene 全景球/模型 + 方向光与阴影；
 *      运行时加载失败（超时/error）→ 降级到第 2 级。
 *   2) 全景图视差：panoramaPath 宽幅图，手指拖动 + 陀螺仪水平环视，叠加晨昏光影/扫光 CSS。
 *   3) 复原图轻视差：全景素材缺失/加载失败 → scene.arRestoreImage 做轻微视差。
 *      连复原图也没有 → CSS 殿宇兜底。
 *
 * 组件契约：
 *   properties: scene(Object) / active(Boolean) / visible(Boolean) / panoramaPath(String) / reloadKey(Number)
 *   events:     status{text} / close / fallback{reason}
 *   自带「关闭 / 继续剧情」入口并 triggerEvent('close')，保持 scene 的 arWatched 流程。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScenePoint } from '../../../data/types/scene';
import { detectCapability } from '../../ar-libs/capability';
import { GyroLook } from '../../ar-libs/gyro';
import {
  computePanoramaX,
  computeRestoreParallax,
  normalize180,
} from '../../ar-libs/panorama';

type Tier = 'probing' | 'xrframe' | 'panorama' | 'restore' | 'static';

Component({
  properties: {
    scene: { type: Object, value: {} as ScenePoint },
    /** 是否启用（与 visible 共同决定开始/停止） */
    active: { type: Boolean, value: false },
    /** 是否可见（控制传感器与渲染） */
    visible: { type: Boolean, value: false },
    /** 宽幅全景图路径：/package-tour/assets/panorama/<id>.jpg */
    panoramaPath: { type: String, value: '' },
    /** 重新加载密钥（scene 切换时 +1） */
    reloadKey: { type: Number, value: 0 },
  },

  data: {
    tier: 'probing' as Tier,
    statusText: '',
    /** 全景图 translateX(px) */
    panoX: 0,
    /** 复原图轻视差 translateX(px) */
    restoreX: 0,
    /** 复原图源（第 3 级） */
    restoreSrc: '',
    /** 方向传感器是否生效（用于提示文案） */
    sensorOn: false,
  },

  lifetimes: {
    attached() {
      (this as any)._cap = detectCapability();
      (this as any)._gyro = new GyroLook();
      (this as any)._baseYaw = 0;
      (this as any)._hasBase = false;
      (this as any)._yaw = 0;
      (this as any)._dragPx = 0;
      (this as any)._lastTouchX = 0;
      (this as any)._xrLoaded = false;
      (this as any)._xrTimer = 0;
      try {
        (this as any)._screenW =
          (wx.getWindowInfo && wx.getWindowInfo().windowWidth) ||
          wx.getSystemInfoSync().windowWidth ||
          375;
      } catch (e) {
        (this as any)._screenW = 375;
      }
      // 全景图按屏幕宽 200% 渲染，留出可环视范围
      (this as any)._panoW = (this as any)._screenW * 2;
      (this as any)._restoreShift = Math.round((this as any)._screenW * 0.06);
    },
    detached() {
      (this as any)._stopAll();
    },
  },

  observers: {
    'active, visible, reloadKey': function (active: boolean, visible: boolean) {
      const running = active && visible;
      if (running) {
        (this as any)._start();
      } else {
        (this as any)._stopAll();
      }
    },
  },

  methods: {
    noop() {},

    /** 启动：按能力选 tier，失败逐级降级。 */
    _start() {
      (this as any)._stopGyro();
      (this as any)._baseYaw = 0;
      (this as any)._hasBase = false;
      (this as any)._yaw = 0;
      (this as any)._dragPx = 0;
      (this as any)._xrLoaded = false;
      this.setData({ tier: 'probing', statusText: '正在初始化云游全景…', panoX: 0, restoreX: 0 });

      const cap = (this as any)._cap;
      // 第 1 级：XRFrame（能力门控）
      if (cap && cap.xrframeSupport) {
        this.setData({ tier: 'xrframe', statusText: '正在加载 XRFrame 沉浸式殿宇与光影…' });
        this.triggerEvent('status', { text: '正在加载 XRFrame 殿宇…' });
        // 运行时探针：超时未 loaded → 降级全景
        (this as any)._clearXrTimer();
        (this as any)._xrTimer = setTimeout(() => {
          if (!(this as any)._xrLoaded) {
            (this as any)._degrade('panorama', 'xrframe 加载超时，降级全景环视');
          }
        }, 1600);
        return;
      }
      // 能力不满足 XRFrame：直接进第 2 级
      (this as any)._enterPanorama();
    },

    /** 第 2 级：全景图 + 陀螺仪/拖动视差。 */
    _enterPanorama() {
      const panoPath = this.data.panoramaPath;
      if (!panoPath) {
        (this as any)._enterRestore();
        return;
      }
      this.setData({ tier: 'panorama', statusText: '', panoX: -(this as any)._panoW / 2 });
      (this as any)._startGyro();
    },

    /** 第 3 级：复原图轻视差（全景缺失时）。 */
    _enterRestore() {
      const scene = (this.data.scene || {}) as ScenePoint;
      const restoreSrc = scene.arRestoreImage || '';
      (this as any)._startGyro();
      if (restoreSrc) {
        this.setData({ tier: 'restore', restoreSrc, statusText: '', restoreX: 0 });
      } else {
        // 连复原图也没有：CSS 殿宇兜底，绝不白屏
        this.setData({ tier: 'static', restoreSrc: '', statusText: '' });
      }
    },

    /** 统一降级：emit fallback 并切到下一级。 */
    _degrade(next: Tier, reason: string) {
      (this as any)._clearXrTimer();
      this.triggerEvent('fallback', { reason });
      this.triggerEvent('status', { text: reason });
      if (next === 'panorama') (this as any)._enterPanorama();
      else if (next === 'restore') (this as any)._enterRestore();
      else this.setData({ tier: 'static' });
    },

    /** 启动方向传感器，成功则开 gyro 视差。 */
    async _startGyro() {
      try {
        const r = await (this as any)._gyro.start((yaw: number) => {
          const s = this as any;
          if (!s._hasBase) {
            s._baseYaw = yaw;
            s._hasBase = true;
          }
          s._yaw = normalize180(yaw - s._baseYaw);
          s._applyOffset();
        });
        this.setData({ sensorOn: r.ok });
      } catch (e) {
        this.setData({ sensorOn: false });
      }
    },

    _stopGyro() {
      try {
        (this as any)._gyro && (this as any)._gyro.stop();
      } catch (e) {
        /* ignore */
      }
    },

    _clearXrTimer() {
      const t = (this as any)._xrTimer;
      if (t) {
        clearTimeout(t);
        (this as any)._xrTimer = 0;
      }
    },

    _stopAll() {
      (this as any)._clearXrTimer();
      (this as any)._stopGyro();
    },

    /** 依据当前 tier 与 yaw/drag 重算偏移（纯函数，可单测）。 */
    _applyOffset() {
      const s = this as any;
      if (this.data.tier === 'panorama') {
        const res = computePanoramaX({
          deltaYaw: s._yaw,
          dragPx: s._dragPx,
          imageW: s._panoW,
          screenW: s._screenW,
        });
        this.setData({ panoX: res.x });
      } else if (this.data.tier === 'restore') {
        const x = computeRestoreParallax(s._yaw, s._dragPx, s._restoreShift);
        this.setData({ restoreX: x });
      }
    },

    /* ===== 手指拖动 ===== */
    onTouchStart(e: WechatMiniprogram.TouchEvent) {
      const t = e.touches[0];
      if (t) (this as any)._lastTouchX = t.clientX;
    },
    onTouchMove(e: WechatMiniprogram.TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const s = this as any;
      s._dragPx += t.clientX - s._lastTouchX;
      s._lastTouchX = t.clientX;
      s._applyOffset();
    },
    onTouchEnd() {},

    /* ===== 全景图加载事件 ===== */
    onPanoLoad() {
      // 全景图就绪，无操作（偏移已按 200% 宽度预留）
    },
    onPanoError() {
      // 全景素材缺失/损坏 → 第 3 级复原图
      (this as any)._degrade('restore', '全景图加载失败，降级复原图视差');
    },

    /* ===== XRFrame 运行时事件 ===== */
    onXrLoaded() {
      (this as any)._xrLoaded = true;
      (this as any)._clearXrTimer();
      this.triggerEvent('status', { text: 'XRFrame 殿宇已加载，可环视' });
    },
    onXrError() {
      (this as any)._degrade('panorama', 'XRFrame 渲染失败，降级全景环视');
    },

    /* ===== 关闭入口（自带） ===== */
    onClose() {
      this.triggerEvent('close');
    },
    onContinue() {
      this.triggerEvent('close');
    },
  },
});
