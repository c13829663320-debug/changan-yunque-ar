import { ScenePoint } from '../../types/scene';

/**
 * 点位 4 · 紫宸殿「入閤召对」（重剧场 · Line2）
 * 用户身份：被天子召对的近臣。
 * 氛围红线：殿内只余近臣，廊下一角一名宦官垂手肃立；以克制方式埋晚唐宦官权势渐重伏笔
 *           （sourceCard 背景含甘露之变 835），人物不穿越、不预演具体事件，只作氛围与史实说明。
 * 坐标 / intro / sourceCard / 身份 / 龙鳞取值复用自 others.meta.ts（只读）。
 */
const zichen: ScenePoint = {
  id: 'zichen',
  spotId: 'daminggong',
  index: 4,
  name: '紫宸殿',
  role: '被皇帝召对的近臣',
  scaleName: '召对鳞',
  weight: 'heavy',
  geo: { latitude: 34.2912, longitude: 108.9632, radius: 100 },
  markerImage: 'markers/zichen.png',
  arModel: 'models/zichen.glb',
  bg: '/package-tour/assets/scenes/zichen/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/zichen/ar-restore.jpg',
  intro: '内朝正殿，群臣「入閤」，君臣近距离议政；晚唐权力暗流在此涌动。',
  sourceCard: {
    title: '紫宸殿「入閤」与内朝',
    works: [
      { name: '《唐六典》' },
      { name: '《旧唐书》' },
    ],
    note: '紫宸殿为内朝正殿，群臣于此「入閤」朝见、日常召对。晚唐宦官权势渐重，终有甘露之变（835年）。',
  },
  dialogs: [
    {
      id: 'zc-1',
      actor: 'narrator',
      text: '你随閤门值卫入紫宸殿。这道门唤作「入閤」——外朝仗卫在閤外收起，殿内只余天子亲召的近臣。',
      action: { type: 'look_around' },
    },
    {
      id: 'zc-2',
      actor: 'yunque',
      expression: 'normal',
      text: '（难得收了笑，放轻脚步）……这里好静。和含元殿那种排场，完全不一样。',
    },
    {
      id: 'zc-3',
      actor: 'liguan',
      actorName: '閤门值卫',
      text: '召对禁言笑。天子垂问，据实而奏；退朝依序而出，不得喧呼。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'zc-4',
      actor: 'narrator',
      text: '御座之上，天子只与寥寥数人对面。廊柱阴影里，一名宦官垂手肃立，像把每句话都听进耳里。',
    },
    {
      id: 'zc-5',
      actor: 'yunque',
      expression: 'curious',
      text: '（拽你衣袖，用气声）那个人……一直站在那儿。他是谁？为什么大家都低着头不看他？',
    },
    {
      id: 'zc-6',
      actor: 'narrator',
      text: '天子问及北边军情，话锋一转，忽然点到你的名字。你斟酌着，该如何回奏——',
      choices: [
        {
          id: 'zc-c-ying',
          text: '顺着天子脸色，夸大军情、希旨迎合',
          correct: false,
          feedback: {
            actor: 'emperor',
            actorName: '天子',
            text: '（淡淡）方才所奏，与边将报状不合。卿且退回，思之再奏。',
          },
        },
        {
          id: 'zc-c-shi',
          text: '据实陈奏，不夸不饰，从容对答',
          correct: true,
          feedback: {
            actor: 'emperor',
            actorName: '天子',
            text: '（微微颔首）嗯，平实可据。可付所司施行。',
          },
          easterEgg: '（出了閤门才敢拍胸口）吓死我了……还好你实打实地说，不然廊下那位垂眼的人，可就记下你啦。',
        },
      ],
    },
    {
      id: 'zc-7',
      actor: 'yunque',
      expression: 'normal',
      text: '（你退下时，她在你耳边用气声补了一句）还好还好……方才那句错话，可不敢乱说。',
    },
    {
      id: 'zc-8',
      actor: 'narrator',
      text: '奏对毕，天子挥袖示意。你随班退出閤门——方才那几句话，已被廊下那人听得一字不落。',
    },
    {
      id: 'zc-9',
      actor: 'yunque',
      expression: 'curious',
      text: '（出了閤门才敢低声）刚才在里面，我连气都不敢大出……那个垂手站着的人，是做什么的？',
    },
    {
      id: 'zc-11',
      actor: 'yunque',
      expression: 'daze',
      text: '（回头望了一眼那道深閤，眼里掠过一丝恍惚，轻声）我说不上来……只是觉得，廊下那人眼里不只有恭敬。这里往后，或许会慢慢变了模样。',
    },
    {
      id: 'zc-12',
      actor: 'narrator',
      text: '你回望紫宸殿。开启摄像头，可在原址之上看这座内朝正殿的复原。',
      action: { type: 'ar_restore', name: '紫宸殿' },
    },
    {
      id: 'zc-13',
      actor: 'yunque',
      expression: 'normal',
      text: '（掌心浮起金鳞）这片「召对鳞」给你。（指指北面）出去便是太液池——去水边松口气吧。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default zichen;
