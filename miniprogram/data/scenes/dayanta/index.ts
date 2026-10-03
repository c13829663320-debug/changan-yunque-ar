import { ScenePoint } from '../../types/scene';
import shanmen from './shanmen';
import yichang from './yichang';
import shengjiaobei from './shengjiaobei';
import timing from './timing';
import yataDing from './yata-ding';

/** 大雁塔 · 大慈恩寺 5 点位（独立剧场文件，按路线顺序） */
const dayantaScenes: ScenePoint[] = [
  shanmen,
  yichang,
  shengjiaobei,
  timing,
  yataDing,
].sort((a, b) => a.index - b.index);

export default dayantaScenes;
