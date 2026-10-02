const cloud = require('wx-server-sdk');
const { validateCreate } = require('./validator');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 预售 / 意向登记云函数
 *
 * event:
 *   action='create'（默认）:
 *     { items:[{id,qty}?] | goodsIds? | goodsId?, name, phone, remark? }
 *   action='query': 查询当前 openid 的意向单（按时间倒序，最多 50 条）
 *
 * create 返回：
 *   成功 { success:true, id, ids:[id], count }   count=商品总件数(goodsCount)
 *   校验失败 { success:false, code, message }
 *   异常   { success:false, code:'DB_ERROR', message }
 */
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const action = event.action || 'create';

  // ---- query：查看历史意向单 ----
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

  // ---- create：登记意向 ----
  const v = validateCreate(event);
  if (!v.ok) {
    return { success: false, code: v.code, message: v.message };
  }

  const { items, name, phone, remark } = v;
  const goodsIds = items.map((i) => i.id);
  const goodsCount = items.reduce((s, i) => s + i.qty, 0);

  try {
    // 聚合为【1 条】文档
    const r = await db.collection('intentions').add({
      data: {
        items,
        goodsIds,
        goodsCount,
        name: name.trim(),
        phone,
        remark,
        openid: wxContext.OPENID,
        createdAt: db.serverDate(),
        notified: false,
      },
    });
    return { success: true, id: r._id, ids: [r._id], count: goodsCount };
  } catch (err) {
    return { success: false, code: 'DB_ERROR', message: (err && err.message) || '登记失败' };
  }
};
