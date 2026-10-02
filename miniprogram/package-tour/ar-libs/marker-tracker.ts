/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * marker-tracker.ts — VKSession marker 识别封装（feature/ar-xrframe）
 *
 * 官方 API 核实来源（developers.weixin.qq.com）：
 *  - wx.createVKSession({ track: { marker: true, plane: { mode } }, version: 'v2' })
 *  - session.addMarker(path)：识别图路径只接受「本地用户图片」（wxfile/usr、temp），
 *    包内绝对路径 /package-tour/... 不被接受时，先用 FileSystemManager 拷贝到 USER_DATA_PATH。
 *  - session.on('updateAnchors' | 'removeAnchors', anchors => ...)，
 *    anchor.transform 为 16 长度、列优先模型矩阵（与 three.js column-major 一致）。
 *  - session.start(errno => ...)；session.getVKFrame(w, h) / requestAnimationFrame / cancelAnimationFrame / destroy。
 *
 * 本模块只负责「识别会话生命周期 + 锚点姿态」，不做渲染（渲染见 vk-render.ts）。
 * 所有异常以 Promise.reject 形式上交，由组件统一 try/catch 后 triggerEvent fallback。
 */

const wxApi: any = (globalThis as any).wx || {};

/* ------------------------------------------------------------------ *
 * 纯逻辑（无 wx 副作用，可在 node 下静态加载/单测）
 * ------------------------------------------------------------------ */

/** track 配置结果 */
export interface TrackConfig {
  track: { marker: boolean; plane?: { mode: number } };
  version: string;
}

/**
 * 依据平台解析 VKSession track 配置。
 *  - v2 开启 plane 以获得 6DoF 位姿；
 *  - 安卓 v2 不支持竖直平面 → 仅水平面（mode 2）；
 *  - iOS 竖直 + 水平（mode 3）。
 * （plane.mode 枚举如现场实测不符，由 session.start 报错 → 上层 fallback，不崩溃。）
 */
export function resolveTrackConfig(platform: string, verticalPlaneSupport: boolean): TrackConfig {
  const planeMode = platform === 'android' ? 2 : 3;
  return {
    track: { marker: true, plane: { mode: planeMode } },
    version: 'v2',
  };
}

/**
 * 是否走「模拟路径」：VKSession 不可用（开发者工具 / 无 createVKSession）或页面 ?simulate=1。
 * 模拟路径不创建会话，由组件渲染主题背景 + 复原图叠加，保证无真机也能演示。
 */
export function shouldSimulate(capability: { hasVKSession: boolean; isDevtools: boolean }, querySimulate?: boolean): boolean {
  if (querySimulate) return true;
  if (capability.isDevtools) return true;
  if (!capability.hasVKSession) return true;
  return false;
}

/** 模拟锚点姿态：列优先单位阵（复原图叠加在屏幕中央） */
export function makeSimulatePose(): number[] {
  const m = new Array<number>(16).fill(0);
  for (let i = 0; i < 4; i++) m[i * 4 + i] = 1;
  return m;
}

/* ------------------------------------------------------------------ *
 * 会话封装
 * ------------------------------------------------------------------ */

export interface MarkerTrackerCallbacks {
  /** 状态文案（交给页面状态条） */
  onStatus(text: string): void;
  /** marker/平面 锚点首次命中（进入检测态） */
  onDetected(anchorId: string): void;
  /** 追踪丢失 */
  onLost(): void;
  /** 每帧：frame、相机、当前锚点姿态（未命中为 null） */
  onFrame(frame: any, camera: any, pose: number[] | null): void;
}

export interface MarkerTrackerOptions {
  markerPath: string;
  platform: string;
  verticalPlaneSupport: boolean;
  getSize: () => { w: number; h: number };
  callbacks: MarkerTrackerCallbacks;
}

/**
 * 把包内识别图拷贝到用户目录，得到 addMarker 可接受的本地路径。
 * 失败时原样返回，由调用方再尝试直接 addMarker。
 */
function copyMarkerToTemp(srcPath: string): string {
  try {
    if (!srcPath || srcPath.indexOf('/') !== 0) return srcPath;
    const fs = wxApi.getFileSystemManager && wxApi.getFileSystemManager();
    const userDir = wxApi.env && wxApi.env.USER_DATA_PATH;
    if (!fs || !userDir) return srcPath;
    const base = String(srcPath).split('/').pop() || 'marker.png';
    const dest = `${userDir}/ar-marker-${base}`;
    // 已存在则直接复用
    try {
      fs.accessSync(dest);
      return dest;
    } catch (e) {
      /* 不存在，继续拷贝 */
    }
    fs.copyFileSync(srcPath, dest);
    return dest;
  } catch (e) {
    return srcPath;
  }
}

