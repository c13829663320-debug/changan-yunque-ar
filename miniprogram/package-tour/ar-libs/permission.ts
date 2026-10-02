/**
 * 相机 / 定位授权：统一处理「申请 — 拒绝 — 永久拒绝」三种路径。
 * 永久拒绝不再弹原生授权框，改为引导用户进入 openSetting 手动开启。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionState, ARPermissionSet } from './types';

const wxApi: any = (globalThis as any).wx || {};

/** 读取单项授权的当前状态 */
export function getScopeState(scope: string): Promise<PermissionState> {
  return new Promise((resolve) => {
    wxApi.getSetting({
      success: (res: any) => {
        const v = res.authSetting ? res.authSetting[scope] : undefined;
        if (v === true) resolve('granted');
        else if (v === false) resolve('permanently-denied');
        else resolve('unknown');
      },
      fail: () => resolve('unknown'),
    });
  });
}

/**
 * 请求单项授权。
 * - unknown（从未询问）→ 弹原生授权框；
 * - 已授权 → 直接 granted；
 * - 已被关闭 → permanently-denied（交由上层引导 openSetting，不再弹框）。
 */
export function ensurePermission(scope: string): Promise<PermissionState> {
  return new Promise((resolve) => {
    wxApi.getSetting({
      success: (res: any) => {
        const v = res.authSetting ? res.authSetting[scope] : undefined;
        if (v === true) return resolve('granted');
        if (v === false) return resolve('permanently-denied');
        // 首次：发起原生授权
        wxApi.authorize({
          scope,
          success: () => resolve('granted'),
          fail: () =>
            // 拒绝后再查一次设置：被置为 false 即视为永久拒绝
            wxApi.getSetting({
              success: (r2: any) =>
                resolve(r2.authSetting && r2.authSetting[scope] === false
                  ? 'permanently-denied'
                  : 'denied'),
              fail: () => resolve('denied'),
            }),
        });
      },
      fail: () => resolve('unknown'),
    });
  });
}

/**
 * 弹窗引导用户前往设置页开启权限；返回是否最终开启。
 */
export function guideOpenSetting(options: {
  scope: string;
  title: string;
  content: string;
  confirmText?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    wxApi.showModal({
      title: options.title,
      content: options.content,
      confirmText: options.confirmText || '去设置',
      cancelText: '暂不',
      success: (m: any) => {
        if (!m.confirm) return resolve(false);
        wxApi.openSetting({
          success: (r: any) =>
            resolve(!!(r.authSetting && r.authSetting[options.scope] === true)),
          fail: () => resolve(false),
        });
      },
      fail: () => resolve(false),
    });
  });
}

/** 相机授权（scope.camera） */
export function ensureCameraPermission(): Promise<PermissionState> {
  return ensurePermission('scope.camera');
}

/** 定位授权（scope.userLocation） */
export function ensureLocationPermission(): Promise<PermissionState> {
  return ensurePermission('scope.userLocation');
}

/**
 * 一次性获取 AR 所需授权集合。
 * @param needLocation 是否需要定位（marker 模式可不强制定位）
 */
export async function requestARPermissions(needLocation: boolean): Promise<ARPermissionSet> {
  // 相机与定位并行请求，互不阻塞
  const [camera, location] = await Promise.all([
    ensureCameraPermission(),
    needLocation ? ensureLocationPermission() : Promise.resolve('unknown' as PermissionState),
  ]);
  return { camera, location };
}
