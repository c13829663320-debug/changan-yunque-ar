import { ScenePoint } from '../../types/scene';

/**
 * 点位 5 · 太液池（重剧场）
 * 身份：随游后苑的近臣；龙鳞：池苑鳞
 * 闭环：look_around → choices(临池对句) → ar_restore(一池三山) → open_source_card → collect_scale
 */
const taiyechi: ScenePoint = {
  id: 'taiyechi',
  spotId: 'daminggong',
  index: 5,
  name: '太液池',
  role: '随游后苑的近臣',
  scaleName: '池苑鳞',
  weight: 'heavy',
  geo: { latitude: 34.2955, longitude: 108.9605, radius: 150 },
  markerImage: 'markers/taiyechi.png',
  arModel: 'models/taiyechi.glb',
  bg: '/package-tour/assets/scenes/taiyechi/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/taiyechi/ar-restore.jpg',
  intro: '后寝中心，一池三山、蓬莱在望，是皇家游宴赋诗之所。',
  sourceCard: {
    title: '太液池与蓬莱仙山',
    works: [{ name: '《唐六典》' }, { name: '唐代宫苑题材唐诗' }],
    note: '太液池为大明宫北部后寝的中心园林，池中筑蓬莱等仙山，取法秦汉一池三山，为皇家游宴、临池赋诗之所。',
  },
  dialogs: [
    {
      id: 'tyc-1',
      actor: 'narrator',
      text: '暮色四合，你随御舟划入太液池。水面平得像磨过的玉，岸旁灯烛映出碎金似的光。',
      action: { type: 'look_around' },
    },
    {
      id: 'tyc-2',
      actor: 'yunque',
      expression: 'surprised',
      text: '（扒着船舷）哇——这池子也太大了！水中央那些长着树的小洲，是小岛吗？',
    },
    {
      id: 'tyc-3',
      actor: 'he',
      actorName: '贺拾遗',
      text: '那不是寻常小洲，是仙山。匠人在水中堆出三座山：蓬莱、方丈、瀛洲，取法秦汉「一池三山」古制。',
    },
    {
      id: 'tyc-4',
      actor: 'narrator',
      text: '帝王以一池三山，把海上仙境搬进宫苑，也仿佛能望见缥缈仙山。',
    },
    {
      id: 'tyc-5',
      actor: 'yunque',
      expression: 'curious',
      text: '那……哪一座是蓬莱？听说蓬莱最远最险，只有神仙才住得上去。',
    },
    {
      id: 'tyc-6',
      actor: 'he',
      actorName: '贺拾遗',
      text: '（拂掌而笑）良辰美景，不可无诗。我有一句上句——「太液芙蓉千顷碧」，你且对个下句。',
      choices: [
        {
          id: 'tyc-c-ya',
          text: '对：蓬莱宫阙五云高',
          correct: true,
          feedback: {
            actor: 'he',
            actorName: '贺拾遗',
            text: '（击节）好！「芙蓉」对「宫阙」，「千顷碧」对「五云高」，对仗工稳，气韵也接得上。这一句，可记入今日的诗卷。',
          },
          easterEgg: '（拍手）对得好！我虽不大懂诗，可这两句放在一处，听着就像那么回事。',
        },
        {
          id: 'tyc-c-xie',
          text: '对：水底游鱼逐影过',
          correct: false,
          feedback: {
            actor: 'he',
            actorName: '贺拾遗',
            text: '（一笑）句子清丽，只是「芙蓉」是名物、「千顷」是数目，你这对得松了些。不过能从水里看见游鱼，倒也是个有心人。',
          },
        },
      ],
    },
    {
      id: 'tyc-7',
      actor: 'narrator',
      text: '一句对罢，水面忽起薄雾。烟水深处，一座筑着玲珑山亭的岛渐渐清晰——正是蓬莱山。开启AR复原，可看太液池一池三山的完整盛景。',
      action: { type: 'ar_restore', name: '太液池' },
    },
    {
      id: 'tyc-8',
      actor: 'yunque',
      expression: 'normal',
      text: '（望着复原图，轻声）原来三座山这样遥遥相望……像把一整座仙境，叠进了这池水里。',
    },
    {
      id: 'tyc-9',
      actor: 'narrator',
      text: '贺拾遗闲闲道：这套「一池三山」的章法，自秦汉便沿用至今。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'tyc-10',
      actor: 'narrator',
      text: '船上笑声渐起，云阙却没跟着笑。她望着蓬莱山在水中的倒影，出了神。',
    },
    {
      id: 'tyc-11',
      actor: 'yunque',
      expression: 'daze',
      text: '（声音很轻）……这水现在真清啊。我好像见过它另一个样子：也是这片水，却荒了——山平了，灯也不剩。',
    },
    {
      id: 'tyc-12',
      actor: 'narrator',
      text: '她没再说下去，只拢了拢衣袖，像把一段遥远的心事，悄悄放回了水里。',
    },
    {
      id: 'tyc-13',
      actor: 'yunque',
      expression: 'happy',
      text: '（忽然抬头，掌心浮起青鳞）这片「池苑鳞」给你——前头麟德殿设宴，舞马就要开场了，快些去。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default taiyechi;
