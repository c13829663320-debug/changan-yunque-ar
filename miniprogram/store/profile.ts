export interface UserProfile {
  /** 头像：默认包内图，或本地用户文件持久路径（chooseAvatar 后 saveFile） */
  avatar: string;
  nickname: string;
  /** 个性签名（选填） */
  signature: string;
}

const STORAGE_KEY = 'changan_yunque_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  avatar: '/assets/characters/yunque-girl.jpg',
  nickname: '云阙旅人',
  signature: '',
};

/** 用户资料：头像 / 昵称 / 签名（单例，本地持久化；与巡游进度相互独立） */
class ProfileStore {
  private state: UserProfile = { ...DEFAULT_PROFILE };

  restore(): void {
    try {
      const saved = wx.getStorageSync(STORAGE_KEY) as UserProfile | '';
      if (saved) this.state = { ...DEFAULT_PROFILE, ...saved };
    } catch (err) {
      console.warn('[profile] restore failed:', err);
    }
  }

  private persist(): void {
    try {
      wx.setStorageSync(STORAGE_KEY, this.state);
    } catch (err) {
      console.warn('[profile] persist failed:', err);
    }
  }

  update(patch: Partial<UserProfile>): void {
    this.state = { ...this.state, ...patch };
    this.persist();
  }

  get snapshot(): UserProfile {
    return this.state;
  }

  reset(): void {
    this.state = { ...DEFAULT_PROFILE };
    this.persist();
  }
}

let instance: ProfileStore | null = null;

export function getProfileStore(): ProfileStore {
  if (!instance) instance = new ProfileStore();
  return instance;
}
