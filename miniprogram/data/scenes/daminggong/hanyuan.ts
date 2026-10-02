import { ScenePoint } from '../../types/scene';

/** 点位 2 · 含元殿（外朝 · 大朝会 · 重剧场） */
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
  bg: '/package-tour/assets/scenes/hanyuan-restore.jpg',
  arRestoreImage: '/package-tour/assets/scenes/hanyuan-restore.jpg',
  intro: '外朝正殿，龙尾道三折而上，元旦、冬至大朝会于此，王维写「万国衣冠拜冕旒」。',
  sourceCard: {
    title: '含元殿与大朝会',
    works: [
      { name: '王维《和贾舍人早朝大明宫之作》', quote: '九天阊阖开宫殿，万国衣冠拜冕旒。' },
      { name: '《唐六典》' },
      { name: '《旧唐书》' },
    ],
    note: '含元殿为大明宫外朝正殿，殿基踞龙首原高地，以龙尾道三折登临，举行元旦、冬至大朝会，立于殿上可俯瞰长安。具体仪制以《唐六典》等原典为准。',
  },
  dialogs: [
    { id: 'hy-1', actor: 'narrator', text: '你随百官登上龙尾道，三折而上，殿基高耸，仿佛入云。', action: { type: 'look_around' } },
    { id: 'hy-2', actor: 'yunque', text: '（喘气）这坡道好长……叫「龙尾道」？我们爬了好高呀。' },
    { id: 'hy-3', actor: 'dianyi', actorName: '典仪官', text: '百官、外邦使依班列序立！钟鼓一响，山呼起舞，不得失仪！' },
    {
      id: 'hy-4', actor: 'yunque', text: '朝会要开始了，我们该怎么做？',
      choices: [
        {
          id: 'hy-c-bai', text: '随前面的官员山呼、再依礼起舞', correct: true,
          feedback: { actor: 'dianyi', actorName: '典仪官', text: '合礼。万国衣冠，同此一拜。' },
        },
        {
          id: 'hy-c-still', text: '站着不动，东张西望', correct: false,
          feedback: { actor: 'dianyi', actorName: '典仪官', text: '使臣何故不拜？失仪了，快随众山呼！' },
        },
      ],
    },
    { id: 'hy-5', actor: 'narrator', text: '钟鼓齐鸣，含元殿前百官与万国使臣齐齐山呼，声动云霄。' },
    { id: 'hy-6', actor: 'yunque', text: '（踮脚俯瞰）你看！从这里能看见整个长安，一百零八坊像棋盘一样铺开。' },
    { id: 'hy-7', actor: 'narrator', text: '王维有诗：「九天阊阖开宫殿，万国衣冠拜冕旒」。', action: { type: 'open_source_card' } },
    { id: 'hy-8', actor: 'narrator', text: '开启摄像头，可在原址上看含元殿与龙尾道复原全貌。', action: { type: 'ar_restore', name: '含元殿' } },
    { id: 'hy-9', actor: 'yunque', text: '大朝会的气势……（掌心浮起金鳞）这片「朝会鳞」，送给你。', action: { type: 'collect_scale' } },
  ],
};

export default hanyuan;
