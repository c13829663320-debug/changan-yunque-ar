import { ScenePoint } from '../data/types/scene';

/** 通关文牒章戳：仅现场 AR(ar-camera) 讲解收集时获得，云游(scene 页)不盖章 */
export interface Stamp {
  spotId: string;
  /** 关联场景 id；旧版迁移来的章戳无 sceneId（空串） */
  sceneId: string;
  /** 章戳名（点位殿名） */
  name: string;
}

export interface ProgressState {
  completedSceneIds: string[];
  /** 龙鳞：按景点分组存储，key=spotId，value=该景点已集齐的龙鳞名(scene.scaleName) */
  scales: Record<string, string[]>;
  /** 通关文牒章戳（现场获得） */
  stamps: Stamp[];
  collectedRelicIds: string[];
  currentSceneId: string;
}

const STORAGE_KEY = 'changan_yunque_progress_v1';
/** 旧版存档迁移归属景点（首版仅大明宫一个景点） */
export const LEGACY_SPOT = 'daminggong';

const createDefault = (): ProgressState => ({
  completedSceneIds: [],
  scales: {},
  stamps: [],
  collectedRelicIds: [],
  currentSceneId: 'danfengmen',
});

/** 巡游进度：龙鳞(按景点分组) / 现场集章 / 当前点位（单例，本地持久化） */
class ProgressStore {
  private state: ProgressState = createDefault();

  restore(): void {
    try {
      const saved = wx.getStorageSync(STORAGE_KEY);
      if (!saved) return;
      const raw = saved as Partial<ProgressState> & { scales?: unknown; stamps?: unknown };
      const state = { ...createDefault(), ...raw } as ProgressState;

      // 向后兼容：旧版 scales 是扁平 string[]（全部归入大明宫）
      if (Array.isArray(raw.scales)) {
        state.scales = { [LEGACY_SPOT]: (raw.scales as string[]).slice() };
      } else if (!raw.scales || typeof raw.scales !== 'object') {
        state.scales = {};
      }

      // 向后兼容：旧版 stamps 是扁平 string[]（章戳名，归入大明宫，无 sceneId）
      if (Array.isArray(raw.stamps)) {
        state.stamps = (raw.stamps as unknown as string[]).map((name) => ({
          spotId: LEGACY_SPOT,
          sceneId: '',
          name,
        }));
      }

      this.state = state;
    } catch (err) {
      console.warn('[progress] restore failed:', err);
    }
  }

  private persist(): void {
    try {
      wx.setStorageSync(STORAGE_KEY, this.state);
    } catch (err) {
      console.warn('[progress] persist failed:', err);
    }
  }

  /** 完成点位剧场：只收龙鳞(按景点分组，去重)，不再盖戳（盖戳见 stampScene，仅现场） */
  completeScene(scene: ScenePoint): void {
    if (!this.state.completedSceneIds.includes(scene.id)) {
      this.state.completedSceneIds.push(scene.id);
      const spotId = scene.spotId || LEGACY_SPOT;
      if (!this.state.scales[spotId]) this.state.scales[spotId] = [];
      if (!this.state.scales[spotId].includes(scene.scaleName)) {
        this.state.scales[spotId].push(scene.scaleName);
      }
    }
    this.state.currentSceneId = scene.id;
    this.persist();
  }

  /** 现场通关文牒盖章：仅 ar-camera 现场识别/收集时调用（按 sceneId 去重） */
  stampScene(scene: ScenePoint): void {
    const spotId = scene.spotId || LEGACY_SPOT;
    if (!this.state.stamps.some((st) => st.sceneId && st.sceneId === scene.id)) {
      this.state.stamps.push({ spotId, sceneId: scene.id, name: scene.name });
    }
    this.persist();
  }

  isCompleted(sceneId: string): boolean {
    return this.state.completedSceneIds.includes(sceneId);
  }

  /** 收入文物图鉴 */
  collectRelic(relicId: string): void {
    if (!this.state.collectedRelicIds.includes(relicId)) {
      this.state.collectedRelicIds.push(relicId);
    }
    this.persist();
  }

  isRelicCollected(relicId: string): boolean {
    return this.state.collectedRelicIds.includes(relicId);
  }

  setCurrent(sceneId: string): void {
    this.state.currentSceneId = sceneId;
    this.persist();
  }

  get snapshot(): ProgressState {
    return this.state;
  }

  /** 某景点已得龙鳞名列表（拷贝，避免外部直改） */
  getScales(spotId: string): string[] {
    return this.state.scales[spotId] ? this.state.scales[spotId].slice() : [];
  }

  /** 某景点龙鳞数 */
  getScaleCount(spotId: string): number {
    return this.state.scales[spotId] ? this.state.scales[spotId].length : 0;
  }

  /** 全部景点龙鳞总数（首页/巡游页依赖此总数） */
  get scaleCount(): number {
    return Object.values(this.state.scales).reduce((sum, arr) => sum + arr.length, 0);
  }

  /** 通关文牒章戳列表（拷贝） */
  get stamps(): Stamp[] {
    return this.state.stamps.slice();
  }

  get stampCount(): number {
    return this.state.stamps.length;
  }

  get relicCount(): number {
    return this.state.collectedRelicIds.length;
  }

  reset(): void {
    this.state = createDefault();
    this.persist();
  }
}

let instance: ProgressStore | null = null;

export function getProgressStore(): ProgressStore {
  if (!instance) instance = new ProgressStore();
  return instance;
}
