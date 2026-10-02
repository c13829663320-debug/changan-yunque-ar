import { ScenePoint } from '../../types/scene';

/** 点位 6 · 麟德殿（宴饮 · 舞马百戏 · 重剧场） */
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
  bg: '/package-tour/assets/scenes/linde-restore.jpg',
  arRestoreImage: '/package-tour/assets/scenes/linde-restore.jpg',
  intro: '三殿相连的宴饮大殿，帝王在此大宴群臣、接见外宾，舞马百戏毕陈。',
  sourceCard: {
    title: '麟德殿国宴与舞马',
    works: [
      { name: '《旧唐书》' },
      { name: '何家村窖藏「鎏金舞马衔杯银壶」' },
    ],
    note: '麟德殿是大明宫主要的宴会与外事大殿，三殿相连、规模宏大。盛唐宫廷畜舞马，宴时舞马和乐起舞、至御前屈膝衔杯敬酒；何家村窖藏「鎏金舞马衔杯银壶」即其形象见证。具体史事以《旧唐书》等为准。',
  },
  dialogs: [
    { id: 'ld-1', actor: 'narrator', text: '大明宫西，麟德殿三殿相连，灯烛通明，今夜大宴群臣与外邦宾客。', action: { type: 'look_around' } },
    { id: 'ld-2', actor: 'yunque', text: '（兴奋）好热闹！三殿连在一起，比前面还大。' },
    { id: 'ld-3', actor: 'libin', actorName: '礼宾官', text: '宾客依国、依班次入座。宴有舞马、百戏，敬酒有礼。' },
    {
      id: 'ld-4', actor: 'yunque', text: '宴要开始了，我们怎么看？',
      choices: [
        {
          id: 'ld-c-seat', text: '按席位坐好，等舞马百戏', correct: true,
          feedback: { actor: 'libin', actorName: '礼宾官', text: '知礼。且看御前舞马。' },
        },
        {
          id: 'ld-c-front', text: '挤到最前面去', correct: false,
          feedback: { actor: 'libin', actorName: '礼宾官', text: '御前不可越次，请归座。' },
        },
      ],
    },
    { id: 'ld-5', actor: 'narrator', text: '乐起，几匹舞马和乐起舞，至御前屈膝、衔杯敬酒。' },
    { id: 'ld-6', actor: 'yunque', text: '（瞪大眼）马会跳舞，还会跪着敬酒！太厉害了。' },
    { id: 'ld-7', actor: 'libin', actorName: '礼宾官', text: '这是御前舞马。何家村出土的鎏金舞马衔杯银壶，铸的就是这般模样。', action: { type: 'open_source_card' } },
    { id: 'ld-8', actor: 'narrator', text: '百戏杂陈，外邦宾客满堂，盛唐气象尽在此宴。' },
    { id: 'ld-9', actor: 'narrator', text: '开启摄像头，看麟德殿三殿国宴的盛景。', action: { type: 'ar_restore', name: '麟德殿' } },
    { id: 'ld-10', actor: 'yunque', text: '盛宴相逢，也是一种长安……（金鳞）「盛宴鳞」给你。', action: { type: 'collect_scale' } },
  ],
};

export default linde;
