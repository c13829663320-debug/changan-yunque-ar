/**
 * 景点数字馆 · 可复用数据契约（Spot Schema v1）
 * ------------------------------------------------------------
 * 新景点只需：
 *   1) 在 data/spots/ 下新增一个 <spotId>.ts，按本 schema 填数据；
 *   2) 在 data/spots/index.ts 注册；
 *   3) 放入对应图片素材。
 * 页面 package-spot/pages/spot-detail/* 完全数据驱动，无需改动。
 *
 * 约定：
 *  - 所有坐标类字段均为「确定性示意图」归一化坐标（0–100），不是真实地理，严禁地图；
 *  - 图片路径为分包内绝对路径，如 /package-spot/assets/spot/<spotId>/cover.jpg；
 *  - 史料原文（quote）必须可溯源、确证后再填，不确定只给出处、不杜撰原文。
 */

// ============ 头图 / 关键事实 ============

/** 头图下的关键事实数据条，如「占地 3.2km²」「17 位皇帝」 */
export interface SpotStat {
  label: string;
  value: string;
}

// ============ 历史沿革时间线 ============

export interface SpotTimelineItem {
  /** 纪年展示，如「634年·贞观八年」 */
  year: string;
  title: string;
  desc: string;
  /** 可选配图 */
  image?: string;
  /** 可选分组标签，如「唐代营建」「遗址新生」，用于时间线分层 */
  era?: string;
}

// ============ 宫城 / 园区动线（确定性示意图，非地图） ============

/** 动线分区（如「三朝中轴」「北部后寝」），用于示意区域底色 */
export interface SpotRouteZone {
  id: string;
  name: string;
  desc?: string;
  /** 归一化区域矩形 0–100 */
  bounds?: { x: number; y: number; w: number; h: number };
  /** 分区语义色（低饱和，建议取 design token 同色系） */
  color?: string;
}

/** 动线点位 */
export interface SpotRouteNode {
  id: string;
  name: string;
  /** 点位角色，如「外朝」「中朝」「内朝」「后寝」「北门」 */
  role?: string;
  desc?: string;
  /** 归一化坐标 0–100（确定性示意，非真实地理比例） */
  x: number;
  y: number;
  /** 若该点位对应剧场，填剧场 id，点击可进入 */
  sceneId?: string;
  image?: string;
}

/** 点位连线 */
export interface SpotRouteEdge {
  from: string;
  to: string;
  /** 是否为主轴线（三朝中轴），主轴用更重的样式 */
  primary?: boolean;
  label?: string;
}

/** 动线示意图整体配置 */
export interface SpotRoute {
  title?: string;
  /** 示意性质声明，必填口径如「示意动线，非真实地理比例」 */
  note?: string;
  zones?: SpotRouteZone[];
  nodes: SpotRouteNode[];
  edges: SpotRouteEdge[];
  /** 巡游起点节点 id（CTA 默认进入） */
  startNodeId?: string;
}

// ============ 必看亮点 ============

export interface SpotHighlight {
  id: string;
  name: string;
  /** 角标，如「核心遗址」「镇馆看点」 */
  tag?: string;
  desc: string;
  image?: string;
  /** 关联剧场 id（可选，点击可进入对应剧场） */
  sceneId?: string;
}

// ============ 关联剧场入口 ============

/**
 * 关联点位剧场。仅通过仓库既有剧场 id 做关联，不改剧场本体。
 * name/subtitle/image 为可选「展示覆盖」；全部缺省时，页面自动从剧场数据
 * （sceneRepo）取 name / intro / scaleName / bg 渲染卡片。
 * 无剧场的景点给空数组，该板块自动隐藏。
 */
export interface SpotTheaterLink {
  sceneId: string;
  name?: string;
  subtitle?: string;
  image?: string;
}

// ============ 史料引用 ============

export interface SpotCitation {
  id: string;
  /** 文献名，如《旧唐书》 */
  work: string;
  /** 卷 / 篇，如「卷三十八·地理志」 */
  chapter?: string;
  /** 原文摘录：须确证、可溯源；不确定则留空，切勿杜撰 */
  quote?: string;
  /** 资料类型：典籍 / 考古报告 / 近现代研究 */
  kind?: 'classic' | 'archaeology' | 'modern';
  note?: string;
  url?: string;
}

// ============ 到访信息 ============

export interface OpenInfo {
  hours: string;
  ticket: string;
  traffic: string;
}

// ============ 景点聚合 ============

export interface Spot {
  /** 景点唯一标识，与 data/spots/<id>.ts 文件名一致 */
  id: string;
  name: string;
  subtitle: string;
  city: string;
  /** 景点头图（分包内绝对路径） */
  cover: string;
  /** 头图下可选图集 */
  gallery?: string[];
  /** 一段话定位 */
  summary: string;
  tags: string[];
  /** 头图下关键事实数据条（选填） */
  stats?: SpotStat[];
  /** 历史沿革时间线 */
  timeline: SpotTimelineItem[];
  /** 宫城 / 园区动线确定性示意图 */
  route: SpotRoute;
  /** 必看亮点 */
  highlights: SpotHighlight[];
  /** 关联剧场入口（无则空数组，板块自动隐藏） */
  theaters: SpotTheaterLink[];
  /** 史料引用 */
  citations: SpotCitation[];
  /** 到访信息 */
  openInfo: OpenInfo;
  /** 是否已上线；未上线景点不出现在启用列表，但可凭 id 预览 */
  enabled: boolean;
}
