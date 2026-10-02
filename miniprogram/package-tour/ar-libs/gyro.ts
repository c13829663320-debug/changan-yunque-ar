/**
 * 方向传感器封装（云游环视 / 罗盘兜底共用）。
 *
 * 优先级：
 *   1) wx.onDeviceOrientationChange：取绕竖直轴的 alpha 作为水平 yaw；
 *   2) 不可用时回退 wx.startCompass + wx.onCompassChange：取 direction（0=正北，顺时针）；
 *   3) 都不可用 → start() resolve(false)，调用方走纯手指拖动。
 *
 * 注意：本模块不做「水平偏移」的具体换算，只负责吐出原始 yaw 角度；
 * 偏移计算见 ar-libs/panorama.ts（纯函数，可单测）。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const wxApi: any = (globalThis as any).wx || {};

export type GyroSource = 'deviceOrientation' | 'compass' | 'none';

export interface GyroStartResult {
  /** 是否成功开启任一方向传感器 */
  ok: boolean;
  source: GyroSource;
}

/**
 * 水平朝向监听。用法：
 *   const g = new GyroLook();
 *   const r = await g.start((yaw) => {...});
 *   // 离开时 g.stop();
 */
export class GyroLook {
  private started = false;
  private cleanup: (() => void) | null = null;
  private cb: ((yaw: number) => void) | null = null;

  get isStarted(): boolean {
    return this.started;
  }

  /**
   * 启动方向监听。
   * @param onSample 每帧回调当前水平 yaw（度，0..360 或设备方向 alpha 0..360）
   */
  start(onSample: (yaw: number) => void): Promise<GyroStartResult> {
    return new Promise((resolve) => {
      this.cb = onSample;

      // 1) 设备方向传感器
      try {
        if (typeof wxApi.onDeviceOrientationChange === 'function') {
          const handler = (res: any) => {
            if (typeof res.alpha === 'number') onSample(res.alpha);
            else if (typeof res.gamma === 'number') onSample(res.gamma);
          };
          wxApi.onDeviceOrientationChange(handler);
          this.cleanup = () => {
            try {
              if (typeof wxApi.offDeviceOrientationChange === 'function') {
                wxApi.offDeviceOrientationChange(handler);
              }
            } catch (e) {
              /* ignore */
            }
          };
          this.started = true;
          resolve({ ok: true, source: 'deviceOrientation' });
          return;
        }
      } catch (e) {
        /* 继续回退罗盘 */
      }

      // 2) 罗盘兜底
      try {
        if (typeof wxApi.startCompass === 'function') {
          const handler = (res: any) => {
            if (typeof res.direction === 'number') onSample(res.direction);
          };
          wxApi.startCompass({
            success: () => {
              try {
                wxApi.onCompassChange(handler);
              } catch (e) {
                /* 已 start 但监听失败，仍视为可用 */
              }
              this.cleanup = () => {
                try {
                  wxApi.stopCompass({});
                } catch (e) {
                  /* ignore */
                }
                try {
                  if (typeof wxApi.offCompassChange === 'function') {
                    wxApi.offCompassChange(handler);
                  }
                } catch (e) {
                  /* ignore */
                }
              };
              this.started = true;
              resolve({ ok: true, source: 'compass' });
            },
            fail: () => {
              this.started = false;
              resolve({ ok: false, source: 'none' });
            },
          });
          return;
        }
      } catch (e) {
        /* 继续返回 none */
      }

      resolve({ ok: false, source: 'none' });
    });
  }

  /** 停止并解绑。 */
  stop(): void {
    try {
      if (this.cleanup) this.cleanup();
    } catch (e) {
      /* ignore */
    }
    this.cleanup = null;
    this.cb = null;
    this.started = false;
  }
}
