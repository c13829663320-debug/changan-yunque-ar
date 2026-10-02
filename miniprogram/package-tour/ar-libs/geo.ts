/**
 * 纯地理/方位计算（无副作用、无平台依赖，便于单测与静态验证）
 * 坐标：GCJ-02 经纬度；角度：0=正北、顺时针。
 */
import { HeadingGuide } from './types';
import { DEFAULT_RADIUS } from './types';

const EARTH_R = 6371000; // 地球平均半径（米）
const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** 两点球面距离（米），Haversine */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * 从设备位置到目标点位的绝对方位角（初始方位角，0=正北，顺时针，结果 [0,360)）
 */
export function bearing(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number {
  const y = Math.sin(toRad(toLon - fromLon)) * Math.cos(toRad(toLat));
  const x =
    Math.cos(toRad(fromLat)) * Math.sin(toRad(toLat)) -
    Math.sin(toRad(fromLat)) *
      Math.cos(toRad(toLat)) *
      Math.cos(toRad(toLon - fromLon));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** 角度归一化到 [0,360) */
export function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * 设备朝向到目标方位的相对转角（结果 [-180,180]）：
 * 正值=目标在设备右侧需右转，负值=左侧需左转，0/±180=正对/背对。
 */
export function relativeAngle(targetBearing: number, deviceHeading: number): number {
  let rel = normalize360(targetBearing - deviceHeading);
  if (rel > 180) rel -= 360;
  return rel;
}

/** 距离文案：米 / 公里 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} 米`;
  return `${(meters / 1000).toFixed(1)} 公里`;
}

/**
 * 汇总方位引导（LBS 层每帧/每次罗盘更新时调用）
 * @param fix 设备当前位置与朝向
 * @param geo 点位坐标与触发半径（近似值，需现场实测）
 */
export function buildHeadingGuide(
  fix: { latitude: number; longitude: number; heading: number },
  geo: { latitude: number; longitude: number; radius?: number },
): HeadingGuide {
  const distance = haversine(
    fix.latitude,
    fix.longitude,
    geo.latitude,
    geo.longitude,
  );
  const targetBearing = bearing(
    fix.latitude,
    fix.longitude,
    geo.latitude,
    geo.longitude,
  );
  const radius = geo.radius || DEFAULT_RADIUS;
  const deviceHeading = normalize360(fix.heading);
  const rel = relativeAngle(targetBearing, deviceHeading);
  return {
    distance,
    targetBearing,
    deviceHeading,
    relativeAngle: rel,
    inside: distance <= radius,
    distanceText: formatDistance(distance),
  };
}

/**
 * 无定位时的「示意方位」：直接用罗盘朝向作为目标方位，
 * 引导用户转动手机寻找叠加（静态兜底，不产生真实距离）。
 */
export function schematicGuide(deviceHeading: number): HeadingGuide {
  const heading = normalize360(deviceHeading);
  return {
    distance: NaN,
    targetBearing: heading,
    deviceHeading: heading,
    relativeAngle: 0,
    inside: false,
    distanceText: '',
  };
}
