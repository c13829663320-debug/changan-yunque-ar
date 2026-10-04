import { getProfileStore } from '../../../store/profile';

interface FormState {
  avatar: string;
  nickname: string;
  signature: string;
}

Page({
  data: {
    form: { avatar: '', nickname: '', signature: '' } as FormState,
    nicknameLen: 0,
  },

  /** chooseAvatar 返回的临时头像路径，保存时再持久化为本地用户文件 */
  pendingAvatar: '' as string,

  onLoad() {
    const p = getProfileStore().snapshot;
    this.setData({
      form: { avatar: p.avatar, nickname: p.nickname, signature: p.signature },
      nicknameLen: p.nickname.length,
    });
  },

  /** 更换头像：官方头像昵称填写能力，可选微信头像 / 相册 / 拍照，先即时预览 */
  onChooseAvatar(e: WechatMiniprogram.CustomEvent<{ avatarUrl: string }>) {
    const url = e.detail.avatarUrl;
    if (!url) return;
    this.pendingAvatar = url;
    this.setData({ 'form.avatar': url });
  },

  onNicknameInput(e: WechatMiniprogram.Input) {
    const v = e.detail.value;
    this.setData({ 'form.nickname': v, nicknameLen: v.length });
  },

  onSignatureInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.signature': e.detail.value });
  },

  onSave() {
    const { nickname, signature } = this.data.form;
    const name = (nickname || '').trim();
    if (!name) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    if (name.length > 12) {
      wx.showToast({ title: '昵称最多12个字', icon: 'none' });
      return;
    }

    const doSave = (avatar?: string) => {
      getProfileStore().update({
        nickname: name,
        signature: (signature || '').trim(),
        ...(avatar ? { avatar } : {}),
      });
      wx.showToast({ title: '已保存', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 500);
    };

    if (this.pendingAvatar) {
      // 临时头像落为持久本地文件，避免重启后路径失效
      wx.getFileSystemManager().saveFile({
        tempFilePath: this.pendingAvatar,
        success: (res) => doSave(res.savedFilePath),
        fail: () => doSave(this.pendingAvatar),
      });
    } else {
      doSave();
    }
  },
});