export class MarkerTracker {
  private opts: MarkerTrackerOptions;
  private session: any = null;
  private rafId = 0;
  private destroyed = false;
  private detected = false;
  private pose: number[] | null = null;

  constructor(opts: MarkerTrackerOptions) {
    this.opts = opts;
  }

  /** 启动识别；任何错误都 reject，由组件兜底 fallback */
  async start(): Promise<void> {
    if (typeof wxApi.createVKSession !== 'function') {
      throw new Error('当前环境不支持 VKSession');
    }

    // 追踪初始化引导：缓慢左右平移以建立 VIO
    this.opts.callbacks.onStatus('请缓慢左右平移手机以初始化 AR');
    // 安卓 v2 不支持竖直平面：提示对准地面/水平面
    if (this.opts.platform === 'android' && !this.opts.verticalPlaneSupport) {
      this.opts.callbacks.onStatus('当前机型不支持竖直平面，请将镜头对准地面/水平面');
    }

    const cfg = resolveTrackConfig(this.opts.platform, this.opts.verticalPlaneSupport);
    let session: any;
    try {
      session = wxApi.createVKSession({ track: cfg.track, version: cfg.version });
    } catch (e) {
      throw new Error('创建 VKSession 失败');
    }
    this.session = session;

    // 加载识别图：包内路径先拷贝到用户目录，失败再直接试原路径
    const local = copyMarkerToTemp(this.opts.markerPath);
    let added = false;
    try {
      session.addMarker(local);
      added = true;
    } catch (e) {
      /* 继续尝试原路径 */
    }
    if (!added) {
      try {
        session.addMarker(this.opts.markerPath);
        added = true;
      } catch (e) {
        /* addMarker 失败：仍可依赖平面追踪，不致命 */
      }
    }

    // 锚点事件
    try {
      session.on('updateAnchors', (anchors: any[]) => this.handleUpdate(anchors));
      session.on('removeAnchors', () => this.handleRemove());
    } catch (e) {
      /* 事件注册失败不阻断 start */
    }

    // 启动会话
    const startErr = await new Promise<any>((resolve) => {
      try {
        session.start((err: any) => resolve(err));
      } catch (e) {
        resolve(e || new Error('start throw'));
      }
    });
    if (startErr) {
      throw new Error('VKSession 启动失败');
    }

    // 渲染循环（用 session 自己的 rAF，与帧分析对齐）
    const loop = () => {
      if (this.destroyed) return;
      try {
        const { w, h } = this.opts.getSize();
        const frame = session.getVKFrame(w, h);
        if (frame) this.opts.callbacks.onFrame(frame, frame.camera, this.pose);
      } catch (e) {
        /* 单帧异常不中断循环 */
      }
      this.rafId = session.requestAnimationFrame(loop);
    };
    this.rafId = session.requestAnimationFrame(loop);
  }

  /** 锚点更新：记录最新姿态，首次命中触发 detected */
  private handleUpdate(anchors: any[]): void {
    if (!anchors || anchors.length === 0) {
      this.handleRemove();
      return;
    }
    const a = anchors[0];
    if (a && Array.isArray(a.transform) && a.transform.length === 16) {
      this.pose = (a.transform as number[]).slice();
    }
    if (!this.detected) {
      this.detected = true;
      const id =
        a && a.markerId != null
          ? String(a.markerId)
          : a && a.id != null
            ? String(a.id)
            : 'marker';
      this.opts.callbacks.onDetected(id);
    }
  }

  /** 锚点移除：姿态清空，若曾命中则触发 lost */
  private handleRemove(): void {
    this.pose = null;
    if (this.detected) {
      this.detected = false;
      this.opts.callbacks.onLost();
    }
  }

  /** 停止 rAF、销毁会话、释放引用（幂等） */
  destroy(): void {
    this.destroyed = true;
    try {
      if (this.session && this.rafId && this.session.cancelAnimationFrame) {
        this.session.cancelAnimationFrame(this.rafId);
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (this.session && this.session.destroy) this.session.destroy();
    } catch (e) {
      /* ignore */
    }
    this.session = null;
    this.pose = null;
  }
}
