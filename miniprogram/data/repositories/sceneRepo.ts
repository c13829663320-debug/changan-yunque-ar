import daminggongScenes from '../scenes/daminggong/index';
import { ScenePoint } from '../types/scene';

const allScenes: ScenePoint[] = [...daminggongScenes];

export function getScenesBySpot(spotId: string): ScenePoint[] {
  return allScenes
    .filter((s) => s.spotId === spotId)
    .sort((a, b) => a.index - b.index);
}

export function getScene(id: string): ScenePoint | undefined {
  return allScenes.find((s) => s.id === id);
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
