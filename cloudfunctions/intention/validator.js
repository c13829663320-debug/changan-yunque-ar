/**
 * intention 云函数入参校验（纯函数，不依赖 wx-server-sdk，便于本地单测）
 *
 * IntentionItem = { id: string, qty: number(正整数) }
 */

const PHONE_RE = /^1[3-9]\d{9}$/;

/** 把任意 qty 归一为正整数；非法（NaN / <=0 / 非整数）兜底 1 */
function toQty(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/**
 * 归一意向商品列表：
 *  - 优先 event.items（数组，每项形如 {id, qty?}）
 *  - 否则用 event.goodsIds（数组）或 event.goodsId（单值）生成 {id, qty:1}
 *  - 过滤空 id；qty 非法兜底 1
 * @param {object} event
 * @returns {{id:string, qty:number}[]}
 */
function normalizeItems(event) {
  const ev = event || {};
  const result = [];

  if (Array.isArray(ev.items)) {
    for (const it of ev.items) {
      if (it && it.id) {
        result.push({ id: it.id, qty: toQty(it.qty) });
      }
    }
  } else {
    let ids = [];
    if (Array.isArray(ev.goodsIds)) ids = ev.goodsIds;
    else if (ev.goodsId) ids = [ev.goodsId];
    for (const id of ids) {
      if (id) result.push({ id, qty: 1 });
    }
  }

  return result;
}

/**
 * 校验 create 入参，依次返回：
 *  成功 { ok:true, items, name, phone, remark }
 *  失败 { ok:false, code, message }
 * @param {object} event
 */
function validateCreate(event) {
  const ev = event || {};

  // a. 商品
  const items = normalizeItems(ev);
  if (items.length === 0) {
    return { ok: false, code: 'MISSING_GOODS', message: '请至少选择一件意向商品' };
  }

  // b. 联系人称呼
  const name = typeof ev.name === 'string' ? ev.name : '';
  if (!name || !name.trim()) {
    return { ok: false, code: 'MISSING_NAME', message: '请填写联系人称呼' };
  }

  // c. 手机号
  const phone = typeof ev.phone === 'string' ? ev.phone : '';
  if (!phone) {
    return { ok: false, code: 'MISSING_PHONE', message: '请填写手机号' };
  }
  if (!PHONE_RE.test(phone)) {
    return { ok: false, code: 'INVALID_PHONE', message: '手机号格式不正确，请输入11位有效手机号' };
  }

  // d. 备注兜底
  const remark = typeof ev.remark === 'string' ? ev.remark : '';

  return { ok: true, items, name, phone, remark };
}

module.exports = { normalizeItems, validateCreate, PHONE_RE };
