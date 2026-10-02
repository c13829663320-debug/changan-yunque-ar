import { ScenePoint } from '../../types/scene';
import danfengmen from './danfengmen';
import { otherScenes } from './others.meta';

/** 大明宫 7 点位（按路线顺序） */
const daminggongScenes: ScenePoint[] = [danfengmen, ...otherScenes].sort(
  (a, b) => a.index - b.index,
);

export default daminggongScenes;
