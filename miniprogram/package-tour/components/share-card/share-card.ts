/**
 * 祈愿分享卡（终章专属）
 * Canvas 2D 绘制：官方云阙 / 赤金走龙、七鳞意象、用户所许之愿、
 * 「长安云阙」标识与「文物灵感 / AIGC 再现」小字。
 * 支持 canvasToTempFilePath 保存相册；分享给好友由页面 onShareAppMessage 接管。
 */
const W = 300;
const H = 450;

const COLOR = {
  ivory: '#f4ecdd',
  card: '#fbf6ec',
  ink: '#463e36',
  inkSoft: '#6a5f52',
  muted: '#93867a',
  gold: '#a8893a',
  goldSoft: '#c2a668',
  cinnabar: '#9e4a2a',
  line: '#e0d4bf',
};

Component({
  properties: {
    visible: { type: Boolean, value: false },
    /** 用户在终章选择的祈愿取向原文 */
    wish: { type: String, value: '愿此刻长安，久一点。' },
    /** 已集齐的龙鳞数 */
    scaleCount: { type: Number, value: 7 },
    scaleName: { type: String, value: '归愿鳞' },
  },

  data: {
    drawing: true,
    tempFilePath: '',
  },

  lifetimes: {
    attached() {
      (this as any)._dpr = (wx.getSystemInfoSync().pixelRatio || 2);
      (this as any)._canvas = null as any;
      (this as any)._ctx = null as any;
      (this as any)._ready = false;
    },
  },

  observers: {
    visible(v: boolean) {
      if (v) {
        // 等节点插入后绘制
        setTimeout(() => this.draw(), 60);
      }
    },
  },

  methods: {
    noop() {},
    onMask() {},
    onClose() {
      this.triggerEvent('close');
    },

    _setupCanvas() {
      return new Promise<void>((resolve, reject) => {
        if ((this as any)._ready) return resolve();
        wx.createSelectorQuery()
          .in(this)
          .select('#shareCanvas')
          .fields({ node: true, size: true } as any)
          .exec((res) => {
            const info = res && res[0];
            if (!info || !info.node) return reject(new Error('canvas node not found'));
            const canvas = info.node;
            const dpr = (this as any)._dpr;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            (this as any)._canvas = canvas;
            (this as any)._ctx = ctx;
            (this as any)._ready = true;
            resolve();
          });
      });
    },

    _loadImage(src: string) {
      return new Promise<any>((resolve, reject) => {
        const img = (this as any)._canvas.createImage();
        img.onload = () => resolve(img);
        img.onerror = (e: any) => reject(e || new Error('img load fail'));
        img.src = src;
      });
    },

    async draw() {
      this.setData({ drawing: true, tempFilePath: '' });
      try {
        await this._setupCanvas();
        const ctx = (this as any)._ctx;
        const dpr = (this as any)._dpr;

        // 底
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = COLOR.ivory;
        ctx.fillRect(0, 0, W, H);

        // 边框
        ctx.strokeStyle = COLOR.goldSoft;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10, 10, W - 20, H - 20);

        // 顶部标识
        ctx.fillStyle = COLOR.ink;
        ctx.font = '600 22px "Songti SC", "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.fillText('长安云阙', W / 2, 42);
        ctx.fillStyle = COLOR.gold;
        ctx.font = '10px "Songti SC", serif';
        ctx.fillText('大明宫 · 投龙祈愿', W / 2, 60);

        // 分隔线
        ctx.strokeStyle = COLOR.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(28, 72);
        ctx.lineTo(W - 28, 72);
        ctx.stroke();

        // 云阙立绘（左）
        try {
          const yunque = await this._loadImage('/assets/characters/yunque-girl.jpg');
          this._drawRoundImage(ctx, yunque, 26, 84, 92, 148, 8);
        } catch (e) {
          ctx.fillStyle = COLOR.goldSoft;
          ctx.fillRect(26, 84, 92, 148);
        }

        // 走龙（右）
        try {
          const long = await this._loadImage('/package-tour/assets/scenes/xuanwumen/zou-long.jpg');
          this._drawRoundImage(ctx, long, 178, 92, 96, 96, 10);
        } catch (e) {
          ctx.fillStyle = COLOR.goldSoft;
          ctx.fillRect(178, 92, 96, 96);
        }

        // 七鳞意象
        ctx.fillStyle = COLOR.gold;
        ctx.font = '10px "Songti SC", serif';
        ctx.fillText('启程 · 朝会 · 廊下 · 召对 · 池苑 · 盛宴 · 归愿', W / 2, 252);
        // 七枚小金点
        for (let i = 0; i < 7; i++) {
          const cx = W / 2 - 54 + i * 18;
          ctx.beginPath();
          ctx.arc(cx, 266, 3, 0, Math.PI * 2);
          ctx.fillStyle = i === 6 ? COLOR.cinnabar : COLOR.gold;
          ctx.fill();
        }

        // 愿文卡
        const boxY = 286;
        ctx.fillStyle = COLOR.card;
        ctx.strokeStyle = COLOR.line;
        this._roundRect(ctx, 26, boxY, W - 52, 92, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = COLOR.muted;
        ctx.font = '9px "Songti SC", serif';
        ctx.fillText('— 我所许之愿 —', W / 2, boxY + 20);
        ctx.fillStyle = COLOR.cinnabar;
        ctx.font = '600 13px "Songti SC", "Noto Serif SC", serif';
        this._wrapText(ctx, this.data.wish || '愿此刻长安，久一点。', W / 2, boxY + 40, W - 90, 18);

        // 底部落款
        ctx.fillStyle = COLOR.gold;
        ctx.font = '10px "Songti SC", serif';
        ctx.fillText(`云阙 · ${this.data.scaleName}已集齐`, W / 2, 408);
        ctx.fillStyle = COLOR.muted;
        ctx.font = '8px "Songti SC", serif';
        ctx.fillText('文物灵感 / AIGC 再现', W / 2, 428);

        // 导出临时文件
        wx.canvasToTempFilePath({
          canvas: (this as any)._canvas,
          destWidth: W * dpr * 2,
          destHeight: H * dpr * 2,
          success: (r) => {
            this.setData({ drawing: false, tempFilePath: r.tempFilePath });
            this.triggerEvent('ready', { tempFilePath: r.tempFilePath });
          },
          fail: () => this.setData({ drawing: false }),
        });
      } catch (e) {
        this.setData({ drawing: false });
      }
    },

    _roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },

    _drawRoundImage(ctx: any, img: any, x: number, y: number, w: number, h: number, r: number) {
      ctx.save();
      this._roundRect(ctx, x, y, w, h, r);
      ctx.clip();
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    },

    _wrapText(ctx: any, text: string, cx: number, y: number, maxW: number, lh: number) {
      const chars = (text || '').split('');
      let line = '';
      let yy = y;
      for (const ch of chars) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, cx, yy);
          line = ch;
          yy += lh;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, cx, yy);
    },

    onSave() {
      const path = this.data.tempFilePath;
      if (!path) {
        wx.showToast({ title: '卡片还在绘制', icon: 'none' });
        return;
      }
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: (err) => {
          if (String(err.errMsg || '').indexOf('auth') >= 0 || String(err.errMsg || '').indexOf('deny') >= 0) {
            wx.showModal({
              title: '需要相册权限',
              content: '请在设置中允许保存到相册',
              confirmText: '去设置',
              success: (r) => r.confirm && wx.openSetting(),
            });
          } else {
            wx.showToast({ title: '保存取消', icon: 'none' });
          }
        },
      });
    },
  },
});
