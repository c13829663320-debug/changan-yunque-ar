const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 预售/意向登记
 * event: { goodsId: string, contact?: string }
 */
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { goodsId, contact } = event;

  if (!goodsId) {
    return { success: false, message: '缺少商品ID' };
  }

  const result = await db.collection('intentions').add({
    data: {
      goodsId,
      contact: contact || '',
      openid: wxContext.OPENID,
      createdAt: db.serverDate(),
      notified: false,
    },
  });

  return { success: true, _id: result._id };
};
