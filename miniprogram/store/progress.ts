import { ScenePoint } from '../data/types/scene';

export interface ProgressState {
  completedSceneIds: string[];
  /** 现场 LBS 已解锁（到达过附近）的剧场 id；云游完成也会经此持久化 */
  unlockedSceneIds: string[];
  scales: string[];
  stamps: string[];
  currentSceneId: string;
}

const STORAGE_KEY = 'changan_yunque_progress_v1';

const createDefault = (): ProgressState => ({
  completedSceneIds: [],
  unlockedSceneIds: [],
  scales: [],
  stamps: [],
  currentSceneId: 'danfengmen',
});

/** 巡游进度：龙鳞 / 集章 / 当前点位（单例，本地持久化） */
class ProgressStore {
  private state: ProgressState = createDefault();

  restore(): void {
    try {
      const saved = wx.getStorageSync(STORAGE_KEY) as ProgressState | '';
      if (saved) this.state = { ...createDefault(), ...saved };
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

  completeScene(scene: ScenePoint): void {
    if (!this.state.completedSceneIds.includes(scene.id)) {
      this.state.completedSceneIds.push(scene.id);
      this.state.scales.push(scene.scaleName);
      this.state.stamps.push(scene.name);
    }
    this.state.currentSceneId = scene.id;
    this.persist();
  }

  isCompleted(sceneId: string): boolean {
    return this.state.completedSceneIds.includes(sceneId);
  }

  /** 现场到达附近后解锁剧场（幂等），与云游完成共用同一份持久化 */
  unlockScene(sceneId: string): void {
    if (!this.state.unlockedSceneIds.includes(sceneId)) {
      this.state.unlockedSceneIds.push(sceneId);
    }
    this.state.currentSceneId = sceneId;
    this.persist();
  }

  /** 是否已解锁：现场到达过，或此前已完成过该剧场 */
  isUnlocked(sceneId: string): boolean {
    return (
      this.state.unlockedSceneIds.includes(sceneId) ||
      this.state.completedSceneIds.includes(sceneId)
    );
  }

  setCurrent(sceneId: string): void {
    this.state.currentSceneId = sceneId;
    this.persist();
  }

  get snapshot(): ProgressState {
    return this.state;
  }

  get scaleCount(): number {
    return this.state.scales.length;
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
