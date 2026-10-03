import { ScenePoint } from '../../types/scene';

/** 点位 2 · 大慈恩寺翻经院译场（重剧场 · 大雁塔） */
const yichang: ScenePoint = {
  id: 'yichang',
  spotId: 'dayanta',
  index: 2,
  name: '大慈恩寺翻经院',
  role: '译场笔受的僧人',
  scaleName: '翻经鳞',
  weight: 'heavy',
  geo: { latitude: 34.2284, longitude: 108.959, radius: 100 },
  bg: 'https://aka.doubaocdn.com/s/l6LJN66ujx',
  arRestoreImage: 'https://aka.doubaocdn.com/s/AD1CGUbs0f',
  poster: 'https://aka.doubaocdn.com/s/z4G5htrA04',
  intro: '玄奘主持大慈恩寺翻经院译场，分工谨严；《大唐西域记》由玄奘口述、辩机笔受。',
  sourceCard: {
    title: '大慈恩寺翻经院与译场',
    works: [
      { name: '《大慈恩寺三藏法师传》' },
      { name: '《大唐西域记》（玄奘口述、辩机笔受）' },
      { name: '《开元释教录》' },
    ],
    note:
      '玄奘主持大慈恩寺翻经院译场，分工谨严，有译主、笔受、证梵（证梵本）、缀文、刊定等职。《大唐西域记》十二卷，玄奘口述、辩机笔受，贞观二十年（646）成书。据《开元释教录》，玄奘二十年间译出大小乘经律论合七十五部、一千三百三十五卷；诸家统计卷帙略有出入，以原典为准。',
  },
  dialogs: [
    {
      id: 'yc-1',
      audio: 'https://aka.doubaocdn.com/s/CYUFZy9Vio',
      actor: 'narrator',
      text: '大慈恩寺翻经院，梵贝满案。玄奘法师于此开设译场，广聚天下名僧，分工极严。',
      action: { type: 'look_around' },
    },
    {
      id: 'yc-2',
      actor: 'benshou',
      actorName: '笔受沙门',
      text: '译主玄奘法师口宣梵意，我等笔受汉文；更有证梵本、缀文、刊定诸职，一字一句反复校勘，方可流传。',
    },
    {
      id: 'yc-3',
      audio: 'https://aka.doubaocdn.com/s/sIrVkUIojL',
      actor: 'yunque',
      text: '（捧着一卷贝叶）这么多经书……听说法师还写了一本记旅途见闻的书？是谁帮他写下来的呀？',
      choices: [
        {
          id: 'yc-c-bianji',
          text: '玄奘口述，辩机笔受',
          correct: true,
          feedback: {
            actor: 'benshou',
            actorName: '笔受沙门',
            text: '正是。《大唐西域记》十二卷，贞观二十年成书，法师口述西域诸国见闻，辩机沙门笔受编录。',
          },
        },
        {
          id: 'yc-c-zizhuan',
          text: '玄奘法师亲笔撰写',
          correct: false,
          feedback: {
            actor: 'benshou',
            actorName: '笔受沙门',
            text: '非也。此书乃法师口述、辩机笔受而成，意在亲记身历百国，非伏案独撰。',
          },
        },
      ],
    },
    {
      id: 'yc-4',
      audio: 'https://aka.doubaocdn.com/s/3U4PPwWGsw',
      actor: 'narrator',
      text: '案头贝叶经与译场，皆是当年盛景。开启摄像头，可看大慈恩寺翻经院复原全貌。',
      action: { type: 'ar_restore', name: '大慈恩寺翻经院' },
    },
    {
      id: 'yc-5',
      audio: 'https://aka.doubaocdn.com/s/XiFovGUnjs',
      actor: 'yunque',
      text: '（掌心浮起一片金鳞）一个字一个字，都校对了好多年……这片「翻经鳞」，送给你。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default yichang;
