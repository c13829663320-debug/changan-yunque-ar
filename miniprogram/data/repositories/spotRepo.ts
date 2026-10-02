import spots from '../spots/index';
import { Spot } from '../types/spot';

/**
 * 景点数据访问。
 * M0：直接读取本地结构化数据；
 * M2 接入云开发后，可改为 async 并从云数据库读取，页面调用处保持同一签名。
 */
export function getSpots(): Spot[] {
  return spots;
}

export function getEnabledSpots(): Spot[] {
  return spots.filter((s) => s.enabled);
}

export function getSpot(id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}
