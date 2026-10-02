import { getSpot } from '../../../data/repositories/spotRepo';
import { getAllGoods } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';
import { Spot } from '../../../data/types/spot';

interface RelatedVM extends Goods {
  categoryLabel: string;
}

Page({
  data: {
    spot: null as Spot | null,
    relatedGoods: [] as RelatedVM[],
    canTour: false,
  },

  onLoad(query) {
    const id = query?.id || 'daminggong';
    const spot = getSpot(id);
    const relatedGoods: RelatedVM[] = getAllGoods()
      .slice(0, 8)
      .map((g) => ({ ...g, categoryLabel: CATEGORY_LABEL[g.category] }));
    const canTour = !!spot && spot.enabled && spot.sceneIds.length > 0;
    this.setData({ spot: spot || null, relatedGoods, canTour });
  },

  startTour() {
    const first = this.data.spot?.sceneIds?.[0] || 'danfengmen';
    wx.navigateTo({
      url: `/package-tour/pages/scene/scene?id=${first}&mode=cloud`,
    });
  },

  goGoods(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({
      url: `/package-mall/pages/goods-detail/goods-detail?id=${id}`,
    });
  },
});
