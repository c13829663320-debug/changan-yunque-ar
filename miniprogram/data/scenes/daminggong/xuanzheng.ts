import { ScenePoint } from '../../types/scene';

/** 点位 3 · 宣政殿（中朝 · 廊下食 · 重剧场） */
const xuanzheng: ScenePoint = {
  id: 'xuanzheng',
  spotId: 'daminggong',
  index: 3,
  name: '宣政殿',
  role: '退朝赴廊下食的常参官',
  scaleName: '廊下鳞',
  weight: 'heavy',
  geo: { latitude: 34.2882, longitude: 108.9633, radius: 110 },
  markerImage: 'markers/xuanzheng.png',
  arModel: 'models/xuanzheng.glb',
  bg: '/package-tour/assets/scenes/xuanzheng-restore.jpg',
  arRestoreImage: '/package-tour/assets/scenes/xuanzheng-restore.jpg',
  intro: '中朝正殿，朔望大朝、殿试册封之所；退朝后百官于殿廊领「廊下食」。',
  sourceCard: {
    title: '廊下食：唐代官员的工作餐',
    works: [
      { name: '《唐会要》' },
      { name: '《唐六典》' },
      { name: '《册府元龟》' },
    ],
    note:
      '贞观四年（630），唐太宗因朝会自晨至午、官员饥乏，诏光禄寺于朝堂外廊置食，按品级供给（约四菜一汤之制）。该制度始设时大明宫尚未建成，先设于太极宫；大明宫663年启用后，廊下食设于殿廊（唐初多在含元殿、后期改宣政殿）。具体供给与品秩条文以《唐六典》《唐会要》为准。',
  },
  dialogs: [
    { id: 'xz-1', actor: 'narrator', text: '朝会散去，已近正午。宣政殿外廊，光禄寺小吏排开案席，香气渐起。', action: { type: 'look_around' } },
    { id: 'xz-2', actor: 'xiaoli', actorName: '光禄寺小吏', text: '廊下食已备，常参官凭鱼符、按品级入座，依序领食。' },
    { id: 'xz-3', actor: 'yunque', text: '（惊讶）上朝……还管饭？这就是「廊下食」？' },
    {
      id: 'xz-4', actor: 'yunque', text: '我们……坐哪儿、怎么领？',
      choices: [
        {
          id: 'xz-c-pin', text: '凭鱼符品级，在对应案席入座', correct: true,
          feedback: { actor: 'xiaoli', actorName: '光禄寺小吏', text: '合制度，廊下食按品级供给，菜数有差。' },
        },
        {
          id: 'xz-c-random', text: '随便找个靠前的位子坐下', correct: false,
          feedback: { actor: 'xiaoli', actorName: '光禄寺小吏', text: '使不得！席次按品秩，那是给相公们留的。' },
        },
      ],
    },
    { id: 'xz-5', actor: 'tongliao', actorName: '同僚官员', text: '（笑）这是贞观四年的旧制。朝会太久，怕百官饿肚子，光禄寺便在廊下设食。' },
    { id: 'xz-6', actor: 'yunque', text: '（数菜）有羹、有饭、有肉、有菜……差不多四菜一汤呢。' },
    { id: 'xz-7', actor: 'tongliao', actorName: '同僚官员', text: '这规矩先在太极宫，大明宫建成后，才搬到这殿廊里来。', action: { type: 'open_source_card' } },
    { id: 'xz-8', actor: 'narrator', text: '开启摄像头，看宣政殿廊下赐食的热闹场面。', action: { type: 'ar_restore', name: '宣政殿' } },
    { id: 'xz-9', actor: 'yunque', text: '一顿热乎工作餐，也藏着治国的细心……（金鳞）「廊下鳞」给你。', action: { type: 'collect_scale' } },
  ],
};

export default xuanzheng;
