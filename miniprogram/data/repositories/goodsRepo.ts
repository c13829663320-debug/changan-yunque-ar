import catalog from '../goods/catalog';
import { Goods, GoodsCategory } from '../types/goods';

export function getAllGoods(): Goods[] {
  return catalog;
}

export function getGoodsByCategory(category: GoodsCategory): Goods[] {
  return catalog.filter((g) => g.category === category);
}

export function getGoods(id: string): Goods | undefined {
  return catalog.find((g) => g.id === id);
}

export function getFeaturedGoods(limit = 6): Goods[] {
  return catalog.slice(0, limit);
}
