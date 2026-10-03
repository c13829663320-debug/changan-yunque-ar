/**
 * 祈愿分享卡（终章专属 · 多景点数据驱动）
 * Canvas 2D 绘制：盛唐鎏金/玉石电影感版式。
 * 官方云阙少女龛式主像 / 赤金走龙鎏金钤印、小龙鳞意象（已集鎏金·末片朱砂）、
 * 卷轴碑帖愿文、鎏金匾额标题与朱砂落款小印。
 * 景点（鳞序列/数量/景点名）由 spotId 动态决定，不写死大明宫。
 * 支持 canvasToTempFilePath 保存相册；分享由页面 onShareAppMessage 接管。
 */
import { getScenesBySpot } from '../../../data/repositories/sceneRepo';
import { getSpot } from '../../../data/repositories/spotRepo';

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
    /** 当前景点 id：决定鳞序列/数量与景点名（大明宫=7鳞，大雁塔=5鳞） */
    spotId: { type: String, value: 'daminggong' },
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
    // 景点变化时（复用同一实例）若卡已展开则重绘
    spotId() {
      if (this.data.visible) setTimeout(() => this.draw(), 60);
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

        // ===== 当前景点数据驱动（不写死大明宫） =====
        const spotId = this.data.spotId || 'daminggong';
        const spotScenes = getScenesBySpot(spotId);
        const scaleTotal = spotScenes.length || 1;
        const spotName = getSpot(spotId)?.name || '长安';
        const scaleLabel = spotScenes
          .map((x) => x.scaleName.replace(/鳞$/, ''))
          .join(' · ');

        // ---------- 底 ----------
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = COLOR.ivory;
        ctx.fillRect(0, 0, W, H);

        // 极淡云纹团花暗纹底（Canvas 路径低透明度，不用图片）
        this._drawCloudPattern(ctx);

        // ---------- 双层鎏金描边 ----------
        // 外层粗鎏金
        ctx.strokeStyle = COLOR.gold;
        ctx.lineWidth = 2;
        this._roundRect(ctx, 9, 9, W - 18, H - 18, 4);
        ctx.stroke();
        // 内层细鎏金
        ctx.strokeStyle = COLOR.goldSoft;
        ctx.lineWidth = 0.8;
        this._roundRect(ctx, 14, 14, W - 28, H - 28, 3);
        ctx.stroke();
        // 四角宝相花/菱形角饰
        this._drawCorner(ctx, 14, 14, false, false);
        this._drawCorner(ctx, W - 14, 14, true, false);
        this._drawCorner(ctx, 14, H - 14, false, true);
        this._drawCorner(ctx, W - 14, H - 14, true, true);

        // ---------- 顶部鎏金匾额标题 ----------
        // 匾额底（淡金渐变牌）
        const plaqueX = W / 2 - 56;
        const plaqueY = 20;
        const plaqueW = 112;
        const plaqueH = 26;
        const pg = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueH);
        pg.addColorStop(0, 'rgba(194,166,104,0.30)');
        pg.addColorStop(1, 'rgba(168,137,58,0.10)');
        ctx.fillStyle = pg;
        this._roundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 6);
        ctx.fill();
        ctx.strokeStyle = COLOR.gold;
        ctx.lineWidth = 1;
        this._roundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 6);
        ctx.stroke();
        ctx.fillStyle = COLOR.ink;
        ctx.font = '600 19px "Songti SC", "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('长安云阙', W / 2, plaqueY + plaqueH / 2 + 1);

        // 分隔线（中央宝相花菱形）
        ctx.strokeStyle = COLOR.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(34, 56);
        ctx.lineTo(W / 2 - 10, 56);
        ctx.moveTo(W / 2 + 10, 56);
        ctx.lineTo(W - 34, 56);
        ctx.stroke();
        this._diamond(ctx, W / 2, 56, 3.4, COLOR.gold);

        // 动态副标题：{景点名} · 投龙祈愿
        ctx.fillStyle = COLOR.gold;
        ctx.font = '9px "Songti SC", serif';
        ctx.fillText(`${spotName} · 投龙祈愿`, W / 2, 68);

        // ---------- 少女云阙立绘：龛式鎏金画框主像（居中偏上） ----------
        const niche = { x: 86, y: 80, w: 128, h: 148 };
        // 龛外鎏金框
        ctx.strokeStyle = COLOR.gold;
        ctx.lineWidth = 2;
        this._roundRect(ctx, niche.x, niche.y, niche.w, niche.h, 10);
        ctx.stroke();
        ctx.strokeStyle = COLOR.goldSoft;
        ctx.lineWidth = 0.8;
        this._roundRect(ctx, niche.x + 4, niche.y + 4, niche.w - 8, niche.h - 8, 7);
        ctx.stroke();
        try {
          const yunque = await this._loadImage('/assets/characters/yunque-girl.jpg');
          this._drawRoundImage(ctx, yunque, niche.x + 5, niche.y + 5, niche.w - 10, niche.h - 10, 6);
        } catch (e) {
          // 兜底：与新框一致的鎏金龛（淡云纹，非纯色块）
          this._drawNicheFallback(ctx, niche.x + 5, niche.y + 5, niche.w - 10, niche.h - 10, 6);
        }

        // ---------- 赤金走龙：右下鎏金钤印/小圆章 ----------
        const sealC = { x: niche.x + niche.w + 6, y: niche.y + niche.h - 6 };
        const sealR = 22;
        ctx.beginPath();
        ctx.arc(sealC.x, sealC.y, sealR, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.card;
        ctx.fill();
        ctx.strokeStyle = COLOR.gold;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sealC.x, sealC.y, sealR - 4, 0, Math.PI * 2);
        ctx.strokeStyle = COLOR.goldSoft;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        try {
          const long = await this._loadImage('/assets/characters/yunque-dragon.jpg');
          ctx.save();
          ctx.beginPath();
          ctx.arc(sealC.x, sealC.y, sealR - 5, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(long, sealC.x - sealR + 5, sealC.y - sealR + 5, sealR * 2 - 10, sealR * 2 - 10);
          ctx.restore();
        } catch (e) {
          // 兜底：龛内淡龙/云纹
          this._drawCloudMotif(ctx, sealC.x, sealC.y, sealR - 7, 'rgba(168,137,58,0.35)');
        }

        // ---------- 龙鳞意象（按当前景点动态，鳞名/数量/点位全随 spotId） ----------
        ctx.fillStyle = COLOR.gold;
        ctx.font = '9.5px "Songti SC", serif';
        ctx.fillText(scaleLabel, W / 2, 248);
        // 小龙鳞形（水滴/鳞片状），已集=鎏金、最后一片=朱砂
        const scaleCY = 262;
        const gap = 15;
        const startX = W / 2 - ((scaleTotal - 1) * gap) / 2;
        for (let i = 0; i < scaleTotal; i++) {
          const cx = startX + i * gap;
          this._drawScale(ctx, cx, scaleCY, 4, i === scaleTotal - 1 ? COLOR.cinnabar : COLOR.gold);
        }

        // ---------- 愿文区：卷轴/碑帖质感 ----------
        const boxY = 280;
        const boxH = 94;
        ctx.fillStyle = COLOR.card;
        this._roundRect(ctx, 26, boxY, W - 52, boxH, 8);
        ctx.fill();
        ctx.strokeStyle = COLOR.gold;
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, 26, boxY, W - 52, boxH, 8);
        ctx.stroke();
        ctx.strokeStyle = COLOR.goldSoft;
        ctx.lineWidth = 0.6;
        this._roundRect(ctx, 30, boxY + 4, W - 60, boxH - 8, 6);
        ctx.stroke();
        // 「我所许之愿」题签
        ctx.fillStyle = COLOR.muted;
        ctx.font = '9px "Songti SC", serif';
        ctx.fillText('— 我所许之愿 —', W / 2, boxY + 18);
        // 朱砂愿文（舒适行距，自动换行不溢出）
        ctx.fillStyle = COLOR.cinnabar;
        ctx.font = '600 13px "Songti SC", "Noto Serif SC", serif';
        this._wrapText(ctx, this.data.wish || '愿此刻长安，久一点。', W / 2, boxY + 40, W - 92, 18);

        // ---------- 底部落款 + 朱砂小方印 ----------
        ctx.fillStyle = COLOR.gold;
        ctx.font = '10px "Songti SC", serif';
        const sigText = `云阙 · ${this.data.scaleName}已集齐`;
        ctx.fillText(sigText, W / 2 - 8, 396);
        // 朱砂方印（云阙意象：云纹小走龙），紧贴落款右侧
        const sigW = ctx.measureText(sigText).width;
        this._drawSeal(ctx, W / 2 - 8 + sigW / 2 + 7, 396);
        ctx.fillStyle = COLOR.muted;
        ctx.font = '8px "Songti SC", serif';
        ctx.fillText('文物灵感 / AIGC 再现', W / 2, 416);

        ctx.textBaseline = 'alphabetic';

        // 导出临时文件（2x dpr 清晰）
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

    // 菱形宝相花角饰（x,y 为框角点；fx/fy 控制朝向）
    _drawCorner(ctx: any, x: number, y: number, fx: boolean, fy: boolean) {
      const s = 5;
      const dx = fx ? -s : s;
      const dy = fy ? -s : s;
      this._diamond(ctx, x + dx, y + dy, s, COLOR.gold);
      this._diamond(ctx, x + dx * 1.9, y + dy * 1.9, 2, COLOR.goldSoft);
    },

    _diamond(ctx: any, cx: number, cy: number, r: number, color: string) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },

    // 小鳞形（水滴/鳞片：尖端朝下）
    _drawScale(ctx: any, cx: number, cy: number, s: number, color: string) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + s);
      ctx.quadraticCurveTo(cx + s, cy - s * 0.2, cx, cy - s);
      ctx.quadraticCurveTo(cx - s, cy - s * 0.2, cx, cy + s);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },

    // 云纹团花暗纹（低透明度散布）
    _drawCloudPattern(ctx: any) {
      const spots: Array<[number, number, number]> = [
        [40, 120, 10],
        [262, 150, 12],
        [52, 360, 11],
        [250, 330, 9],
        [150, 430, 12],
      ];
      ctx.save();
      for (const [x, y, r] of spots) {
        this._drawCloudMotif(ctx, x, y, r, 'rgba(168,137,58,0.06)');
      }
      ctx.restore();
    },

    // 单朵云纹（三圆相叠）
    _drawCloudMotif(ctx: any, x: number, y: number, r: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x - r * 0.5, y, r * 0.5, 0, Math.PI * 2);
      ctx.arc(x, y - r * 0.3, r * 0.6, 0, Math.PI * 2);
      ctx.arc(x + r * 0.5, y, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 龛内图片失败兜底：淡云纹龛（非纯色块）
    _drawNicheFallback(ctx: any, x: number, y: number, w: number, h: number, r: number) {
      ctx.save();
      this._roundRect(ctx, x, y, w, h, r);
      ctx.clip();
      ctx.fillStyle = COLOR.card;
      ctx.fillRect(x, y, w, h);
      this._drawCloudMotif(ctx, x + w / 2, y + h / 2, 22, 'rgba(168,137,58,0.18)');
      this._drawCloudMotif(ctx, x + w / 2 - 26, y + h / 2 + 18, 12, 'rgba(168,137,58,0.14)');
      this._drawCloudMotif(ctx, x + w / 2 + 26, y + h / 2 + 18, 12, 'rgba(168,137,58,0.14)');
      ctx.restore();
    },

    // 朱砂小方印（云阙意象：云纹）
    _drawSeal(ctx: any, cx: number, cy: number) {
      const s = 13;
      ctx.save();
      ctx.fillStyle = COLOR.cinnabar;
      this._roundRect(ctx, cx - s / 2, cy - s / 2, s, s, 2);
      ctx.fill();
      // 内刻象牙小云纹
      ctx.fillStyle = COLOR.ivory;
      ctx.beginPath();
      ctx.arc(cx - 2, cy + 1, 2.2, 0, Math.PI * 2);
      ctx.arc(cx + 2.5, cy - 1, 2.6, 0, Math.PI * 2);
      ctx.fill();
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
