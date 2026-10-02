import catalog from '../goods/catalog';
import { Goods, GoodsCategory } from '../types/goods';

/** 未显式配置封面时，按统一规则推导，保证商城处处有图 */
function withCover(g: Goods): Goods {
  const cover = g.cover || `/assets/goods/${g.id}.jpg`;
  return {
    ...g,
    cover,
    gallery: g.gallery && g.gallery.length ? g.gallery : [cover],
  };
}

export function getAllGoods(): Goods[] {
  return catalog.map(withCover);
}

export function getGoodsByCategory(category: GoodsCategory): Goods[] {
  return catalog.filter((g) => g.category === category).map(withCover);
}

export function getGoods(id: string): Goods | undefined {
  const g = catalog.find((x) => x.id === id);
  return g ? withCover(g) : undefined;
}

export function getFeaturedGoods(limit = 6): Goods[] {
  return catalog.slice(0, limit).map(withCover);
}
