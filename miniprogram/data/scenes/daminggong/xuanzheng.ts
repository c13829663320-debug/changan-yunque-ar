import { ScenePoint } from '../../types/scene';

/**
 * 点位 3 · 宣政殿「廊下食」（重剧场 · Line2）
 * 用户身份：退朝赴廊下食的常参官。
 * 史料红线：贞观四年（630）唐太宗诏光禄寺于朝堂外廊按品级供给、约四菜一汤；
 *           始设时大明宫尚未建成（634 始建、663 启用），先在太极宫，后延续至大明宫。
 * 坐标 / intro / 史料卡 / 身份 / 龙鳞取值复用自 others.meta.ts（只读）。
 */
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
  bg: '/package-tour/assets/scenes/xuanzheng/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/xuanzheng/ar-restore.jpg',
  intro: '中朝正殿，朔望大朝、殿试册封之所；退朝后百官于殿廊领「廊下食」。',
  sourceCard: {
    title: '廊下食：唐代官员的工作餐',
    works: [
      { name: '《唐会要》' },
      { name: '《唐六典》' },
      { name: '《册府元龟》' },
    ],
    note:
      '贞观四年（630），唐太宗因朝会拉长、官员「日出视事、日中退朝」，诏光禄寺于朝堂外廊置食，按品级供给。大明宫启用后，廊下食设于殿廊，唐初多在含元殿、后期改宣政殿。该制度始设时大明宫尚未建成，先设于太极宫时期。',
  },
  dialogs: [
    {
      id: 'xz-1',
      actor: 'narrator',
      text: '朔望大朝刚散，宣政殿外廊。晨光斜过廊柱，光禄寺的小吏正把食案一案一案排开，百官三三两两，退到廊下。',
      action: { type: 'look_around' },
    },
    {
      id: 'xz-2',
      actor: 'yunque',
      text: '（踮脚张望）退朝了……怎么廊下摆了这么多小案子，还放着碗碗盏盏的？这是要做什么呀？',
    },
    {
      id: 'xz-3',
      actor: 'liguan',
      actorName: '光禄寺礼官',
      text: '诸位常参官留步。退朝赐食，谓之「廊下食」——各依本品秩领案，对号入座，不得争先躐等。',
    },
    {
      id: 'xz-4',
      actor: 'yunque',
      text: '（扯你袖子，小声）那我们坐哪儿？靠近殿门那几案看着最体面、最热闹……',
      choices: [
        {
          id: 'xz-c-near',
          text: '拣靠近殿门的案席落座',
          correct: false,
          feedback: {
            actor: 'liguan',
            actorName: '光禄寺礼官',
            text: '使君且慢！近殿门乃供奉、清望高官之位，下僚依品序退坐，不可躐等失仪。',
          },
        },
        {
          id: 'xz-c-rank',
          text: '按自己品级找对应案席，谦逊落座',
          correct: true,
          feedback: {
            actor: 'liguan',
            actorName: '光禄寺礼官',
            text: '嗯，依品而坐，不僭不躐，这才是常参官的体统。',
          },
        },
      ],
    },
    {
      id: 'xz-5',
      actor: 'narrator',
      text: '食案上不过一碗白饭、一盂羹汤，再添两三样时蔬肉脍——按品级厚薄有差，约摸四菜一汤，算不得珍馐，却是一口热乎。',
    },
    {
      id: 'xz-6',
      actor: 'tongliao',
      actorName: '同僚·孙拾遗',
      text: '（捧起碗，压低声音）今日殿上议河湟屯田，散朝还得赶写条陈……这口热饭，真是救命。',
    },
    {
      id: 'xz-7',
      actor: 'yunque',
      text: '（凑到你案前）这规矩是谁定的呀？上朝还管饭，天下还有这等好事？',
    },
    {
      id: 'xz-8',
      actor: 'liguan',
      actorName: '光禄寺礼官',
      text: '贞观四年，太宗皇帝念百官「日出视事、日中退朝」，空腹奏事不便，诏光禄寺于朝堂外廊置食、按品供给——便是这廊下食的由来。',
    },
    {
      id: 'xz-9',
      actor: 'yunque',
      text: '（掰着手指算，忽然停住）贞观四年……那不是大明宫还没盖起来的时候吗？',
    },
    {
      id: 'xz-10',
      actor: 'liguan',
      actorName: '光禄寺礼官',
      text: '（点头赞许）使君灵醒。此制初设于太极宫的朝堂外廊；高宗以后大明宫启用，廊下食便移到了这宣政殿外廊，一沿百余年。',
    },
    {
      id: 'xz-11',
      actor: 'yunque',
      text: '（捧起羹汤喝了一口，眼睛弯起来）原来这碗饭，是从太极宫一路吃到大明宫的……（抬头看你）吃饱啦，下一站去哪儿？',
    },
    {
      id: 'xz-12',
      actor: 'narrator',
      text: '你放下食箸，回望宣政殿。开启摄像头，可在原址之上看这座中朝正殿的复原全貌。',
      action: { type: 'ar_restore', name: '宣政殿' },
    },
    {
      id: 'xz-13',
      actor: 'yunque',
      text: '（望着复原图，掌心浮起一片温润金鳞）这里曾是百司奏事、殿试册封的地方。这片「廊下鳞」，归你——吃完这顿，前面紫宸殿，才是真正与天子面对面的地方。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default xuanzheng;
