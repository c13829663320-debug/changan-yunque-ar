import { getProgressStore } from '../store/progress';
import { getSpots } from '../data/repositories/spotRepo';
import { getScenesBySpot } from '../data/repositories/sceneRepo';
import { getRelicsBySpot } from '../data/repositories/relicRepo';

/**
 * 成就 / 称号系统（数据驱动、只读进度，不回写存储）
 *
 * 一切称号都由「现有进度」推导：龙鳞按景点分组（store.scales）、文物图鉴
 * （store.collectedRelicIds）。新增景点 / 文物时，下列里程碑会随数据自动扩展，
 * 不写死总数。mine 页据此低调展示，scene 终章据此触发集齐奖励与隐藏彩蛋。
 */

export interface Achievement {
  id: string;
  /** 称号名（盛唐典雅，克制不浮夸） */
  title: string;
  /** 解锁条件（未解锁时点击可见） */
  desc: string;
  /** 进度：当前 / 目标 */
  cur: number;
  total: number;
  /** 是否已解锁 */
  got: boolean;
}

/** 集齐全部龙鳞的至尊称号（终章隐藏彩蛋与集齐分享钩子共用此常量） */
export const GRAND_TITLE = '长安云阙使';

/** 当前景点龙鳞总数（数据驱动） */
function spotScaleTotal(spotId: string): number {
  return getScenesBySpot(spotId).length;
}

/** 全部景点龙鳞总数（当前 = 大明宫 7 + 大雁塔 5 + 青龙寺 5 = 17） */
export function grandScaleTotal(): number {
  return getSpots().reduce((sum, sp) => sum + spotScaleTotal(sp.id), 0);
}

/** 文物图鉴总数（数据驱动） */
function relicTotal(): number {
  return getSpots().reduce((sum, sp) => sum + getRelicsBySpot(sp.id).length, 0);
}

interface AchDef {
  id: string;
  title: string;
  desc: string;
  cur: number;
  total: number;
}

/** 里程碑定义：顺序即「位阶」，currentTitle 取第一个已解锁者 */
function buildDefs(): AchDef[] {
  const store = getProgressStore();
  const spots = getSpots();

  // 单景点集齐称号（盛唐雅称，与景点气质呼应）
  const SPOT_TITLE: Record<string, string> = {
    daminggong: '千宫拾遗',
    dayanta: '雁塔题名',
    qinglongsi: '青龙听法',
  };
  const SPOT_HINT: Record<string, string> = {
    daminggong: '大明宫（千宫之宫）集齐全部龙鳞',
    dayanta: '大雁塔集齐全部龙鳞（雁塔题名）',
    qinglongsi: '青龙寺集齐全部龙鳞（密坛听法）',
  };

  const defs: AchDef[] = [];

  // 1. 初获龙鳞
  defs.push({
    id: 'first-scale',
    title: '初拾龙鳞',
    desc: '在长安拾起第一片龙鳞',
    cur: Math.min(store.scaleCount, 1),
    total: 1,
  });

  // 2-4. 单景点集齐（按景点数据顺序）
  for (const sp of spots) {
    const total = spotScaleTotal(sp.id);
    if (total <= 0) continue;
    defs.push({
      id: `spot-${sp.id}`,
      title: SPOT_TITLE[sp.id] || `${sp.name}巡使`,
      desc: SPOT_HINT[sp.id] || `集齐${sp.name}全部龙鳞`,
      cur: Math.min(store.getScaleCount(sp.id), total),
      total,
    });
  }

  // 5. 全部龙鳞集齐
  const gTotal = grandScaleTotal();
  defs.push({
    id: 'grand',
    title: GRAND_TITLE,
    desc: `集齐三城全部 ${gTotal} 片龙鳞`,
    cur: Math.min(store.scaleCount, gTotal),
    total: gTotal,
  });

  // 6. 收录首件文物
  defs.push({
    id: 'first-relic',
    title: '初鉴遗珍',
    desc: '现场扫描收录第一件文物',
    cur: Math.min(store.relicCount, 1),
    total: 1,
  });

  // 7. 文物图鉴全收录
  const rTotal = relicTotal();
  if (rTotal > 0) {
    defs.push({
      id: 'all-relic',
      title: '遗珍全鉴',
      desc: `收录文物图鉴全部 ${rTotal} 件`,
      cur: Math.min(store.relicCount, rTotal),
      total: rTotal,
    });
  }

  return defs;
}

/** 全部称号（已解锁态 + 进度），供 mine 页展示 */
export function listAchievements(): Achievement[] {
  return buildDefs().map((d) => ({
    id: d.id,
    title: d.title,
    desc: d.desc,
    cur: d.cur,
    total: d.total,
    got: d.cur >= d.total && d.total > 0,
  }));
}

/** 当前应展示的最高位阶称号（未解锁任何称号时返回空串） */
export function currentTitle(): string {
  const got = listAchievements().find((a) => a.got);
  return got ? got.title : '';
}

/** 当前进度是否已集齐全部龙鳞（终章隐藏彩蛋的触发条件） */
export function hasAllScales(): boolean {
  return getProgressStore().scaleCount >= grandScaleTotal();
}

/**
 * 某景点刚集齐全部龙鳞时，对应的称号名；未集齐返回空串。
 * 供 scene 终章结算的「集齐奖励」轻提示使用。
 */
export function spotCompletionTitle(spotId: string): string {
  const store = getProgressStore();
  const total = spotScaleTotal(spotId);
  if (total > 0 && store.getScaleCount(spotId) >= total) {
    const hit = listAchievements().find((a) => a.id === `spot-${spotId}`);
    return hit ? hit.title : '';
  }
  return '';
}
