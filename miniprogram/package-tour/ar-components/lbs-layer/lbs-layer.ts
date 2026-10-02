/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * LBS 方位 / 静态兜底层（marker 未命中、AR 受限时启用）。
 *
 * 设计目标：任何设备 / 授权组合都不黑屏、不白屏、不崩溃。
 * - lbs 模式：后置相机（报错 / 无权限即退主题背景，方位引导继续）
 *            + GCJ-02 定位 + 罗盘方位引导；进入触发半径叠加复原图并上报 arrive。
 * - static 模式：主题背景 + 复原图 + 罗盘环视示意 + 「开启相机/定位」权限入口。
 *
 * 方位数学一律复用 ar-libs/geo.ts（buildHeadingGuide / schematicGuide / relativeAngle …），
 * 本组件不重复实现任何距离 / 角度公式。
 *
 * 【注意】七点位 geo/radius 均为近似值，需现场实测校准（界面底部常驻小字 + 数据使用处注释）。
 */
import { HeadingGuide } from '../../ar-libs/types';
import { watchCompass, CompassWatcher } from '../../ar-libs/compass';
import {
  getGcj02Location,
  turnInstruction,
  makeHeadingGuide,
  schematicGuide,
  TargetGeo,
} from '../../ar-libs/lbs-guide';

/** 界面常驻小字：点位坐标近似 */
const APPROX_NOTE = '点位坐标为近似值，需现场实测';

interface LbsLayerData {
  cameraActive: boolean;
  compassOn: boolean;
  locating: boolean;
  showRestore: boolean;
  restoreSrc: string;
  bgSrc: string;
  distanceText: string;
  turnText: string;
  arrowRotation: number;
  fallbackText: string;
  showLocationButton: boolean;
  approxNote: string;
}

