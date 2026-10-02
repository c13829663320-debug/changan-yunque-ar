/**
 * 降级策略：依据能力画像与授权状态决议运行模式（marker → lbs → static）。
 * 任何设备/授权组合都能落到一个可用模式，保证不白屏、不崩溃。
 */
import {
  ARCapability,
  ARPermissionSet,
  ARMode,
  ModeDecision,
  PermissionState,
} from './types';

/**
 * 决议模式。
 * 阶梯：
 * 1) marker：支持 marker 且相机已授权；
 * 2) lbs：定位已授权（相机有无均可，无相机时用主题背景 + 方位引导）；
 * 3) static：其余情况（不支持 AR / 全未授权）→ 复原图 + 方位示意。
 */
export function decideMode(
  capability: ARCapability,
  permission: ARPermissionSet,
): ModeDecision {
  const cameraOK = permission.camera === 'granted';
  const locationOK = permission.location === 'granted';

  let mode: ARMode;
  let reason: string;

  if (capability.markerSupport && cameraOK) {
    mode = 'marker';
    reason = 'AR 已就绪：将镜头对准点位解说牌 / 识别图，即可在遗址上叠加复原';
  } else if (locationOK) {
    mode = 'lbs';
    reason = cameraOK
      ? '已切换方位引导：移动并转动手机，依据罗盘箭头在遗址上叠加复原'
      : '未获得相机权限，已用方位引导：跟随罗盘箭头前往点位查看复原';
  } else {
    mode = 'static';
    reason = '当前环境不支持 AR 或未授权，已为你展示复原图与方位指引';
  }

  return { mode, reason, capability, permission };
}

/**
 * 运行时二次降级：当某模式在初始化/渲染阶段失败时，给出下一个安全模式。
 * marker 失败 → 定位可用则 lbs，否则 static；lbs 失败 → static。
 */
export function nextFallbackMode(
  from: ARMode,
  locationState: PermissionState,
): ARMode {
  if (from === 'marker' && locationState === 'granted') return 'lbs';
  return 'static';
}
