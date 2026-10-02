import { ScenePoint } from '../../types/scene';

/** 点位 7 · 玄武门（北门 · 终章投龙 · 重剧场） */
const xuanwumen: ScenePoint = {
  id: 'xuanwumen',
  spotId: 'daminggong',
  index: 7,
  name: '玄武门',
  role: '陪云阙投龙许愿的你',
  scaleName: '归愿鳞',
  weight: 'heavy',
  geo: { latitude: 34.3001, longitude: 108.9631, radius: 120 },
  markerImage: 'markers/xuanwumen.png',
  arModel: 'models/xuanwumen.glb',
  bg: '/package-tour/assets/scenes/xuanwumen-restore.jpg',
  arRestoreImage: '/package-tour/assets/scenes/xuanwumen-restore.jpg',
  intro: '大明宫北门。云阙在此辨明「玄武门之变」的误会，集齐七鳞，投龙祈愿。',
  sourceCard: {
    title: '玄武门之变辨 · 投龙祈愿',
    works: [
      { name: '《旧唐书·太宗本纪》' },
      { name: '《资治通鉴》' },
      { name: '唐代投龙仪式与赤金走龙相关资料' },
    ],
    note:
      '武德九年（626）六月的玄武门之变，发生在太极宫北门玄武门，并非大明宫的玄武门；大明宫始建于634年、663年启用。云阙在此纠偏常见误解，并依唐代「投龙」仪式，投金龙、玉简于山川以许心愿，集齐七片龙鳞，唤起身世、呼唤失散同伴。具体史事以《旧唐书》《资治通鉴》为准。',
  },
  dialogs: [
    { id: 'xwm-1', actor: 'narrator', text: '行至大明宫北门玄武门，天色向晚。云阙停下脚步，回头望你。', action: { type: 'look_around' } },
    { id: 'xwm-2', actor: 'yunque', text: '很多人以为，那场「玄武门之变」就发生在我脚下这座门。' },
    {
      id: 'xwm-3', actor: 'yunque', text: '（她看着你）你说呢？',
      choices: [
        {
          id: 'xwm-c-right', text: '那场政变在太极宫的玄武门，不是这里', correct: true,
          feedback: { actor: 'yunque', text: '（笑）对！大明宫634年才始建，政变是626年，那时还没有这座门呢。' },
        },
        {
          id: 'xwm-c-wrong', text: '应该……就是这座门吧', correct: false,
          feedback: { actor: 'yunque', text: '（摇头）我一开始也这么以为。其实那是太极宫的玄武门，别弄混啦。' },
        },
      ],
    },
    { id: 'xwm-4', actor: 'narrator', text: '武德九年（626）六月，玄武门之变发生在太极宫北门；大明宫此时尚未兴建。', action: { type: 'open_source_card' } },
    { id: 'xwm-5', actor: 'yunque', text: '（摊开掌心，六片金鳞浮起）启程、朝会、廊下、召对、池苑、盛宴……就差最后一片了。' },
    { id: 'xwm-6', actor: 'yunque', text: '我是一九七五年失散人间的赤金走龙之一。走过这一路，我终于想起自己是谁。' },
    { id: 'xwm-7', actor: 'narrator', text: '依唐代「投龙」古礼，投金龙、玉简于山川，以许心愿。' },
    {
      id: 'xwm-8', actor: 'yunque', text: '此刻，你想许什么愿？',
      choices: [
        {
          id: 'xwm-c-wish1', text: '愿长安常在、文明不熄', correct: true,
          feedback: { actor: 'yunque', text: '好愿。山川有知，定会记得。' },
        },
        {
          id: 'xwm-c-wish2', text: '愿云阙早日找到失散的同伴', correct: true,
          feedback: { actor: 'yunque', text: '（动容）谢谢你……这，也是我的心愿。' },
        },
      ],
    },
    { id: 'xwm-9', actor: 'narrator', text: '七鳞合一，金光化作一道赤金龙影，盘旋而上。', action: { type: 'ar_restore', name: '玄武门投龙' } },
    { id: 'xwm-10', actor: 'yunque', text: '（金鳞合一）这片「归愿鳞」，是终点，也是新的起点。', action: { type: 'collect_scale' } },
  ],
};

export default xuanwumen;
