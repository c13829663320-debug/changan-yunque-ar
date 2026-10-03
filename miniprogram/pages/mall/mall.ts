import { getAllGoods } from '../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods, GoodsCategory } from '../../data/types/goods';

interface GoodsVM extends Goods {
  categoryLabel: string;
  /** 封面图是否已加载完成（微光淡入用，纯展示态） */
  imgLoaded?: boolean;
  /** 封面加载失败：切回既有分类标签兜底 */
  coverErr?: boolean;
}

interface CatFilter {
  id: 'all' | GoodsCategory;
  label: string;
}

Page({
  data: {
    categories: [
      { id: 'all', label: '全部' },
      { id: 'collection', label: CATEGORY_LABEL.collection },
      { id: 'figure', label: CATEGORY_LABEL.figure },
      { id: 'blindbox', label: CATEGORY_LABEL.blindbox },
      { id: 'plush', label: CATEGORY_LABEL.plush },
      { id: 'jewelry', label: CATEGORY_LABEL.jewelry },
      { id: 'accessory', label: CATEGORY_LABEL.accessory },
      { id: 'lifestyle', label: CATEGORY_LABEL.lifestyle },
      { id: 'city', label: CATEGORY_LABEL.city },
      { id: 'digital', label: CATEGORY_LABEL.digital },
      { id: 'experience', label: CATEGORY_LABEL.experience },
    ] as CatFilter[],
    activeCat: 'all' as 'all' | GoodsCategory,
    goods: [] as GoodsVM[],
  },

  onLoad() {
    this.applyFilter('all');
  },

  onFilter(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: 'all' | GoodsCategory }).id;
    this.applyFilter(id);
  },

  applyFilter(cat: 'all' | GoodsCategory) {
    const source = cat === 'all' ? getAllGoods() : getAllGoods().filter((g) => g.category === cat);
    const goods: GoodsVM[] = source.map((g) => ({
      ...g,
      categoryLabel: CATEGORY_LABEL[g.category],
      imgLoaded: false,
      coverErr: false,
    }));
    this.setData({ activeCat: cat, goods });
  },

  /** 封面加载完成：淡入图片，微光底被不透明图片自然覆盖 */
  onCoverLoad(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const idx = this.data.goods.findIndex((g) => g.id === id);
    if (idx < 0) return;
    this.setData({ [`goods.${idx}.imgLoaded`]: true });
  },

  /** 封面失败：隐藏坏图，复用既有「分类标签」兜底 */
  onCoverError(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const idx = this.data.goods.findIndex((g) => g.id === id);
    if (idx < 0) return;
    this.setData({ [`goods.${idx}.coverErr`]: true });
  },

  goDetail(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({
      url: `/package-mall/pages/goods-detail/goods-detail?id=${id}`,
    });
  },

  onShareAppMessage() {
    return {
      title: '云阙商城｜把长安带回家，文创好物预售登记中',
      imageUrl: '/assets/brand/share-cover.jpg',
      path: '/pages/mall/mall',
    };
  },
});
