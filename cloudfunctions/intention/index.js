const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const PHONE_RE = /^1[3-9]\d{9}$/;

/**
 * 预售 / 意向登记
 * event:
 *   action='create'（默认）: { goodsId?, goodsIds?, name?, phone?, remark? }
 *   action='query':  查询当前用户的全部意向
 */
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const action = event.action || 'create';

  if (action === 'query') {
    try {
      const where = { openid: wxContext.OPENID };
      const countRes = await db.collection('intentions').where(where).count();
      const res = await db
        .collection('intentions')
        .where(where)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      return { success: true, list: res.data, total: countRes.total };
    } catch (err) {
      return { success: false, message: (err && err.message) || '查询失败' };
    }
  }

  // create
  let { goodsIds, goodsId, name, phone, remark } = event;
  if (goodsId && !goodsIds) goodsIds = [goodsId];
  if (!Array.isArray(goodsIds) || goodsIds.length === 0) {
    return { success: false, message: '缺少商品信息' };
  }
  if (phone && !PHONE_RE.test(phone)) {
    return { success: false, message: '手机号格式不正确' };
  }

  const records = goodsIds.map((gid) => ({
    goodsId: gid,
    name: name || '',
    phone: phone || '',
    remark: remark || '',
    openid: wxContext.OPENID,
    createdAt: db.serverDate(),
    notified: false,
  }));

  try {
    const ids = [];
    for (const rec of records) {
      const r = await db.collection('intentions').add({ data: rec });
      ids.push(r._id);
    }
    return { success: true, ids, count: ids.length };
  } catch (err) {
    return { success: false, message: (err && err.message) || '登记失败' };
  }
};
