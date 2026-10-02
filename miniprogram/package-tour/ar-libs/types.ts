/**
 * AR 公共类型与常量（feature/ar-xrframe）
 * 三个并行分片（marker 识别 / LBS 方位兜底 / 云游 3D 升级）共同依赖的硬契约。
 *
 * 坐标口径：
 * - 现场点位坐标使用国测局 GCJ-02（小程序 getLocation type=gcj02），与七点位数据一致。
 * - 罗盘角度 0°=正北、顺时针递增（device compass direction）。
 * - 所有 geo/radius 为近似值，必须现场实测校准（见 docs/ar-contract.md）。
 */

/** AR 运行模式（降级阶梯，自上而下能力由强到弱） */
export type ARMode =
  | 'marker' // VKSession marker 识别 + 透视/3D 叠加（最强）
  | 'lbs' // marker 未命中/AR 受限：相机画面 + LBS 距离 + 罗盘方位引导
  | 'static'; // 不支持 AR / 无定位授权：复原图 + 方位示意（最终兜底，永不白屏）

/** 页面启动阶段 */
export type BootState =
  | 'probing' // 能力探测中
  | 'permission' // 等待相机/定位授权
  | 'ready' // 模式已决议，挂载对应层
  | 'fatal'; // 致命错误（仍展示静态兜底，不崩溃）

/** 单项授权状态 */
export type PermissionState =
  | 'granted' // 已授权
  | 'denied' // 本次拒绝（可再次请求）
  | 'permanently-denied' // 永久拒绝（需引导 openSetting）
  | 'unknown'; // 尚未请求

/** 设备/环境 AR 能力画像 */
export interface ARCapability {
  /** 平台：ios / android / devtools / others */
  platform: string;
  /** 微信基础库版本（点分字符串，如 2.32.3） */
  sdkVersion: string;
  /** 是否存在 wx.createVKSession */
  hasVKSession: boolean;
  /** 是否满足 marker/VKSession 的基础库门槛（iOS 2.22 / 安卓 2.25） */
  versionQualified: boolean;
  /** 是否支持 marker 2D 图片识别（最终以运行时 marker 初始化结果为准） */
  markerSupport: boolean;
  /** v2 是否支持竖直平面（安卓 v2 不支持，仅水平面） */
  verticalPlaneSupport: boolean;
  /** 是否可使用 XRFrame（xr-scene / glTF） */
  xrframeSupport: boolean;
  /** 是否有陀螺仪/方向传感器（云游环视、罗盘依赖） */
  gyroscopeSupport: boolean;
  /** 是否处于开发者工具（VKSession 在工具内通常不可用） */
  isDevtools: boolean;
}

/** 相机/定位授权集合 */
export interface ARPermissionSet {
  camera: PermissionState;
  location: PermissionState;
}

/** 模式决议结果 */
export interface ModeDecision {
  mode: ARMode;
  /** 面向用户的状态说明 */
  reason: string;
  capability: ARCapability;
  permission: ARPermissionSet;
}

/** marker / 平面锚点姿态（右手系，4x4 列优先矩阵，与 VKSession 对齐） */
export interface ARAnchorPose {
  anchorId: string;
  /** 16 长度列优先模型矩阵 */
  transform: number[];
}

/** 方位引导数据（LBS/静态层使用） */
export interface HeadingGuide {
  /** 到点位的球面距离（米） */
  distance: number;
  /** 点位相对设备的绝对方位角（0=正北，顺时针） */
  targetBearing: number;
  /** 设备当前朝向角（罗盘） */
  deviceHeading: number;
  /** 需要右转（正）/左转（负）的相对角度，[-180,180] */
  relativeAngle: number;
  /** 是否在触发半径内 */
  inside: boolean;
  /** 距离文案 */
  distanceText: string;
}

/** AR 事件总线事件表 */
export interface AREventMap {
  /** marker 识别命中 */
  detected: { anchorId?: string; mode: ARMode };
  /** 追踪丢失 */
  lost: { mode: ARMode };
  /** 请求页面降级（如 VKSession 初始化/相机渲染失败） */
  fallback: { from: ARMode; to: ARMode; reason: string };
  /** 状态文案更新 */
  status: { text: string };
  /** 进入点位半径（LBS） */
  arrive: { sceneId: string };
  /** 方位引导更新 */
  heading: HeadingGuide;
}

/** 基础库版本门槛（机型兼容口径） */
export const MIN_SDK_VERSION: Record<string, string> = {
  ios: '2.22.0',
  android: '2.25.0',
};

/** 包内素材目录（绝对路径，供组件/库直接引用） */
export const ASSET_PATHS = {
  /** marker 识别图：assets/markers/<sceneId>.png */
  markerDir: '/package-tour/assets/markers/',
  /** 云游宽幅全景：assets/panorama/<sceneId>.jpg */
  panoramaDir: '/package-tour/assets/panorama/',
} as const;

/** 默认触发半径（数据缺失时兜底，单位米） */
export const DEFAULT_RADIUS = 120;
