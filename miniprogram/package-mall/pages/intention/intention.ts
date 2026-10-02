import {
  getPendingItems,
  clearPending,
  submitIntention,
  listIntentions,
  clearIntentions,
  getDataMode,
  isCloudAvailable,
  getGoods,
} from '../../../data/repositories/goodsRepo';

/** 待提交行：由 pending 商品 + 本地目录解析出 name/cover/price */
interface PendingRow {
  id: string;
  name: string;
  cover: string;
  price: number;
  qty: number;
  subtotal: number;
}

/** 历史意向单展示行 */
interface HistoryRow {
  key: string;
  itemLines: string[];
  goodsCount: number;
  name: string;
  phoneMasked: string;
  timeText: string;
  sourceLabel: string;
  statusText: string;
}

/** 与云函数一致的手机号规则 */
const PHONE_RE = /^1[3-9]\d{9}$/;

function maskPhone(p: unknown): string {
  const s = String(p || '');
  if (s.length === 11) return s.slice(0, 3) + '****' + s.slice(7);
  return s;
}

function formatTime(t: unknown): string {
  let d: Date | null = null;
  if (t instanceof Date) d = t;
  else if (typeof t === 'number') d = new Date(t);
  else if (typeof t === 'string') d = new Date(t);
  else if (t && typeof t === 'object') d = new Date(t as unknown as Date);
  if (!d || isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function toast(title: string) {
  wx.showToast({ title, icon: 'none' });
}

Page({
  data: {
    // form | history | empty
    mode: 'form' as 'form' | 'history' | 'empty',
    pendingRows: [] as PendingRow[],
    pendingTotal: 0,
    name: '',
    phone: '',
    remark: '',
    submitting: false,
    history: [] as HistoryRow[],
    isCloud: false,
  },

  async onShow() {
    await this.loadPending();
  },

  /** 待提交态：解析 pending 商品 */
  async loadPending() {
    const pending = (await getPendingItems()) || [];
    const rows: PendingRow[] = [];
    for (const p of pending) {
      const g = getGoods(p.id);
      if (!g) continue; // 缺失商品过滤
      const qty = Number.isInteger(p.qty) && p.qty > 0 ? p.qty : 1;
      rows.push({
        id: g.id,
        name: g.name,
        cover: g.cover || '',
        price: g.price,
        qty,
        subtotal: g.price * qty,
      });
    }
    if (rows.length) {
      const pendingTotal = rows.reduce((s, r) => s + r.subtotal, 0);
      this.setData({ mode: 'form', pendingRows: rows, pendingTotal });
      return;
    }
    // 无待提交 -> 历史查看态
    await this.refreshHistory();
  },

  /** 历史意向单 */
  async refreshHistory() {
    const dataMode = await getDataMode();
    const cloudFlag = dataMode === 'cloud' || (await isCloudAvailable());
    const listResult = await listIntentions();
    const records = (listResult && listResult.list) || [];
    const history: HistoryRow[] = records.map((rec: any, idx: number) => {
      const items: { id: string; qty: number }[] =
        Array.isArray(rec.items) && rec.items.length
          ? rec.items
          : (rec.goodsIds || []).map((id: string) => ({ id, qty: 1 }));
      const itemLines = items.map((it) => {
        const g = getGoods(it.id);
        const nm = g ? g.name : it.id || '商品';
        const q = Number.isInteger(it.qty) && it.qty > 0 ? it.qty : 1;
        return `${nm} × ${q}`;
      });
      const goodsCount =
        rec.goodsCount || items.reduce((s, it) => s + (Number.isInteger(it.qty) ? it.qty : 1), 0);
      const sourceLabel =
        rec.source === 'local' ? '本地' : rec.source === 'cloud' ? '云端' : cloudFlag ? '云端' : '本地';
      return {
        key: rec._id || rec.id || String(idx),
        itemLines,
        goodsCount,
        name: rec.name || '',
        phoneMasked: maskPhone(rec.phone),
        timeText: formatTime(rec.createdAt),
        sourceLabel,
        statusText: '待通知',
      };
    });
    this.setData({
      isCloud: !!cloudFlag,
      history,
      mode: history.length ? 'history' : 'empty',
    });
  },

  onName(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value });
  },
  onPhone(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value });
  },
  onRemark(e: WechatMiniprogram.Input) {
    this.setData({ remark: e.detail.value });
  },

  async submit() {
    if (this.data.submitting) return;
    if (!this.data.pendingRows.length) {
      toast('没有意向商品');
      return;
    }
    const name = this.data.name;
    const phone = this.data.phone;
    if (!name || !name.trim()) {
      toast('请填写联系人称呼');
      return;
    }
    if (!phone) {
      toast('请填写手机号');
      return;
    }
    if (!PHONE_RE.test(phone)) {
      toast('手机号格式不正确，请输入11位有效手机号');
      return;
    }

    this.setData({ submitting: true });
    try {
      const r: any = await submitIntention({
        name: name.trim(),
        phone,
        remark: this.data.remark,
      });
      if (r && r.success) {
        await clearPending();
        this.setData({ name: '', phone: '', remark: '', submitting: false });
        // 云端回退时 message 会带「云端不可用」等提示，优先展示；否则按来源给默认文案
        wx.showToast({
          title: r.message || (r.source === 'cloud' ? '意向已提交' : '已本地登记'),
          icon: 'none',
        });
        await this.refreshHistory();
      } else {
        this.setData({ submitting: false });
        toast((r && r.message) || '提交失败，请稍后重试');
      }
    } catch (e) {
      this.setData({ submitting: false });
      toast('提交失败，请稍后重试');
    }
  },

  clear() {
    wx.showModal({
      title: '清空意向单',
      content: this.data.isCloud
        ? '将清空本机展示的意向记录；云端后台记录由运营保留。确定清空吗？'
        : '确定清空本机全部意向登记吗？',
      success: async (res) => {
        if (res.confirm) {
          await clearIntentions();
          toast('已清空');
          await this.refreshHistory();
        }
      },
    });
  },

  goMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  },
});
