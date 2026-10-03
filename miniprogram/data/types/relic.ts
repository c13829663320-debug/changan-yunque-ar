import { SourceCard } from './scene';

/** 现场可扫描文物 / 物品 */
export interface Relic {
  id: string;
  spotId: string;
  /** 关联点位 id（在哪个点位附近展陈） */
  sceneId: string;
  name: string;
  /** 年代标签，如「唐 · 建筑构件」 */
  era: string;
  /** 文物配图（包内路径） */
  image: string;
  /** 云阙亲口讲解（1-3 句） */
  yunqueLines: string[];
  /** 历史背景 */
  intro: string;
  /** 文物灵感 / AIGC 合规标注 */
  culturalNote?: string;
  /** 可溯源史料卡 */
  sourceCard?: SourceCard;
  /** 关联商城商品 id（用于导流复刻） */
  goodsId?: string;
}