Component({
  properties: {
    /** 当前点位（含 geo / bg / arRestoreImage） */
    scene: { type: Object, value: {} },
    /** 组件是否激活（页面就绪后置 true） */
    active: { type: Boolean, value: false },
    /** 'lbs' | 'static' */
    mode: { type: String, value: 'static' },
    /** 定位授权是否已授予 */
    locationGranted: { type: Boolean, value: false },
    /** 变化时完整重初始化 */
    reloadKey: { type: Number, value: 0 },
  },

  data: {
    cameraActive: false,
    compassOn: false,
    locating: false,
    showRestore: false,
    restoreSrc: '',
    bgSrc: '',
    distanceText: '',
    turnText: '',
    arrowRotation: 0,
    fallbackText: '',
    showLocationButton: false,
    approxNote: APPROX_NOTE,
  } as LbsLayerData,

  observers: {
    'active, mode, reloadKey': function () {
      (this as any).scheduleInit();
    },
  },

  attached() {
    (this as any).scheduleInit();
  },

  detached() {
    (this as any).teardown();
  },

  methods: {
    /** 归一化初始化入口：签名相同则跳过，避免 attached + observer 重复启动 */
    scheduleInit() {
      const c = this as any;
      if (!c.data.active) return;
      const sig = c.data.mode + '|' + c.data.reloadKey;
      if (c._lastSig === sig && c._inited) return;
      c._lastSig = sig;
      c.teardown();
      c.init();
    },

    init() {
      const c = this as any;
      const scene = c.data.scene || {};
      const mode = c.data.mode; // 'lbs' | 'static'
      c._token = (c._token || 0) + 1;
      c._inited = true;
      c._arriveFired = false;
      c._fix = null;
      c.setData({
        bgSrc: scene.bg || '',
        restoreSrc: scene.arRestoreImage || '',
        // lbs 模式先尝试渲染相机；static 不渲染相机
        cameraActive: mode === 'lbs',
        // static 恒显复原图；lbs 进入半径后才叠加
        showRestore: mode === 'static',
        compassOn: false,
        locating: false,
        distanceText: '',
        turnText: '',
        arrowRotation: 0,
        fallbackText: '',
        showLocationButton: false,
      });
      if (mode === 'lbs') c.startLbs();
      else c.startStatic();
    },

    /** 释放罗盘 / 定时器，可重复调用 */
    teardown() {
      const c = this as any;
      if (c._watcher) {
        c._watcher.stop();
        c._watcher = null;
      }
      if (c._locTimer) {
        clearInterval(c._locTimer);
        c._locTimer = null;
      }
    },

    /** lbs 模式：定位 + 罗盘方位引导 */
    async startLbs() {
      const c = this as any;
      const token = c._token;
      const scene = c.data.scene || {};
      const geo: TargetGeo | undefined = scene.geo; // 需现场实测的近似坐标

      if (!c.data.locationGranted) {
        c.setData({
          cameraActive: false,
          fallbackText: '未获得定位权限，无法计算距离与方位',
          showLocationButton: true,
        });
        return;
      }
      if (!geo) {
        c.setData({ cameraActive: false, fallbackText: '当前点位缺少坐标，无法方位引导' });
        c.triggerEvent('status', { text: '当前点位缺少坐标，已展示复原图' });
        return;
      }

      c.setData({ locating: true });
      let fix;
      try {
        fix = await getGcj02Location();
      } catch (e) {
        if (token !== c._token) return;
        c.setData({ locating: false });
        // 定位不可用：请求页面降级到 static（degrade.nextFallbackMode: lbs→static）
        c.triggerEvent('fallback', {
          from: 'lbs',
          to: 'static',
          reason: '定位不可用，已切换复原图 + 方位指引',
        });
        return;
      }
      if (token !== c._token) return;
      c._fix = fix;
      c.setData({ locating: false });
      c.triggerEvent('status', { text: '定位成功，跟随罗盘箭头前往遗址' });

      // 罗盘（若可用）：每次方向更新重算方位引导
      c._watcher = watchCompass({
        onHeading: (heading: number) => {
          if (token !== c._token || !c._fix) return;
          // 需现场实测：geo 为七点位近似坐标 / 半径
          const guide: HeadingGuide = makeHeadingGuide(c._fix, heading, geo);
          const instr = turnInstruction(guide.relativeAngle);
          c.setData({
            compassOn: true,
            distanceText: guide.distanceText,
            turnText: instr.text,
            arrowRotation: instr.rotation,
            showRestore: guide.inside || c.data.showRestore,
          });
          c.triggerEvent('heading', guide);
          if (guide.inside && !c._arriveFired) {
            c._arriveFired = true;
            c.triggerEvent('arrive', { sceneId: scene.id });
          }
        },
        onUnavailable: () => {
          if (token !== c._token) return;
          // 罗盘不可用：仍显示距离，箭头隐藏，凭地图方向前进
          let distanceText = c.data.distanceText;
          if (c._fix && geo) {
            distanceText = makeHeadingGuide(c._fix, 0, geo).distanceText;
          }
          c.setData({
            compassOn: false,
            distanceText,
            turnText: '',
            fallbackText: '罗盘不可用：距离已显示，请凭地图方向前往',
          });
        },
      });

      // 步行场景周期性刷新定位（约 10s），失败保留上一次 fix
      c._locTimer = setInterval(async () => {
        if (token !== c._token) return;
        try {
          c._fix = await getGcj02Location();
        } catch (e) {
          /* 保留旧 fix */
        }
      }, 10000);
    },

    /** static 模式：复原图 + 罗盘环视示意，权限入口 */
    startStatic() {
      const c = this as any;
      const token = c._token;
      c._watcher = watchCompass({
        onHeading: (heading: number) => {
          if (token !== c._token) return;
          // 无定位：示意方位，引导转动 / 环视
          const guide = schematicGuide(heading);
          c.setData({
            compassOn: true,
            arrowRotation: heading,
            turnText: '转动手机环视四周，查看复原方位示意',
          });
          c.triggerEvent('heading', guide);
        },
        onUnavailable: () => {
          if (token !== c._token) return;
          c.setData({
            compassOn: false,
            turnText: '',
            fallbackText: '当前设备不支持罗盘，请环视四周查看复原图',
          });
        },
      });
    },

    /** <camera> 报错 / 无权限：切主题背景，方位引导继续，绝不黑屏 */
    onCameraError() {
      const c = this as any;
      if (c.data.mode !== 'lbs') return;
      c.setData({
        cameraActive: false,
        fallbackText: '相机不可用，已切换主题背景，方位引导继续',
      });
      c.triggerEvent('status', { text: '相机不可用，已用主题背景 + 方位引导' });
    },

    /** 权限入口：交给页面 guideOpenSetting */
    onOpenCamera() {
      this.triggerEvent('permission', { scope: 'scope.camera' });
    },
    onOpenLocation() {
      this.triggerEvent('permission', { scope: 'scope.userLocation' });
    },
  },
});
