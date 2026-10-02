import { getScene } from '../../../data/repositories/sceneRepo';

Page({
  data: {
    sceneName: '',
    detected: false,
    vkStatus: '',
  },

  onLoad(query) {
    const id = query?.id || 'danfengmen';
    const scene = getScene(id);
    const hasVK = typeof wx.createVKSession === 'function';
    this.setData({
      sceneName: scene?.name || '点位',
      vkStatus: hasVK
        ? 'VisionKit 可用：M2 将接入 marker 识别并渲染 glb 复原'
        : '当前环境不支持 VisionKit，已使用方位叠加兜底',
    });
  },

  onCamError() {
    wx.showToast({ title: '相机开启失败，请检查权限', icon: 'none' });
  },

  /**
   * 真机路径（M2）：
   * const session = wx.createVKSession({ track: { marker: true }, version: 'v2' });
   * session.addMarker(markerImage); session.on('updateAnchors', 渲染 glb 殿宇);
   * M0：演示识别成功后的叠加效果
   */
  onDetect() {
    this.setData({ detected: !this.data.detected });
    if (!this.data.detected) {
      wx.showToast({ title: '已识别，殿宇已叠加', icon: 'none' });
    }
  },
});
