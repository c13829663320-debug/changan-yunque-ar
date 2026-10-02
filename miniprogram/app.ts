import config from './config/index';
import { getProgressStore } from './store/progress';

interface IGlobalData {
  cloudReady: boolean;
  currentSpotId: string;
  version: string;
}

App<{ globalData: IGlobalData }>({
  globalData: {
    cloudReady: false,
    currentSpotId: 'daminggong',
    version: config.version,
  },

  onLaunch() {
    // 初始化云开发（未配置环境ID时静默跳过，Demo 可离线运行）
    if (wx.cloud && config.cloudEnvId) {
      try {
        wx.cloud.init({ env: config.cloudEnvId, traceUser: true });
        this.globalData.cloudReady = true;
      } catch (err) {
        console.warn('[cloud] init skipped:', err);
      }
    }

    // 恢复本地巡游进度（龙鳞 / 集章 / 已完成点位）
    getProgressStore().restore();
  },
});
