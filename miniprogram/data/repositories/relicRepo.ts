import relics from '../relics/daminggong';
import dayantaRelics from '../relics/dayanta';
import qinglongRelics from '../relics/qinglongsi';
import { Relic } from '../types/relic';

const allRelics: Relic[] = [...relics, ...dayantaRelics, ...qinglongRelics];

export function getRelicsBySpot(spotId: string): Relic[] {
  return allRelics.filter((r) => r.spotId === spotId);
}

export function getRelicsByScene(sceneId: string): Relic[] {
  return allRelics.filter((r) => r.sceneId === sceneId);
}

export function getRelic(id: string): Relic | undefined {
  return allRelics.find((r) => r.id === id);
}
