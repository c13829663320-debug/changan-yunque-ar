/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * LBS 方位引导业务辅助：定位获取 + 转向指引文案。
 *
 * 坐标口径与 geo.ts 一致：GCJ-02（小程序 getLocation type=gcj02）。
 * 【注意】七点位 geo/radius 均为近似值，需现场实测校准（见 types.ts 头部说明）。
 *
 * 纯方位数学（距离 / 方位角 / 相对转角 / 距离文案）一律复用 ar-libs/geo.ts，
 * 本模块不重复实现任何角度或球面公式。
 */
import { HeadingGuide } from './types';
import { buildHeadingGuide, schematicGuide } from './geo';

const wxApi: any = (globalThis as any).wx || {};

/** 一次设备定位修正点 */
export interface LbsFix {
  latitude: number;
  longitude: number;
}

/** 点位坐标（近似值，需现场实测） */
export interface TargetGeo {
  latitude: number;
  longitude: number;
  radius?: number;
}

/**
 * 拉取一次 GCJ-02 定位。失败时 reject，由调用方决定降级 / 兜底文案。
 */
export function getGcj02Location(): Promise<LbsFix> {
  return new Promise((resolve, reject) => {
    wxApi.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: (res: any) =>
        resolve({ latitude: Number(res.latitude), longitude: Number(res.longitude) }),
      fail: (err: any) => reject(new Error((err && err.errMsg) || 'getLocation fail')),
    });
  });
}

/** 转向指引的展示结果 */
export interface TurnInstruction {
  /** 文案，如「右转 35° 正对遗址」 */
  text: string;
  /** 屏幕方位箭头旋转角（度）：正对=0，目标在右侧=正，左侧=负 */
  rotation: number;
  /** 是否已基本正对（容差 8°） */
  centered: boolean;
}

/**
 * 由 geo.relativeAngle 的结果生成转向文案与屏幕箭头角度。
 * 这里只做文案 / 取整，不重新计算角度。
 */
export function turnInstruction(relativeAngle: number): TurnInstruction {
  const rel = Math.round(relativeAngle);
  if (Math.abs(rel) <= 8) {
    return { text: '已正对遗址', rotation: 0, centered: true };
  }
  if (rel > 0) {
    return { text: `右转 ${rel}° 正对遗址`, rotation: rel, centered: false };
  }
  return { text: `左转 ${Math.abs(rel)}° 正对遗址`, rotation: rel, centered: false };
}

/**
 * 组装一次方位引导（薄封装 geo.buildHeadingGuide，避免组件重复字段拼装）。
 * @param fix 设备当前位置
 * @param heading 罗盘朝向（0=正北顺时针）
 * @param geo 点位坐标与触发半径（近似值，需现场实测）
 */
export function makeHeadingGuide(
  fix: LbsFix,
  heading: number,
  geo: TargetGeo,
): HeadingGuide {
  // 需现场实测：geo 为七点位近似坐标，触发半径亦为近似值
  return buildHeadingGuide(
    { latitude: fix.latitude, longitude: fix.longitude, heading },
    geo,
  );
}

/** 无定位时的示意方位（静态兜复用 geo.schematicGuide，不重复实现） */
export { schematicGuide };
