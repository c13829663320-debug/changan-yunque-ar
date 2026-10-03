import daminggongScenes from '../scenes/daminggong/index';
import { ScenePoint } from '../types/scene';

/** 重媒体（复原视频/配音）CDN 基址：不进小程序包、在线播放；加载失败由 poster 运镜/字幕兜底 */
const MEDIA_BASE = 'https://aka.doubaocdn.com/changan';

const allScenes: ScenePoint[] = [...daminggongScenes];

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
    restoreVideo: `${MEDIA_BASE}/scenes/${s.id}.mp4`,
    poster: `/package-tour/assets/scenes/${s.id}/poster.jpg`,
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
