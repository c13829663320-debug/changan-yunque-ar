import daminggongScenes from '../scenes/daminggong/index';
import dayantaScenes from '../scenes/dayanta/index';
import qinglongsiScenes from '../scenes/qinglongsi/index';
import { ScenePoint } from '../types/scene';

/** 复原视频已上传 CDN（不进小程序包、在线播放）；加载失败由 poster 运镜兜底 */
const RESTORE_VIDEO: Record<string, string> = {
  danfengmen: 'https://aka.doubaocdn.com/s/TlcwFt5QIg',
  hanyuan: 'https://aka.doubaocdn.com/s/IL046HDeL7',
  xuanzheng: 'https://aka.doubaocdn.com/s/WM7y9lpVB1',
  zichen: 'https://aka.doubaocdn.com/s/JeYxZSamN1',
  taiyechi: 'https://aka.doubaocdn.com/s/KWTkUwH0hD',
  linde: 'https://aka.doubaocdn.com/s/cYQ3Q7CUCM',
  xuanwumen: 'https://aka.doubaocdn.com/s/ttL2luLyrZ',
  // 大雁塔 5 点位复原视频（Seedance 2.5）
  shanmen: 'https://aka.doubaocdn.com/s/4UP0yY80Kt',
  yichang: 'https://aka.doubaocdn.com/s/u1LUUJUnxR',
  shengjiaobei: 'https://aka.doubaocdn.com/s/befUUj2CXh',
  timing: 'https://aka.doubaocdn.com/s/AvAzGYxoZl',
  'yata-ding': 'https://aka.doubaocdn.com/s/zWO8DXVeau',
  // 青龙寺 5 点位复原视频（Seedance 2.5）
  'qinglong-shanmen': 'https://aka.doubaocdn.com/s/dVGgzVdkYM',
  'qinglong-guanding': 'https://aka.doubaocdn.com/s/H8oHk3Msx6',
  'qinglong-mantuluo': 'https://aka.doubaocdn.com/s/9QVJ3BDJcw',
  'qinglong-fufa': 'https://aka.doubaocdn.com/s/4ROPgR3auU',
  'qinglong-donggui': 'https://aka.doubaocdn.com/s/fGhNyN4DUm',
};

const allScenes: ScenePoint[] = [...daminggongScenes, ...dayantaScenes, ...qinglongsiScenes];

export function getScenesBySpot(spotId: string): ScenePoint[] {
  return allScenes
    .filter((s) => s.spotId === spotId)
    .sort((a, b) => a.index - b.index);
}

export function getScene(id: string): ScenePoint | undefined {
  const s = allScenes.find((x) => x.id === id);
  if (!s) return s;
  // 数据驱动：为每点位挂载动态复原视频（无 3D 时以视频替代），舞台背景 / AR 层 / AR 相机共用
  return {
    ...s,
    restoreVideo: RESTORE_VIDEO[s.id] || '',
    // 大雁塔 poster 走 CDN（s.poster）；大明宫无 poster 字段时回退包内本地 poster
    poster: s.poster || `/package-tour/assets/scenes/${s.id}/poster.jpg`,
  };
}

export function getNextScene(currentId: string): ScenePoint | undefined {
  const cur = getScene(currentId);
  if (!cur) return allScenes[0];
  return allScenes
    .filter((s) => s.spotId === cur.spotId && s.index > cur.index)
    .sort((a, b) => a.index - b.index)[0];
}

export function getTotalCount(spotId: string): number {
  return allScenes.filter((s) => s.spotId === spotId).length;
}
