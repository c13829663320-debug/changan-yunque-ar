import { ScenePoint } from '../../types/scene';

/** 点位 3 · 大雁塔南门雁塔圣教序碑（轻剧场 · 大雁塔） */
const shengjiaobei: ScenePoint = {
  id: 'shengjiaobei',
  spotId: 'dayanta',
  index: 3,
  name: '雁塔圣教序碑',
  role: '观摩碑刻的学人',
  scaleName: '圣教鳞',
  weight: 'light',
  geo: { latitude: 34.2286, longitude: 108.9592, radius: 100 },
  bg: 'https://aka.doubaocdn.com/s/bxIAjUXxLJ',
  arRestoreImage: 'https://aka.doubaocdn.com/s/FhyHVTU6zI',
  poster: 'https://aka.doubaocdn.com/s/tzrtDSYKy9',
  intro: '永徽四年（653）褚遂良书《雁塔圣教序》，含太宗《圣教序》与太子《述圣教记》，二石嵌大雁塔底层南门两侧。',
  sourceCard: {
    title: '雁塔圣教序与褚遂良书',
    works: [
      { name: '唐太宗《大唐三藏圣教序》' },
      { name: '唐高宗为太子时《述三藏圣教序记》' },
      { name: '褚遂良书刻相关金石著录（《雁塔圣教序》）' },
    ],
    note:
      '永徽四年（653）褚遂良书《雁塔圣教序》（亦称《慈恩寺圣教序》），凡二石，含唐太宗《大唐三藏圣教序》与太子李治《述三藏圣教序记》；二石通常认为现存并嵌于大雁塔底层南门两侧（东西两龛）。此与怀仁集王羲之书《圣教序》（成碑较晚，今藏西安碑林博物馆）并非一石，切勿相混；现存位置与拓本细节以原碑与金石著录为准。',
  },
  dialogs: [
    {
      id: 'sj-1',
      audio: 'https://aka.doubaocdn.com/s/x9PcHLcUlc',
      actor: 'narrator',
      text: '永徽四年，大雁塔下。褚遂良奉旨书《大唐三藏圣教序》与《述三藏圣教记》，两碑分嵌南门东西两龛。',
      action: { type: 'look_around' },
    },
    {
      id: 'sj-2',
      actor: 'xueren',
      actorName: '访碑学人',
      text: '此二碑，一为太宗皇帝《圣教序》，一为今上为太子时所撰《述圣教记》，皆是褚河南亲书，端正雅健，唐人楷法极则。',
    },
    {
      id: 'sj-3',
      audio: 'https://aka.doubaocdn.com/s/cWzaYr5Nix',
      actor: 'yunque',
      text: '（摸着碑面）这字真好看……听说还有一块王羲之字的《圣教序》？是不是就是眼前这通呀？',
      choices: [
        {
          id: 'sj-ci-bilin',
          text: '不是，那是怀仁集王字，在碑林',
          correct: true,
          feedback: {
            actor: 'xueren',
            actorName: '访碑学人',
            text: '好眼力！眼前这通是褚遂良所书《雁塔圣教序》；怀仁集王羲之字者别为一石，今藏西安碑林，莫要混作一谈。',
          },
        },
        {
          id: 'sj-ci-ji',
          text: '是，这就是王羲之写的那通',
          correct: false,
          feedback: {
            actor: 'xueren',
            actorName: '访碑学人',
            text: '非也。眼前乃褚遂良楷书，永徽四年立；怀仁集王右军字者成碑更晚，今在碑林，两石不可混淆。',
          },
        },
      ],
    },
    {
      id: 'sj-4',
      audio: 'https://aka.doubaocdn.com/s/MV4p3S2Z05',
      actor: 'narrator',
      text: '碑刻栉风沐雨，笔意犹存。开启摄像头，可看大雁塔南门二碑复原全貌。',
      action: { type: 'ar_restore', name: '雁塔圣教序碑' },
    },
    {
      id: 'sj-5',
      audio: 'https://aka.doubaocdn.com/s/LANbxFaF5A',
      actor: 'yunque',
      text: '（掌心浮起一片金鳞）一笔一画，都是大唐的心意……这片「圣教鳞」，送给你。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default shengjiaobei;
