import { ScenePoint } from '../../types/scene';
import qinglongShanmen from './qinglong-shanmen';
import qinglongGuanding from './qinglong-guanding';
import qinglongMantuluo from './qinglong-mantuluo';
import qinglongFufa from './qinglong-fufa';
import qinglongDonggui from './qinglong-donggui';

/** 青龙寺 5 点位（独立剧场文件，按路线顺序） */
const qinglongsiScenes: ScenePoint[] = [
  qinglongShanmen,
  qinglongGuanding,
  qinglongMantuluo,
  qinglongFufa,
  qinglongDonggui,
].sort((a, b) => a.index - b.index);

export default qinglongsiScenes;
