import spots from '../spots/index';
import { Spot } from '../types/spot';

/**
 * 景点数据访问收口（Spot Repository）。
 * 页面只允许通过本模块读取景点数据，不直接 import data/spots。
 * M1：读取本地结构化数据；
 * M2 接入云开发后可改为 async 并从云数据库读取，页面调用签名保持不变。
 */

/** 全部景点（含未上线，用于预览） */
export function getSpots(): Spot[] {
  return spots;
}

/** 已上线景点 */
export function getEnabledSpots(): Spot[] {
  return spots.filter((s) => s.enabled);
}

/** 按 id 获取景点 */
export function getSpot(id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}

/** 全部景点 id（便于注册校验 / 调试） */
export function getSpotIds(): string[] {
  return spots.map((s) => s.id);
}
