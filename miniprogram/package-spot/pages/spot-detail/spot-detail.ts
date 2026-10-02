import { getSpot } from '../../../data/repositories/spotRepo';
import { getScene } from '../../../data/repositories/sceneRepo';
import { getAllGoods } from '../../../data/repositories/goodsRepo';
import { CATEGORY_LABEL, Goods } from '../../../data/types/goods';
import { Spot, SpotRouteNode } from '../../../data/types/spot';

/* ---------- view-model 类型 ---------- */

interface RelatedVM extends Goods {
  categoryLabel: string;
}

interface TheaterVM {
  sceneId: string;
  name: string;
  subtitle: string;
  scaleName?: string;
  image?: string;
}

interface TimelineGroup {
  era: string | null;
  items: Spot['timeline'];
}

interface EdgeVM {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  primary?: boolean;
  label?: string;
}

interface EdgeLabelVM {
  x: number;
  y: number;
  label: string;
}

const KIND_LABEL: Record<string, string> = {
  classic: '典籍',
  archaeology: '考古报告',
  modern: '近现代研究',
};

/** 把确定性 SVG 序列化成小程序 <image> 可渲染的 data URI */
function svgToUri(svg: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/** 动线 SVG：分区底色矩形 + 主轴/支线连线（viewBox 0 0 100 100，preserveAspectRatio none） */
function buildRouteSvg(
  route: Spot['route'],
  nodeMap: Record<string, SpotRouteNode>,
): string {
  const zones = (route.zones || [])
    .map((z) => {
      const b = z.bounds || { x: 0, y: 0, w: 100, h: 100 };
      const c = z.color || '#c7a987';
      return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="1.6" fill="${c}" fill-opacity="0.10" stroke="${c}" stroke-opacity="0.45" stroke-width="0.6"/>`;
    })
    .join('');

  const lines = route.edges
    .map((e) => {
      const a = nodeMap[e.from];
      const b = nodeMap[e.to];
      if (!a || !b) return '';
      const primary = !!e.primary;
      const color = primary ? '#9e4a2a' : '#8fa6ab';
      const width = primary ? 1.15 : 0.5;
      const dash = primary ? '' : ' stroke-dasharray="2.2 1.8"';
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${width}" stroke-opacity="${primary ? 0.85 : 0.6}" stroke-linecap="round"${dash}/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="0" y="0" width="100" height="100" fill="#fbf6ec"/>${zones}${lines}</svg>`;
}

Page({
  data: {
    notFound: false,
    spot: null as Spot | null,
    /* 板块 view-model */
    timelineGroups: [] as TimelineGroup[],
    routeSvgUri: '',
    edgeLabels: [] as EdgeLabelVM[],
    theaterVms: [] as TheaterVM[],
    hasTheaters: false,
    startSceneId: '',
    relatedGoods: [] as RelatedVM[],
  },

  onLoad(query: Record<string, string | undefined>) {
    const id = (query && query.id) || 'daminggong';
    const spot = getSpot(id);

    if (!spot) {
      this.setData({ notFound: true, spot: null });
      return;
    }

    /* 时间线按 era 分组 */
    const timelineGroups: TimelineGroup[] = [];
    spot.timeline.forEach((it) => {
      const era = it.era || '';
      const last = timelineGroups[timelineGroups.length - 1];
      if (!last || last.era !== era) {
        timelineGroups.push({ era: era || null, items: [it] });
      } else {
        last.items.push(it);
      }
    });

    /* 动线：节点表 + 端点坐标 view-model + SVG */
    const nodeMap: Record<string, SpotRouteNode> = {};
    spot.route.nodes.forEach((n) => (nodeMap[n.id] = n));
    const edgeLabels: EdgeLabelVM[] = [];
    spot.route.edges.forEach((e) => {
      if (!e.label) return;
      const a = nodeMap[e.from];
      const b = nodeMap[e.to];
      if (!a || !b) return;
      edgeLabels.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, label: e.label });
    });
    const routeSvgUri = svgToUri(buildRouteSvg(spot.route, nodeMap));

    /* 关联剧场：仅填 sceneId 时从剧场数据富化 name/intro/scaleName/bg */
    const theaterVms: TheaterVM[] = spot.theaters.map((t) => {
      const sc = getScene(t.sceneId);
      return {
        sceneId: t.sceneId,
        name: t.name || sc?.name || '数字剧场',
        subtitle: t.subtitle || sc?.intro || '',
        scaleName: sc?.scaleName,
        image: t.image || sc?.bg || sc?.cover || '',
      };
    });

    /* CTA 起点：route.startNodeId 对应节点的剧场，否则第一个剧场 */
    const startNode = spot.route.startNodeId
      ? nodeMap[spot.route.startNodeId]
      : undefined;
    const startSceneId = (startNode && startNode.sceneId) || theaterVms[0]?.sceneId || '';

    /* 史料类型标签 */
    const citations = spot.citations.map((c) => ({
      ...c,
      kindLabel: c.kind ? KIND_LABEL[c.kind] : '',
    }));

    const relatedGoods: RelatedVM[] = getAllGoods()
      .slice(0, 8)
      .map((g) => ({ ...g, categoryLabel: CATEGORY_LABEL[g.category] }));

    this.setData({
      notFound: false,
      spot: { ...spot, citations } as Spot,
      timelineGroups,
      routeSvgUri,
      edgeLabels,
      theaterVms,
      hasTheaters: theaterVms.length > 0,
      startSceneId,
      relatedGoods,
    });
  },

  /** 主 CTA：跟随云阙巡游；无剧场时友好 toast，不出僵尸按钮 */
  startTour() {
    if (this.data.startSceneId) {
      wx.navigateTo({
        url: `/package-tour/pages/scene/scene?id=${this.data.startSceneId}&mode=cloud`,
      });
    } else {
      wx.showToast({ title: '该景点数字剧场即将上线', icon: 'none' });
    }
  },

  /** 缺失景点兜底：返回上一页，栈空时回首页 */
  goBack() {
    wx.navigateBack({
      fail: () => wx.reLaunch({ url: '/pages/home/home' }),
    });
  },

  /** 进入点位剧场（动线节点 / 亮点 / 剧场卡片共用） */
  goScene(e: WechatMiniprogram.TouchEvent) {
    const sceneId = (e.currentTarget.dataset as { sceneId?: string }).sceneId;
    if (!sceneId) return;
    wx.navigateTo({
      url: `/package-tour/pages/scene/scene?id=${sceneId}&mode=cloud`,
    });
  },

  goGoods(e: WechatMiniprogram.TouchEvent) {
    const id = (e.currentTarget.dataset as { id: string }).id;
    wx.navigateTo({ url: `/package-mall/pages/goods-detail/goods-detail?id=${id}` });
  },

  copySource(e: WechatMiniprogram.TouchEvent) {
    const url = (e.currentTarget.dataset as { url?: string }).url;
    if (!url) return;
    wx.setClipboardData({
      data: url,
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' }),
    });
  },
});
