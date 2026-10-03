import { ScenePoint } from '../../types/scene';

/** 点位 5 · 东归·樱约（终章 · 青龙寺） */
const qinglongDonggui: ScenePoint = {
  id: 'qinglong-donggui',
  spotId: 'qinglongsi',
  index: 5,
  name: '东归·樱约',
  role: '随空海入唐求法的请益僧',
  scaleName: '东归鳞',
  weight: 'heavy',
  geo: { latitude: 34.2372, longitude: 109.0 },
  bg: 'https://aka.doubaocdn.com/s/6GiV7Ho0Xt',
  arRestoreImage: 'https://aka.doubaocdn.com/s/6GiV7Ho0Xt',
  poster: 'https://aka.doubaocdn.com/s/6GiV7Ho0Xt',
  intro:
    '空海于元和元年（806）东归日本，创真言宗、开高野山，密法遂盛于东瀛；入唐求法诸僧，多有青龙寺因缘，樱花亦成东传之约。',
  sourceCard: {
    title: '东归日本 · 真言宗开宗',
    works: [{ name: '《御请来目录》' }],
    note:
      '空海806年携经卷、法器、曼荼罗东归，后于高野山创日本真言宗；归国后献《御请来目录》，载其入唐所请法物。入唐八家中相传六家曾在青龙寺受法。',
  },
  dialogs: [
    {
      id: 'qs5-1',
      audio: 'https://aka.doubaocdn.com/s/3kbBhUAqOU',
      actor: 'narrator',
      text: '次年，帆满东风。空海携青龙寺所得两部大法、曼荼罗与法器，自明州登舟东归。',
      action: { type: 'look_around' },
    },
    {
      id: 'qs5-2',
      audio: 'https://aka.doubaocdn.com/s/4oUi7eNaiF',
      actor: 'kukai',
      actorName: '空海',
      text: '一灯能燃千灯。此去归国，当于高野山建坛，使惠果阿阇梨之法，灯灯相续于东海。',
    },
    {
      id: 'qs5-3',
      audio: 'https://aka.doubaocdn.com/s/vDVXrp81UD',
      actor: 'yunque',
      text: '（站在樱树下挥手）等你那边的樱花也开了，就会想起长安这座寺吧——法没有走散，只是去了更远的地方。',
      choices: [
        {
          id: 'qs5-c1',
          text: '西行求法、东传灯续，两全其美',
          correct: true,
          feedback: {
            actor: 'kukai',
            actorName: '空海',
            text: '沧海虽阔，法水长流。',
          },
        },
        {
          id: 'qs5-c2',
          text: '求来的法，离开中国便断了',
          correct: false,
          feedback: {
            actor: 'yunque',
            text: '不会的，传下去才是活着——你看，今天我们不还在讲这段故事吗。',
          },
        },
      ],
    },
    {
      id: 'qs5-4',
      audio: 'https://aka.doubaocdn.com/s/zAlpOm27Vz',
      actor: 'narrator',
      text: 'AR 复原樱海远眺、东归意境。',
      action: { type: 'ar_restore', name: '东归樱海' },
    },
    {
      id: 'qs5-5',
      audio: 'https://aka.doubaocdn.com/s/7vDfbwTcqi',
      actor: 'yunque',
      text: '最后一片鳞，叫「东归鳞」——集齐它，这场跨越沧海的相约，就圆满了。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default qinglongDonggui;
