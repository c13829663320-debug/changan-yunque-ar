/**
 * 云游全景环视的纯计算（无 wx 副作用、无平台依赖，便于 node 单测）。
 *
 * 坐标口径：
 * - yaw（水平朝向角）单位「度」，向右转头为正；
 * - translateX 以 px 计，负值=画面左移（露出右侧景象），正值=画面右移（露出左侧）；
 * - 全景图渲染宽 imageW 通常 > 屏幕宽 screenW，可移动范围 range = imageW - screenW。
 *
 * 三级回退（与 panorama-viewer 组件对应）：
 *   XRFrame（xr-scene 球/模型，带光照阴影） → 全景图 + 陀螺仪/拖动视差 → 复原图轻视差 → CSS 殿宇兜底（绝不白屏）。
 */

/** 把任意角度归一化到 [-180, 180]。 */
export function normalize180(deg: number): number {
  if (!isFinite(deg)) return 0;
  let d = ((deg % 360) + 360) % 360; // [0,360)
  if (d > 180) d -= 360;
  return d;
}

/** computePanoramaX 的入参 */
export interface PanoramaXInput {
  /** 相对「打开瞬间朝向」的水平转角（度，任意值，内部归一）。向右转头为正。 */
  deltaYaw: number;
  /** 手指拖动累计 px：向右拖为正（画面跟随手指右移，露出左侧）。 */
  dragPx: number;
  /** 全景图渲染宽度 px。应 >= screenW。 */
  imageW: number;
  /** 可视宽度 px（屏幕宽）。 */
  screenW: number;
}

/** computePanoramaX 的结果 */
export interface PanoramaXResult {
  /** 建议的 translateX(px)，已 clamp 到 [minX, maxX] */
  x: number;
  /** 最小偏移（最左移）= -(imageW - screenW) */
  minX: number;
  /** 最大偏移（最右移）= 0 */
  maxX: number;
}

/**
 * 计算全景图水平偏移。
 *
 * 约定：
 * - 初始视角居中（x = -range/2）；
 * - 向右转头（deltaYaw 增大）→ 看到右侧景象 → 画面左移（x 减小）；
 * - 手指右拖（dragPx>0）→ 画面右移（x 增大）；
 * - 灵敏度：±90° 扫视对应 ±半个可移动范围 range/2，防止过灵敏。
 *
 * @param input 见 PanoramaXInput
 */
export function computePanoramaX(input: PanoramaXInput): PanoramaXResult {
  const imageW = Math.max(0, input.imageW || 0);
  const screenW = Math.max(1, input.screenW || 1);
  const range = Math.max(0, imageW - screenW);
  const minX = -range;
  const maxX = 0;

  // 居中初始视角
  const center = -range / 2;
  // 灵敏度：±90° 对应 ±range/2
  const degToPx = range > 0 ? range / 2 / 90 : 0;
  const yaw = Math.max(-90, Math.min(90, normalize180(input.deltaYaw)));
  const drag = Number.isFinite(input.dragPx) ? input.dragPx : 0;

  let x = center - yaw * degToPx + drag;
  x = Math.max(minX, Math.min(maxX, x));
  return { x, minX, maxX };
}

/**
 * 复原图（非 360° 宽幅）的轻视差偏移。
 * 复原图不是全景，只做「随转头/拖动轻微平移」的视差，避免穿帮。
 *
 * @param deltaYaw 相对初始水平转角（度）
 * @param dragPx   手指拖动累计 px
 * @param maxShift 允许的最大平移 px（建议 = 屏幕宽的 4%~8%）
 * @returns 偏移 px，clamp 到 [-maxShift, maxShift]
 */
export function computeRestoreParallax(
  deltaYaw: number,
  dragPx: number,
  maxShift: number,
): number {
  const limit = Math.max(0, maxShift || 0);
  const yaw = Math.max(-60, Math.min(60, normalize180(deltaYaw)));
  const drag = Number.isFinite(dragPx) ? dragPx : 0;
  // 向右转头 → 画面微左移；拖动跟随手指
  let x = -yaw * (limit / 60) + drag * 0.3;
  x = Math.max(-limit, Math.min(limit, x));
  return x;
}
