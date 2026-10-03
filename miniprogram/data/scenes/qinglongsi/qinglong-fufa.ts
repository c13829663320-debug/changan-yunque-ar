import { ScenePoint } from '../../types/scene';

/** 点位 4 · 祖师堂付法（重剧场 · 青龙寺） */
const qinglongFufa: ScenePoint = {
  id: 'qinglong-fufa',
  spotId: 'qinglongsi',
  index: 4,
  name: '祖师堂付法',
  role: '随空海入唐求法的请益僧',
  scaleName: '付法鳞',
  weight: 'heavy',
  geo: { latitude: 34.2369, longitude: 109.0011 },
  bg: 'https://aka.doubaocdn.com/s/nElo8pGSyI',
  arRestoreImage: 'https://aka.doubaocdn.com/s/nElo8pGSyI',
  poster: 'https://aka.doubaocdn.com/s/nElo8pGSyI',
  intro:
    '惠果知空海堪承大法，遂以真言密宗付嘱，命其归国弘通；惠果于永贞元年（805）圆寂。',
  sourceCard: {
    title: '惠果付法 · 灯灯相续',
    works: [{ name: '《御请来目录》' }],
    note:
      '惠果于青龙寺将两部大法付嘱空海，命其东归弘通，同年（永贞元年／805）圆寂。付法之事见于空海相关撰述与《御请来目录》所载法脉。',
  },
  dialogs: [
    {
      id: 'qs4-1',
      audio: 'https://aka.doubaocdn.com/s/SQfcHPR2gA',
      actor: 'narrator',
      text: '祖师堂内，夕照斜入。惠果执空海之手，作最后的付嘱。',
      action: { type: 'look_around' },
    },
    {
      id: 'qs4-2',
      actor: 'huiguo',
      actorName: '惠果阿阇梨',
      text: '我此土缘尽，不久当谢。汝宜早归，以奉国家、流布天下，使四海之内，知有此道。',
    },
    {
      id: 'qs4-3',
      actor: 'kukai',
      actorName: '空海',
      text: '弟子……谨奉师命，誓返本邦，广宣密法，不敢有怠。',
    },
    {
      id: 'qs4-4',
      audio: 'https://aka.doubaocdn.com/s/KHh29V1NS4',
      actor: 'yunque',
      text: '（眼眶微红）师父把最重的嘱托，交给了要远行的弟子……这一别，隔着整片大海呢。',
      choices: [
        {
          id: 'qs4-c1',
          text: '奉法东归，正是最好的报答',
          correct: true,
          feedback: {
            actor: 'huiguo',
            actorName: '惠果阿阇梨',
            text: '善哉。法得其人，虽远必彰。',
          },
        },
        {
          id: 'qs4-c2',
          text: '该留在长安陪伴师父',
          correct: false,
          feedback: {
            actor: 'yunque',
            text: '留下虽有情，可师父的心愿，是让法传到更远的地方去呀。',
          },
        },
      ],
    },
    {
      id: 'qs4-5',
      actor: 'narrator',
      text: 'AR 复原祖师堂付法场景。',
      action: { type: 'ar_restore', name: '祖师堂' },
    },
    {
      id: 'qs4-6',
      audio: 'https://aka.doubaocdn.com/s/vVFggHhEdY',
      actor: 'yunque',
      text: '一句嘱托，重过千钧——这片「付法鳞」，你替他带着。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default qinglongFufa;
