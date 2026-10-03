/** 云阙商城商品 */
export type GoodsCategory =
  | 'collection' // 典藏复刻
  | 'figure' // 盛唐写实手办
  | 'blindbox' // IP潮玩盲盒
  | 'plush' // 毛绒潮玩
  | 'jewelry' // 唐妆首饰
  | 'accessory' // 随身祈福配饰
  | 'lifestyle' // 日常软周边
  | 'city' // 城市限定
  | 'digital' // 数字AR
  | 'experience'; // 体验预约

export interface Goods {
  id: string;
  name: string;
  category: GoodsCategory;
  /** 售价 / 预售价（元）；体验类为定金或一口价 */
  price: number;
  originalPrice?: number;
  /** 是否预售/意向登记 */
  presale: boolean;
  cover?: string;
  gallery?: string[];
  desc: string;
  /** 文物灵感卡说明 */
  culturalNote?: string;
  /** AR 预览模型（glb，CDN）或扫描召唤标识 */
  arPreview?: string;
  tags: string[];
  sales?: number;
}

export const CATEGORY_LABEL: Record<GoodsCategory, string> = {
  collection: '典藏复刻',
  figure: '写实手办',
  blindbox: '潮玩盲盒',
  plush: '毛绒潮玩',
  jewelry: '唐妆首饰',
  accessory: '随身配饰',
  lifestyle: '日常软周边',
  city: '城市限定',
  digital: '数字AR',
  experience: '体验预约',
};
