import { ScenePoint } from '../../types/scene';

/** 点位 4 · 紫宸殿（内朝 · 入閤召对 · 重剧场） */
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
  bg: '/package-tour/assets/scenes/zichen-restore.jpg',
  arRestoreImage: '/package-tour/assets/scenes/zichen-restore.jpg',
  intro: '内朝正殿，群臣「入閤」，君臣近距离议政；晚唐权力暗流在此涌动。',
  sourceCard: {
    title: '紫宸殿「入閤」与内朝',
    works: [{ name: '《唐六典》' }, { name: '《旧唐书》' }],
    note: '紫宸殿为内朝正殿，群臣于此「入閤」朝见、日常召对，君臣距离较近。晚唐宦官掌禁军、预枢密，权势渐重，终有甘露之变（835年）。此为后话，具体史事以《旧唐书》《资治通鉴》为准。',
  },
  dialogs: [
    { id: 'zc-1', actor: 'narrator', text: '你由内侍引路「入閤」。紫宸殿内只余近臣，比前殿安静许多。', action: { type: 'look_around' } },
    { id: 'zc-2', actor: 'yunque', text: '（小声）这里人好少……前面是大朝会，这里倒像私下说话。' },
    { id: 'zc-3', actor: 'neishi', actorName: '引路内侍', text: '（垂手）大家召对，近臣依次入閤奏事，闲人退避。' },
    {
      id: 'zc-4', actor: 'yunque', text: '那个一直站在角落的人……是谁呀？',
      choices: [
        {
          id: 'zc-c-ask', text: '小声问引路内侍', correct: true,
          feedback: { actor: 'neishi', actorName: '引路内侍', text: '（低声）是掌枢密的中官。内朝事，近来多经其手。' },
        },
        {
          id: 'zc-c-talk', text: '直接走过去搭话', correct: false,
          feedback: { actor: 'neishi', actorName: '引路内侍', text: '（拦）不可。内臣不与外官私语，失仪了。' },
        },
      ],
    },
    { id: 'zc-5', actor: 'narrator', text: '紫宸殿是内朝正殿，君臣在此近距离议政，称作「入閤」。' },
    { id: 'zc-6', actor: 'yunque', text: '他们离皇帝好近……（皱眉）我有点说不上来的不安。', action: { type: 'open_source_card' } },
    { id: 'zc-7', actor: 'narrator', text: '晚唐宦官掌禁军、预机密，终酿成甘露之变——此为后话。' },
    { id: 'zc-8', actor: 'narrator', text: '开启摄像头，看紫宸殿内朝召对的场景。', action: { type: 'ar_restore', name: '紫宸殿' } },
    { id: 'zc-9', actor: 'yunque', text: '盛世里也藏着暗影……（金鳞）「召对鳞」，替我收好。', action: { type: 'collect_scale' } },
  ],
};

export default zichen;
