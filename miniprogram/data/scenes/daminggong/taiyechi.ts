import { ScenePoint } from '../../types/scene';

/** 点位 5 · 太液池（后寝 · 一池三山 · 重剧场） */
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
  bg: '/package-tour/assets/scenes/taiyechi-restore.jpg',
  arRestoreImage: '/package-tour/assets/scenes/taiyechi-restore.jpg',
  intro: '后寝中心，一池三山、蓬莱在望，是皇家游宴赋诗之所。',
  sourceCard: {
    title: '太液池与蓬莱仙山',
    works: [{ name: '《唐六典》' }, { name: '唐代宫苑题材唐诗' }],
    note: '太液池为大明宫北部后寝的中心园林，池中筑蓬莱、方丈、瀛洲仙山，取法秦汉「一池三山」之制，为皇家游宴、临池赋诗之所。具体建置以《唐六典》等为准。',
  },
  dialogs: [
    { id: 'tyc-1', actor: 'narrator', text: '大明宫北部，太液池碧波千顷，蓬莱仙山立于水烟之间。', action: { type: 'look_around' } },
    { id: 'tyc-2', actor: 'yunque', text: '（深吸气）好舒服……前面都是朝堂，这里像另一个世界。' },
    { id: 'tyc-3', actor: 'gongren', actorName: '掌舟宫人', text: '贵人泛舟，蓬莱、方丈、瀛洲三山在望，请登舟。' },
    {
      id: 'tyc-4', actor: 'yunque', text: '我们怎么游？',
      choices: [
        {
          id: 'tyc-c-boat', text: '登舟泛池，绕蓬莱山而行', correct: true,
          feedback: { actor: 'gongren', actorName: '掌舟宫人', text: '好兴致。一池三山，是秦汉以来的旧法。' },
        },
        {
          id: 'tyc-c-bank', text: '在岸边跑着看', correct: false,
          feedback: { actor: 'gongren', actorName: '掌舟宫人', text: '岸滑水阔，还是登舟稳妥。' },
        },
      ],
    },
    { id: 'tyc-5', actor: 'yunque', text: '（望山）在水里筑三座仙山……是想把海上的仙境，搬进皇宫里呀。' },
    { id: 'tyc-6', actor: 'shichen', actorName: '随游侍臣', text: '太液池边，常是皇家游宴、临池赋诗的地方。', action: { type: 'open_source_card' } },
    { id: 'tyc-7', actor: 'yunque', text: '（忽然出神，轻声）这么美的地方……我却好像，看见了它日后荒芜的样子。' },
    { id: 'tyc-8', actor: 'narrator', text: '开启摄像头，看太液池一池三山的盛景。', action: { type: 'ar_restore', name: '太液池' } },
    { id: 'tyc-9', actor: 'yunque', text: '美景易逝，更要记得此刻……（金鳞）「池苑鳞」给你。', action: { type: 'collect_scale' } },
  ],
};

export default taiyechi;
