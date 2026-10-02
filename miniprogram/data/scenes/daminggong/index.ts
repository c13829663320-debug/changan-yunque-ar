import { ScenePoint } from '../../types/scene';
import danfengmen from './danfengmen';
import hanyuan from './hanyuan';
import xuanzheng from './xuanzheng';
import zichen from './zichen';
import taiyechi from './taiyechi';
import linde from './linde';
import xuanwumen from './xuanwumen';

/** 大明宫 7 点位（独立文件，按路线顺序） */
const daminggongScenes: ScenePoint[] = [
  danfengmen,
  hanyuan,
  xuanzheng,
  zichen,
  taiyechi,
  linde,
  xuanwumen,
].sort((a, b) => a.index - b.index);

export default daminggongScenes;
