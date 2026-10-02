/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 罗盘（方向传感器）封装：统一 startCompass / onCompassChange / stopCompass。
 *
 * 角度口径与 ar-libs/geo.ts 一致：0°=正北、顺时针递增。
 * 职责：
 * - 注册 / 解绑罗盘监听，回调引用固定（便于 offCompassChange 精确移除）；
 * - 统一处理「罗盘不可用」：API 缺失、startCompass 失败、或启动后超时无回调，
 *   都通过 onUnavailable 回调告知上层，由上层给兜底文案，绝不崩溃；
 * - 返回 watcher，组件 detached / reloadKey 重建时调用 stop() 释放。
 */
const wxApi: any = (globalThis as any).wx || {};

export interface CompassWatcher {
  /** 停止并解绑监听，可重复调用，幂等。 */
  stop(): void;
}

export interface CompassOptions {
  /** 每次罗盘更新回调（角度，度，0=正北顺时针）。 */
  onHeading: (heading: number) => void;
  /** startCompass 成功（罗盘可用）。 */
  onAvailable?: () => void;
  /** 罗盘不可用（API 缺失 / 启动失败 / 超时无回调）。 */
  onUnavailable?: (reason: string) => void;
}

/**
 * 启动罗盘监听。
 * 必须在组件 / 页面存活期间持有返回的 watcher，并在 detached / 重初始化时 stop()。
 */
export function watchCompass(options: CompassOptions): CompassWatcher {
  let stopped = false;
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const clearTimeoutSafe = (): void => {
    if (timeoutHandle !== null) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
  };

  const handler = (res: any): void => {
    if (stopped) return;
    // 一旦拿到真实数据，取消「超时视为不可用」的兜底计时器
    clearTimeoutSafe();
    const heading = Number(res && res.direction);
    if (Number.isNaN(heading)) return;
    options.onHeading(heading);
  };

  const fail = (reason: string): void => {
    if (stopped) return;
    stopped = true;
    clearTimeoutSafe();
    try {
      if (typeof wxApi.offCompassChange === 'function') wxApi.offCompassChange(handler);
    } catch (e) {
      /* 解绑失败可忽略 */
    }
    if (options.onUnavailable) options.onUnavailable(reason);
  };

  // API 直接缺失：视为不可用，仍返回一个可 stop 的空 watcher
  if (typeof wxApi.onCompassChange !== 'function' || typeof wxApi.startCompass !== 'function') {
    return {
      stop() {
        stopped = true;
      },
    };
  }

  try {
    wxApi.onCompassChange(handler);
    wxApi.startCompass({
      success: () => {
        if (stopped) return;
        if (options.onAvailable) options.onAvailable();
        // 兜底：启动成功后 3s 内仍无方向回调，视为罗盘不可用（如部分无磁传感器机型 / 工具）
        timeoutHandle = setTimeout(() => fail('罗盘启动后无方向回调'), 3000);
      },
      fail: (err: any) => fail('罗盘启动失败：' + ((err && err.errMsg) || 'unknown')),
    });
  } catch (e) {
    fail('罗盘调用异常');
  }

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      clearTimeoutSafe();
      try {
        if (typeof wxApi.offCompassChange === 'function') wxApi.offCompassChange(handler);
      } catch (e) {
        /* ignore */
      }
      try {
        if (typeof wxApi.stopCompass === 'function') wxApi.stopCompass({});
      } catch (e) {
        /* ignore */
      }
    },
  };
}
