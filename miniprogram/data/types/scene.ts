/** 点位剧场（互动小剧场） */

/** 角色 id：yunque=云阙，narrator=旁白，其余为功能性配角 */
export type ActorId = 'yunque' | 'narrator' | string;

export interface ChoiceFeedback {
  actor: ActorId;
  actorName?: string;
  text: string;
}

export interface DialogChoice {
  id: string;
  text: string;
  /** 选择后的即时反馈（轻分支，不改变主线） */
  feedback: ChoiceFeedback;
  /** 是否为合礼/正确选择，影响即时彩蛋与提示 */
  correct?: boolean;
}

export type SceneActionType =
  | 'look_around'
  | 'enter_gate'
  | 'ar_restore'
  | 'collect_scale'
  | 'open_source_card'
  | 'custom';

export interface SceneAction {
  type: SceneActionType;
  name?: string;
  meta?: Record<string, unknown>;
}

export interface DialogNode {
  id: string;
  actor: ActorId;
  actorName?: string;
  text: string;
  /** 配音资源地址（CDN）；为空时仅显示文字 */
  audio?: string;
  /** 该节点触发的互动 */
  action?: SceneAction;
  /** 分支选择（出现选择时暂停，等待用户） */
  choices?: DialogChoice[];
}

export interface SourceWork {
  name: string;
  quote?: string;
}

/** 史料卡：保证典故可溯源 */
export interface SourceCard {
  title: string;
  works: SourceWork[];
  note: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  /** 触发半径（米） */
  radius?: number;
}

export interface ScenePoint {
  id: string;
  spotId: string;
  /** 路线顺序 1..7 */
  index: number;
  name: string;
  /** 用户在剧场中扮演的身份 */
  role: string;
  /** 集齐的龙鳞名 */
  scaleName: string;
  /** 剧场轻重 */
  weight: 'heavy' | 'light';
  /** 现场 LBS 坐标与触发半径 */
  geo?: GeoPoint;
  /** 现场识别图（marker） */
  markerImage?: string;
  /** AR 复原模型（glb，CDN） */
  arModel?: string;
  /** 舞台背景关键帧（包内绝对路径或 CDN）；为空时回退到色调渐变 */
  bg?: string;
  /** AR 复原层「复原图」（包内绝对路径或 CDN）；为空时回退到 CSS 示意殿宇 */
  arRestoreImage?: string;
  cover?: string;
  intro: string;
  sourceCard: SourceCard;
  dialogs: DialogNode[];
}
