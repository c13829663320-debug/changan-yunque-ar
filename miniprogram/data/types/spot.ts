/** 景点（可复用模板） */
export interface SpotTimelineItem {
  /** 纪年展示，如「634年·贞观八年」 */
  year: string;
  title: string;
  desc: string;
}

export interface SpotRelic {
  name: string;
  desc: string;
  image?: string;
}

export interface OpenInfo {
  hours: string;
  ticket: string;
  traffic: string;
}

export interface Spot {
  id: string;
  name: string;
  subtitle: string;
  city: string;
  cover?: string;
  /** 一段话定位 */
  summary: string;
  tags: string[];
  /** 历史时间线 */
  timeline: SpotTimelineItem[];
  /** 关联文物 / 看点 */
  relics: SpotRelic[];
  openInfo: OpenInfo;
  /** 关联点位剧场 id（顺序即巡游路线） */
  sceneIds: string[];
  /** 是否已上线（Demo 仅大明宫为 true） */
  enabled: boolean;
}
