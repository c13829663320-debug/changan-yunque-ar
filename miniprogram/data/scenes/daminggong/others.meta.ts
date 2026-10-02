import { ScenePoint } from '../../types/scene';

/**
 * 其余 6 点位元数据（M0）
 * 每点位已含：身份 / 龙鳞 / 轻重 / 现场坐标 / 史料卡骨架 / 引导剧情
 * M1 由剧场分片把 dialogs 扩充为完整重剧场（坐标需现场实测校准）
 */

const hanyuan: ScenePoint = {
  id: 'hanyuan',
  spotId: 'daminggong',
  index: 2,
  name: '含元殿',
  role: '大朝会的官员/外邦使臣',
  scaleName: '朝会鳞',
  weight: 'heavy',
  geo: { latitude: 34.2852, longitude: 108.9634, radius: 120 },
  markerImage: 'markers/hanyuan.png',
  arModel: 'models/hanyuan.glb',
  intro: '外朝正殿，龙尾道三折而上，元旦、冬至大朝会于此，王维写「万国衣冠拜冕旒」。',
  sourceCard: {
    title: '含元殿与大朝会',
    works: [
      { name: '王维《和贾舍人早朝大明宫之作》', quote: '九天阊阖开宫殿，万国衣冠拜冕旒。' },
      { name: '《唐六典》' },
      { name: '《旧唐书》' },
    ],
    note: '含元殿为大明宫外朝正殿，殿基踞龙首原高地，以龙尾道登临，举行元旦、冬至大朝会，立于殿上可俯瞰长安。',
  },
  dialogs: [
    { id: 'hy-1', actor: 'narrator', text: '【M1解锁】你登龙尾道、依班列而立，钟鼓奏响，万国使臣依次朝拜……', action: { type: 'look_around' } },
    { id: 'hy-2', actor: 'yunque', text: '（仰头）这么高的台基……原来大朝会，是这样的景象。' },
  ],
};

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
    { id: 'xz-1', actor: 'narrator', text: '【M1解锁】朝会散去，光禄寺小吏在廊下排开案席，百官凭品级领食……', action: { type: 'look_around' } },
    { id: 'xz-2', actor: 'yunque', text: '（惊讶）上朝……还管饭？我也想尝尝。' },
  ],
};

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
  intro: '内朝正殿，群臣「入閤」，君臣近距离议政；晚唐权力暗流在此涌动。',
  sourceCard: {
    title: '紫宸殿「入閤」与内朝',
    works: [{ name: '《唐六典》' }, { name: '《旧唐书》' }],
    note: '紫宸殿为内朝正殿，群臣于此「入閤」朝见、日常召对。晚唐宦官权势渐重，终有甘露之变（835年）。',
  },
  dialogs: [
    { id: 'zc-1', actor: 'narrator', text: '【M1解锁】你入閤奏对，殿内只余近臣；廊下一角，一名宦官垂手而立……', action: { type: 'look_around' } },
    { id: 'zc-2', actor: 'yunque', text: '（小声）那个人……是谁？这里的气氛，好像和前面不一样。' },
  ],
};

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
  intro: '后寝中心，一池三山、蓬莱在望，是皇家游宴赋诗之所。',
  sourceCard: {
    title: '太液池与蓬莱仙山',
    works: [{ name: '《唐六典》' }, { name: '唐代宫苑题材唐诗' }],
    note: '太液池为大明宫北部后寝的中心园林，池中筑蓬莱等仙山，取法秦汉一池三山，为皇家游宴、临池赋诗之所。',
  },
  dialogs: [
    { id: 'tyc-1', actor: 'narrator', text: '【M1解锁】你泛舟太液池，蓬莱山在水烟之间，微风拂过，云阙却忽然出神……', action: { type: 'look_around' } },
    { id: 'tyc-2', actor: 'yunque', text: '（轻声）这么美的地方……我却好像，看见了它以后的样子。' },
  ],
};

const linde: ScenePoint = {
  id: 'linde',
  spotId: 'daminggong',
  index: 6,
  name: '麟德殿',
  role: '国宴宾客/外邦使节',
  scaleName: '盛宴鳞',
  weight: 'heavy',
  geo: { latitude: 34.2921, longitude: 108.9528, radius: 140 },
  markerImage: 'markers/linde.png',
  arModel: 'models/linde.glb',
  intro: '三殿相连的宴饮大殿，帝王在此大宴群臣、接见外宾，舞马百戏毕陈。',
  sourceCard: {
    title: '麟德殿国宴与舞马',
    works: [
      { name: '《旧唐书》' },
      { name: '何家村窖藏「鎏金舞马衔杯银壶」' },
    ],
    note: '麟德殿是大明宫主要的宴会与外事大殿，三殿相连，规模宏大。盛唐宫廷养舞马，宴时舞马跪拜衔杯敬酒，何家村窖藏鎏金舞马衔杯银壶即其形象见证。',
  },
  dialogs: [
    { id: 'ld-1', actor: 'narrator', text: '【M1解锁】三殿灯烛通明，舞马和乐起舞、屈膝衔杯，外邦宾客满堂……', action: { type: 'look_around' } },
    { id: 'ld-2', actor: 'yunque', text: '（兴奋）马……马会跳舞还会敬酒？快走快走，我们去前排看！' },
  ],
};

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
  intro: '大明宫北门。云阙在此辨明「玄武门之变」的误会，集齐七鳞，投龙祈愿。',
  sourceCard: {
    title: '玄武门之变辨 · 投龙祈愿',
    works: [
      { name: '《旧唐书·太宗本纪》' },
      { name: '《资治通鉴》' },
      { name: '唐代投龙仪式与赤金走龙相关资料' },
    ],
    note:
      '武德九年（626）的玄武门之变，发生在太极宫北门玄武门，并非大明宫的玄武门；大明宫始建于634年。云阙在此纠偏常见误解，并依唐代「投龙」仪式，与你投龙简、许当下愿，集齐七片龙鳞，唤起身世、呼唤失散同伴。',
  },
  dialogs: [
    { id: 'xwm-1', actor: 'narrator', text: '【M1解锁】北门城垣之上，云阙停下脚步，回头望你……', action: { type: 'look_around' } },
    { id: 'xwm-2', actor: 'yunque', text: '很多人以为那场政变发生在我脚下这座门——其实它在太极宫那座玄武门。（摊开掌心）七片龙鳞，都齐了。' },
  ],
};

export const otherScenes: ScenePoint[] = [
  hanyuan,
  xuanzheng,
  zichen,
  taiyechi,
  linde,
  xuanwumen,
];
