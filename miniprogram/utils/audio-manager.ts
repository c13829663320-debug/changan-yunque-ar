/**
 * 长安云阙 · 轻量音频管理器（P1-B）
 *
 * 设计目标：
 * - 背景乐单例低音量循环；UI 音效一次性短播、播完即销毁
 * - 遵循微信自动播放策略：背景乐必须在「首次用户手势」后才启动
 * - 全局开关 soundOn 持久化（wx.setStorageSync，默认开）；关闭时停背景乐且不播音效
 * - 全部创建/播放失败静默吞掉，绝不阻塞或抛错到业务逻辑
 *
 * 注意：dialog 配音（scene 页各自的 audioCtx）与本管理器相互独立，
 * 本管理器只管「背景乐 + 环境氛围 + UI 音效」这一层，不碰业务数据流。
 */

const SOUND_KEY = 'changan_sound_on';

/** 全部音频均为 CDN 短链，不进包体 */
export const AUDIO_ASSETS = {
  /** 盛唐宫廷雅乐（可循环，背景乐默认床） */
  bgmPalace: 'https://aka.doubaocdn.com/s/m3isPldU8e',
  /** 唐代寺院静谧（可循环，备用床） */
  bgmTemple: 'https://aka.doubaocdn.com/s/QGGZHwq7q0',
  /** 宫殿远景风声 + 钟磬（环境） */
  ambientPalace: 'https://aka.doubaocdn.com/s/3jgo2m0xE3',
  /** 寺院庭院风过花枝 + 鸟鸣（环境） */
  ambientTemple: 'https://aka.doubaocdn.com/s/lviR4u08sV',
  /** 太液池水波鸟鸣（环境） */
  ambientPool: 'https://aka.doubaocdn.com/s/ggoXk9CiWN',
  /** UI：按钮轻触 */
  uiTap: 'https://aka.doubaocdn.com/s/yL8f5ze7cB',
  /** UI：集鳞成功 · 鎏金叮 */
  uiCollect: 'https://aka.doubaocdn.com/s/A2JPJGIORt',
  /** UI：盖章 · 朱印落纸 */
  uiStamp: 'https://aka.doubaocdn.com/s/JzRZmm0rVA',
  /** UI：识别/复原成功 · 上行叮咚 */
  uiRecognize: 'https://aka.doubaocdn.com/s/uTFwETSwMO',
  /** UI：弹窗开启 */
  uiOpen: 'https://aka.doubaocdn.com/s/cU5JZyhkPI',
  /** UI：返回/关闭 */
  uiBack: 'https://aka.doubaocdn.com/s/EylU9RauRF',
} as const;

export type SfxName = 'tap' | 'collect' | 'stamp' | 'recognize' | 'open' | 'back';

const SFX_URL: Record<SfxName, string> = {
  tap: AUDIO_ASSETS.uiTap,
  collect: AUDIO_ASSETS.uiCollect,
  stamp: AUDIO_ASSETS.uiStamp,
  recognize: AUDIO_ASSETS.uiRecognize,
  open: AUDIO_ASSETS.uiOpen,
  back: AUDIO_ASSETS.uiBack,
};

/** 背景乐默认床：宫廷雅乐 */
const DEFAULT_BGM = AUDIO_ASSETS.bgmPalace;
/** 背景乐压低到不压过人声配音的程度 */
const BGM_VOLUME = 0.22;
/** UI 音效响度（短促，避免刺耳） */
const SFX_VOLUME = 0.55;

class AudioManager {
  private bgm: WechatMiniprogram.InnerAudioContext | null = null;
  private unlocked = false;
  private soundOn = true;

  constructor() {
    try {
      // 缺省视为开；只有显式存过 false 才关
      this.soundOn = wx.getStorageSync(SOUND_KEY) !== false;
    } catch (e) {
      this.soundOn = true;
    }
  }

  isOn(): boolean {
    return this.soundOn;
  }

  /** 切换全局开关并持久化；返回切换后的状态。必须在用户手势里调用。 */
  toggle(): boolean {
    this.soundOn = !this.soundOn;
    try {
      wx.setStorageSync(SOUND_KEY, this.soundOn);
    } catch (e) {
      /* noop */
    }
    if (this.soundOn) {
      this.unlock();
    } else {
      this.stopBgm();
    }
    return this.soundOn;
  }

  /**
   * 必须在用户手势（tap/touch）里调用一次：此后才允许自动播放背景乐。
   * 幂等，重复调用安全；已解锁时只确保背景乐在播。
   */
  unlock() {
    if (!this.soundOn) return;
    if (this.unlocked) {
      this.resumeBgm();
      return;
    }
    this.unlocked = true;
    this.startBgm();
  }

  /** 一次性 UI 音效：不循环、播完即销毁，不阻塞业务。 */
  sfx(name: SfxName) {
    if (!this.soundOn) return;
    const url = SFX_URL[name];
    if (!url) return;
    try {
      const ctx = wx.createInnerAudioContext();
      ctx.src = url;
      ctx.volume = SFX_VOLUME;
      ctx.onEnded(() => this.destroyCtx(ctx));
      ctx.onError(() => this.destroyCtx(ctx));
      ctx.play();
    } catch (e) {
      /* noop */
    }
  }

  private startBgm() {
    if (this.bgm) return;
    try {
      const ctx = wx.createInnerAudioContext();
      ctx.src = DEFAULT_BGM;
      ctx.loop = true;
      ctx.volume = BGM_VOLUME;
      ctx.play();
      this.bgm = ctx;
    } catch (e) {
      /* noop */
    }
  }

  private resumeBgm() {
    if (!this.bgm) {
      this.startBgm();
      return;
    }
    try {
      this.bgm.play();
    } catch (e) {
      /* noop */
    }
  }

  private stopBgm() {
    if (!this.bgm) return;
    try {
      this.bgm.stop();
    } catch (e) {
      /* noop */
    }
    // 保留实例：再次解锁时直接 play，避免反复 create
  }

  private destroyCtx(ctx: WechatMiniprogram.InnerAudioContext) {
    try {
      ctx.destroy();
    } catch (e) {
      /* noop */
    }
  }
}

/** 全局单例 */
export const audio = new AudioManager();
