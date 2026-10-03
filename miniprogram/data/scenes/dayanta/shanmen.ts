import { ScenePoint } from '../../types/scene';

/** 点位 1 · 大慈恩寺山门（重剧场 · 大雁塔） */
const shanmen: ScenePoint = {
  id: 'shanmen',
  spotId: 'dayanta',
  index: 1,
  name: '大慈恩寺山门',
  role: '入寺瞻礼的士子',
  scaleName: '初谒鳞',
  weight: 'heavy',
  geo: { latitude: 34.2287, longitude: 108.9587, radius: 120 },
  bg: 'https://aka.doubaocdn.com/s/DzB4CYftdF',
  arRestoreImage: 'https://aka.doubaocdn.com/s/SU0BB3ZRre',
  poster: 'https://aka.doubaocdn.com/s/nHs6fMmHY9',
  intro: '大慈恩寺建于唐贞观二十二年（648），太子李治为追念生母文德皇后而建，玄奘法师首任上座。',
  sourceCard: {
    title: '大慈恩寺与太子追福',
    works: [
      { name: '《大慈恩寺三藏法师传》（慧立、彦悰）' },
      { name: '《旧唐书·玄奘传》' },
      { name: '《唐会要》' },
    ],
    note:
      '大慈恩寺建于唐贞观二十二年（648），时为太子的李治（后为唐高宗）为追念生母文德皇后长孙氏而建，取“慈恩”追福之意，玄奘法师首任上座，寺址在长安晋昌坊。始建年代与首任上座等以原典为准。',
  },
  dialogs: [
    {
      id: 'sm-1',
      audio: 'https://aka.doubaocdn.com/s/e1yy7F81Ob',
      actor: 'narrator',
      text: '贞观二十二年，冬。太子李治为追念生母文德皇后，于长安晋昌坊建大慈恩寺。你随士子步入山门，幡影廊庑，塔影初现。',
      action: { type: 'look_around' },
    },
    {
      id: 'sm-2',
      actor: 'seng',
      actorName: '知客僧',
      text: '施主远来瞻礼。此寺乃东宫为追福文德皇后所立，寺名取“慈恩”之意，玄奘法师今为上座，领众栖止。',
    },
    {
      id: 'sm-3',
      audio: 'https://aka.doubaocdn.com/s/5PQStfii35',
      actor: 'yunque',
      text: '（仰头）好大的山门……他们说这座寺，是太子为纪念母亲建的，所以叫“慈恩”——这“慈”，是什么意思呀？',
      choices: [
        {
          id: 'sm-c-ci',
          text: '慈母之恩，追念亡母',
          correct: true,
          feedback: {
            actor: 'seng',
            actorName: '知客僧',
            text: '正是。“慈恩”者，追思慈母罔极之恩也，殿下一片孝思，尽在此二字。',
          },
        },
        {
          id: 'sm-c-bei',
          text: '慈悲为怀，普度众生',
          correct: false,
          feedback: {
            actor: 'seng',
            actorName: '知客僧',
            text: '广义虽是慈悲，然此寺得名，特指太子追念文德皇后之慈恩，施主切不可望文生义。',
          },
        },
      ],
    },
    {
      id: 'sm-4',
      audio: 'https://aka.doubaocdn.com/s/1U6bwDpIIm',
      actor: 'narrator',
      text: '穿过前殿，寺宇重重。开启摄像头，可在原址之上，看大慈恩寺山门与僧院复原全貌。',
      action: { type: 'ar_restore', name: '大慈恩寺山门' },
    },
    {
      id: 'sm-5',
      audio: 'https://aka.doubaocdn.com/s/Bs7hrcxuGt',
      actor: 'yunque',
      text: '（掌心浮起一片金鳞）原来“慈恩”，是儿子想妈妈呀……这片「初谒鳞」，送给你。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default shanmen;
