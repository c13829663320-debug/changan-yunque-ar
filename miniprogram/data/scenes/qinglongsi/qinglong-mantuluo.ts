import { ScenePoint } from '../../types/scene';

/** 点位 3 · 大日殿曼荼罗道场（重剧场 · 青龙寺） */
const qinglongMantuluo: ScenePoint = {
  id: 'qinglong-mantuluo',
  spotId: 'qinglongsi',
  index: 3,
  name: '大日殿曼荼罗道场',
  role: '随空海入唐求法的请益僧',
  scaleName: '曼荼鳞',
  weight: 'heavy',
  geo: { latitude: 34.2361, longitude: 109.0004 },
  bg: 'https://aka.doubaocdn.com/s/fLwgO701r9',
  arRestoreImage: 'https://aka.doubaocdn.com/s/fLwgO701r9',
  poster: 'https://aka.doubaocdn.com/s/fLwgO701r9',
  intro:
    '曼荼罗为密宗诸佛菩萨依德相排布的坛城；青龙寺道场供奉胎藏界、金刚界两部曼荼罗，以金刚铃杵等法器行法。',
  sourceCard: {
    title: '曼荼罗 · 开元三大士',
    works: [{ name: '《大日经》' }],
    note:
      '曼荼罗（曼陀罗）为密宗坛场，以图像表诸佛德相与法界秩序。唐开元间善无畏、金刚智、不空「三大士」传来密法，惠果承不空之学，于青龙寺弘两部曼荼罗。',
  },
  dialogs: [
    {
      id: 'qs3-1',
      audio: 'https://aka.doubaocdn.com/s/vTOYVIoHmE',
      actor: 'narrator',
      text: '大日殿中，曼荼罗悬于正壁，大日如来居中，诸尊环列；供灯长明，铃杵在案。',
      action: { type: 'look_around' },
    },
    {
      id: 'qs3-2',
      actor: 'kukai',
      actorName: '空海',
      text: '此曼荼罗，胎藏界表理、金刚界表智，理智两部，合而为一——弟子当绘图以归，使此法东传。',
    },
    {
      id: 'qs3-3',
      audio: 'https://aka.doubaocdn.com/s/wBVViuYLZC',
      actor: 'yunque',
      text: '（仰头看图）这么多佛菩萨各有方位，像把整个宇宙的秩序都画了下来……案上那铃和杵，又是做什么的？',
      choices: [
        {
          id: 'qs3-c1',
          text: '铃表智慧、杵表菩提，行法法器',
          correct: true,
          feedback: {
            actor: 'kukai',
            actorName: '空海',
            text: '正是。铃杵相应，如理智不二。',
          },
        },
        {
          id: 'qs3-c2',
          text: '只是贵重的摆设',
          correct: false,
          feedback: {
            actor: 'yunque',
            text: '不对哦，每一件法器在行法时都有含义，不是摆着看的。',
          },
        },
      ],
    },
    {
      id: 'qs3-4',
      actor: 'narrator',
      text: 'AR 复原大日殿与两部曼荼罗。',
      action: { type: 'ar_restore', name: '曼荼罗道场' },
    },
    {
      id: 'qs3-5',
      audio: 'https://aka.doubaocdn.com/s/1YPuBtLSJW',
      actor: 'yunque',
      text: '佛国的图样在眼前亮起来——这片「曼荼鳞」，收好了。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default qinglongMantuluo;
