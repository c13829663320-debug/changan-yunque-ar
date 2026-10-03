import { getSpot } from '../../data/repositories/spotRepo';
import { getFeaturedGoods } from '../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../data/types/goods';
import { getProgressStore } from '../../store/progress';

interface FeaturedGoodsVM extends Goods {
  categoryLabel: string;
}

Page({
  data: {
    greeting:
      '你来了……我是云阙，一只从盛唐醒来的小走龙。随我入宫，一起去看看千宫之宫，还有那些少有人知的旧事，好不好？',
    spot: getSpot('daminggong'),
    featured: [] as FeaturedGoodsVM[],
    scaleCount: 0,
    entered: false,
  },

  onReady() {
    // 首页 hero 入场动效（下一帧触发，保证过渡生效）
    setTimeout(() => this.setData({ entered: true }), 60);
  },

  onShow() {
    const featured: FeaturedGoodsVM[] = getFeaturedGoods(6).map((g) => ({
      ...g,
      categoryLabel: CATEGORY_LABEL[g.category],
    }));
    this.setData({
      featured,
      scaleCount: getProgressStore().scaleCount,
    });
  },

  /** 一键入宫：直达丹凤门剧场（云游模式） */
  onEnterPalace() {
    wx.navigateTo({
      url: '/package-tour/pages/scene/scene?id=danfengmen&mode=cloud',
    });
  },

  /** 云游长安：从巡游地图进入 */
  onCloudTour() {
    wx.switchTab({ url: '/pages/tour/tour' });
  },

  /** 现场巡游：打开 AR 扫描识别页（扫描景点/物品 → 云阙讲解） */
  onSiteTour() {
    wx.navigateTo({
      url: '/package-tour/pages/ar-camera/ar-camera',
    });
  },

  goSpotDetail() {
    wx.navigateTo({
      url: '/package-spot/pages/spot-detail/spot-detail?id=daminggong',
    });
  },

  goGoods(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({
      url: `/package-mall/pages/goods-detail/goods-detail?id=${id}`,
    });
  },

  goMall() {
    wx.switchTab({ url: '/pages/mall/mall' });
  },

  onShareAppMessage() {
    return {
      title: '长安云阙·AR文旅助手｜跟着云阙集齐七片龙鳞，把长安带回家',
      imageUrl: '/assets/brand/share-cover.jpg',
      path: '/pages/home/home',
    };
  },

  onShareTimeline() {
    return {
      title: '长安云阙·AR文旅助手｜大明宫AR巡游集七鳞',
      imageUrl: '/assets/brand/share-cover.jpg',
    };
  },
});
