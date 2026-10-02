import { ScenePoint } from '../data/types/scene';

export interface ProgressState {
  completedSceneIds: string[];
  scales: string[];
  stamps: string[];
  currentSceneId: string;
}

const STORAGE_KEY = 'changan_yunque_progress_v1';

const createDefault = (): ProgressState => ({
  completedSceneIds: [],
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
