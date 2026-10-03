import { getProgressStore } from '../../../store/progress';
import { getSpots } from '../../../data/repositories/spotRepo';
import { getScenesBySpot } from '../../../data/repositories/sceneRepo';

interface DetailRow {
  name: string;
  sub: string;
  got: boolean;
}

interface DetailGroup {
  spotId: string;
  spotName: string;
  got: number;
  total: number;
  rows: DetailRow[];
}

Page({
  data: {
    type: 'scales' as 'scales' | 'stamps',
    title: '龙鳞谱',
    hint: '',
    totalGot: 0,
    isEmpty: true,
    groups: [] as DetailGroup[],
  },

  onLoad(query: Record<string, string | undefined>) {
    const type: 'scales' | 'stamps' = query?.type === 'stamps' ? 'stamps' : 'scales';
    this.setData({ type });
    this.build();
  },

  onShow() {
    this.build();
  },

  /** 按景点分组渲染：scales=龙鳞清单，stamps=通关文牒章清单 */
  build() {
    const store = getProgressStore();
    const isStamps = this.data.type === 'stamps';
    const stampSceneIds = new Set(
      store.stamps.map((s) => s.sceneId).filter(Boolean),
    );

    const groups: DetailGroup[] = getSpots()
      .map((sp) => {
        const scenes = getScenesBySpot(sp.id);
        const gotScales = new Set(store.getScales(sp.id));
        const rows: DetailRow[] = scenes.map((sc) => ({
          // 龙鳞清单：主名=龙鳞名；文牒清单：主名=殿名
          name: isStamps ? sc.name : sc.scaleName,
          sub: isStamps ? sc.scaleName : sc.name,
          got: isStamps ? stampSceneIds.has(sc.id) : gotScales.has(sc.scaleName),
        }));
        return {
          spotId: sp.id,
          spotName: sp.name,
          got: rows.filter((r) => r.got).length,
          total: rows.length,
          rows,
        };
      })
      .filter((g) => g.total > 0);

    const totalGot = groups.reduce((sum, g) => sum + g.got, 0);
    const title = isStamps ? '通关文牒' : '龙鳞谱';
    wx.setNavigationBarTitle({ title });

    this.setData({
      title,
      hint: isStamps ? '现场 AR 讲解收集后盖章' : '完成点位剧场后收入龙鳞',
      groups,
      totalGot,
      isEmpty: totalGot === 0,
    });
  },
});
