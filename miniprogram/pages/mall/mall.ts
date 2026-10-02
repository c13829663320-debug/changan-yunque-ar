import { getAllGoods } from '../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods, GoodsCategory } from '../../data/types/goods';

interface GoodsVM extends Goods {
  categoryLabel: string;
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
      { id: 'blindbox', label: CATEGORY_LABEL.blindbox },
      { id: 'city', label: CATEGORY_LABEL.city },
      { id: 'jewelry', label: CATEGORY_LABEL.jewelry },
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
    }));
    this.setData({ activeCat: cat, goods });
  },

  goDetail(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({
      url: `/package-mall/pages/goods-detail/goods-detail?id=${id}`,
    });
  },
});
