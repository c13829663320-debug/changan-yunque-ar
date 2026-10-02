import { getAllGoods, isCulturalRelic } from '../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods, GoodsCategory } from '../../data/types/goods';

interface GoodsVM extends Goods {
  categoryLabel: string;
  isRelic: boolean;
  imgError: boolean;
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
    loading: true,
    catalog: [] as Goods[],
  },

  onLoad() {
    // 首屏 loading 反馈：先渲染骨架，再拉取目录
    this.setData({ loading: true });
    try {
      const catalog = getAllGoods() || [];
      this.setData({ catalog });
      this.applyFilter('all');
    } catch (err) {
      this.setData({ loading: false, goods: [] });
      wx.showToast({ title: '商品加载失败', icon: 'none' });
    }
  },

  onShow() {
    // 从详情/购物车返回时，保持列表数据即可，无需重拉
  },

  onFilter(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: 'all' | GoodsCategory }).id;
    this.applyFilter(id);
  },

  applyFilter(cat: 'all' | GoodsCategory) {
    const catalog = this.data.catalog;
    const source = cat === 'all' ? catalog : catalog.filter((g) => g.category === cat);
    const goods: GoodsVM[] = source.map((g) => ({
      ...g,
      categoryLabel: CATEGORY_LABEL[g.category],
      isRelic: isCulturalRelic(g),
      imgError: false,
    }));
    // 延迟一帧以呈现 loading/空状态切换
    setTimeout(() => {
      this.setData({ activeCat: cat, goods, loading: false });
    }, 60);
  },

  resetFilter() {
    this.applyFilter('all');
  },

  onImgError(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    const goods = this.data.goods.map((g) => (g.id === id ? { ...g, imgError: true } : g));
    this.setData({ goods });
  },

  goDetail(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    if (!id) return;
    wx.navigateTo({
      url: `/package-mall/pages/goods-detail/goods-detail?id=${id}`,
    });
  },

  goCart() {
    wx.navigateTo({ url: '/package-mall/pages/cart/cart' });
  },
});
