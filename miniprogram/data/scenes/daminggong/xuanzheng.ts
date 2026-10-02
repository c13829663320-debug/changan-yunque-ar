import { ScenePoint } from '../../types/scene';

/**
 * 点位 3 · 宣政殿「廊下食」（重剧场 · Line2）
 * 用户身份：退朝赴廊下食的常参官。
 * 史料红线：贞观四年（630）唐太宗诏光禄寺于朝堂外廊按品级供给、约四菜一汤；
 *           始设时大明宫尚未建成（634 始建、663 启用），先在太极宫，后延续至大明宫。
 * 坐标 / intro / sourceCard / 身份 / 龙鳞取值复用自 others.meta.ts（只读）。
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
      text: '朔望大朝刚散，宣政殿外廊。晨光斜过廊柱，光禄寺小吏排开食案，百官退到廊下。',
      action: { type: 'look_around' },
    },
    {
      id: 'xz-2',
      actor: 'yunque',
      expression: 'curious',
      text: '（踮脚张望）退朝了……怎么廊下摆了这么多小案子，还放着碗碗盏盏的？做什么呀？',
    },
    {
      id: 'xz-3',
      actor: 'liguan',
      actorName: '光禄寺礼官',
      text: '诸位常参官留步。退朝赐食，谓之「廊下食」——各依本品秩领案，对号入座，不得争先。',
    },
    {
      id: 'xz-4',
      actor: 'yunque',
      expression: 'curious',
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
          easterEgg: '（拍拍案沿）就该这样！吃顿饭也跟上朝似的排座次，我可不敢带你去抢近座。',
        },
      ],
    },
    {
      id: 'xz-5',
      actor: 'narrator',
      text: '食案上不过一碗白饭、一盂羹汤，再添两三样时蔬肉脍——约四菜一汤，算不得珍馐，却是口热乎。',
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
      expression: 'curious',
      text: '（凑到你案前）这规矩是谁定的呀？上朝还管饭，天下还有这等好事？',
    },
    {
      id: 'xz-8',
      actor: 'liguan',
      actorName: '光禄寺礼官',
      text: '这「廊下食」是贞观年间的旧制，说来还有一段体恤百官的缘故。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'xz-9',
      actor: 'yunque',
      expression: 'surprised',
      text: '（掰着手指算，忽然停住）贞观四年……那不是大明宫还没盖起来的时候吗？',
    },
    {
      id: 'xz-10',
      actor: 'liguan',
      actorName: '光禄寺礼官',
      text: '（点头赞许）使君灵醒。此制初设于太极宫朝堂外廊；大明宫启用后移到这宣政殿外廊，相沿百年。',
    },
    {
      id: 'xz-11',
      actor: 'yunque',
      expression: 'happy',
      text: '（捧羹汤喝一口，眼睛弯起来）原来这碗饭，从太极宫一路吃到大明宫……吃饱啦，下一站？',
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
      expression: 'happy',
      text: '（望着复原图，掌心浮起金鳞）这片「廊下鳞」归你——前面紫宸殿，才真要见天子了。走吧。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default xuanzheng;
