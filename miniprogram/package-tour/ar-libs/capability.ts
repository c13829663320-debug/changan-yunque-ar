/**
 * 设备 / 环境 AR 能力探测与基础库版本门控。
 * 机型兼容口径：iOS 基础库 2.22 起、安卓 2.25 起（见 types.MIN_SDK_VERSION）。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ARCapability } from './types';
import { MIN_SDK_VERSION } from './types';

const wxApi: any = (globalThis as any).wx || {};

/** 点分版本号比较：a>b→1，a=b→0，a<b→-1（非数字段按 0 处理） */
export function compareVersions(a: string, b: string): number {
  const pa = String(a || '0').split('.');
  const pb = String(b || '0').split('.');
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const na = parseInt(pa[i] || '0', 10) || 0;
    const nb = parseInt(pb[i] || '0', 10) || 0;
    if (na !== nb) return na > nb ? 1 : -1;
  }
  return 0;
}

/** 当前平台是否达到 AR 基础库门槛 */
export function meetsMinVersion(platform: string, sdkVersion: string): boolean {
  const need = MIN_SDK_VERSION[platform];
  if (!need) return false; // 未列入门槛的平台（含 devtools/others）默认不达标
  return compareVersions(sdkVersion, need) >= 0;
}

/** 汇总系统信息（兼容新旧 API） */
function collectSystem(): { platform: string; sdkVersion: string } {
  let platform = '';
  let sdkVersion = '';
  try {
    if (wxApi.getDeviceInfo) {
      const d = wxApi.getDeviceInfo();
      platform = d.platform || '';
    }
    if (wxApi.getAppBaseInfo) {
      const b = wxApi.getAppBaseInfo();
      sdkVersion = b.SDKVersion || '';
    }
  } catch (e) {
    /* fall through to getSystemInfoSync */
  }
  if (!platform || !sdkVersion) {
    try {
      const s = wxApi.getSystemInfoSync ? wxApi.getSystemInfoSync() : {};
      platform = platform || s.platform || '';
      sdkVersion = sdkVersion || s.SDKVersion || '';
    } catch (e) {
      /* keep defaults */
    }
  }
  return { platform: String(platform).toLowerCase(), sdkVersion };
}

let cached: ARCapability | null = null;

/** 探测 AR 能力（结果在一次运行内缓存） */
export function detectCapability(): ARCapability {
  if (cached) return cached;

  const { platform, sdkVersion } = collectSystem();
  const isDevtools = platform === 'devtools';
  const hasVKSession = typeof wxApi.createVKSession === 'function';
  const versionQualified = !isDevtools && meetsMinVersion(platform, sdkVersion);

  // marker / XRFrame：以「API 存在 + 版本达标」乐观判定，最终以运行时初始化结果为准
  const markerSupport = hasVKSession && versionQualified;
  const xrframeSupport = versionQualified && !isDevtools;

  // 安卓 VKSession v2 仅支持水平平面，不支持竖直平面；iOS 支持竖直平面
  const verticalPlaneSupport = platform === 'ios';

  // 真机一般具备陀螺仪；开发者工具不保证
  const gyroscopeSupport = platform === 'ios' || platform === 'android';

  cached = {
    platform,
    sdkVersion,
    hasVKSession,
    versionQualified,
    markerSupport,
    verticalPlaneSupport,
    xrframeSupport,
    gyroscopeSupport,
    isDevtools,
  };
  return cached;
}

/** 清除缓存（测试用） */
export function resetCapabilityCache(): void {
  cached = null;
}
