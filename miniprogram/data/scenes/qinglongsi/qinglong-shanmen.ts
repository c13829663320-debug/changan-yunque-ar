import { ScenePoint } from '../../types/scene';

/** 点位 1 · 青龙寺山门·樱影（重剧场 · 青龙寺） */
const qinglongShanmen: ScenePoint = {
  id: 'qinglong-shanmen',
  spotId: 'qinglongsi',
  index: 1,
  name: '青龙寺山门·樱影',
  role: '随空海入唐求法的请益僧',
  scaleName: '寻师鳞',
  weight: 'heavy',
  geo: { latitude: 34.2367, longitude: 109.0006, radius: 120 },
  bg: 'https://aka.doubaocdn.com/s/LNnpaXEMdv',
  arRestoreImage: 'https://aka.doubaocdn.com/s/LNnpaXEMdv',
  poster: 'https://aka.doubaocdn.com/s/LNnpaXEMdv',
  intro:
    '青龙寺在唐长安新昌坊，隋开皇二年（582）始建，初名灵感寺，唐景云二年（711）改名青龙寺，是唐代密宗名刹；春日樱花满庭。',
  sourceCard: {
    title: '青龙寺沿革 · 新昌坊',
    works: [{ name: '《长安志》' }],
    note:
      '青龙寺在长安新昌坊，前身灵感寺，隋开皇二年（582）建；龙朔二年复为观音寺，景云二年（711）改名青龙寺；北宋以后渐废，遗址1963年起勘查、1973年发掘。沿革以《长安志》及考古报告为准。',
  },
  dialogs: [
    {
      id: 'qs1-1',
      audio: 'https://aka.doubaocdn.com/s/sVyYK5JGtx',
      actor: 'narrator',
      text: '贞元二十年，春。你随日本学问僧空海的使船渡海入唐，辗转来到长安新昌坊——青龙寺的樱花开得正盛，山门半掩，钟磬隐隐。',
      action: { type: 'look_around' },
    },
    {
      id: 'qs1-2',
      audio: 'https://aka.doubaocdn.com/s/QEp5h4rAHO',
      actor: 'kukai',
      actorName: '空海',
      text: '贫僧空海，自日本国来，为求无上密法。闻青龙寺惠果阿阇梨，得不空大师真传，特来拜谒。',
    },
    {
      id: 'qs1-3',
      audio: 'https://aka.doubaocdn.com/s/wfsHbZoHEp',
      actor: 'yunque',
      text: '（从樱树后探出头）你们也是来找惠果师父的吗？好多从海那边来的师父，都在这座寺里学法——这满院樱花，年年都在等远来的人呢。',
      choices: [
        {
          id: 'qs1-c1',
          text: '先整衣礼拜，再入寺求见',
          correct: true,
          feedback: {
            actor: 'kukai',
            actorName: '空海',
            text: '善。入他宗之门，当先存恭敬。',
          },
        },
        {
          id: 'qs1-c2',
          text: '既是名寺，径直闯入便是',
          correct: false,
          feedback: {
            actor: 'yunque',
            text: '哎呀，山门也是有规矩的，拜师求法，得先整衣敛心才是。',
          },
        },
      ],
    },
    {
      id: 'qs1-4',
      audio: 'https://aka.doubaocdn.com/s/fYHgVI8UbC',
      actor: 'narrator',
      text: '开启 AR，可看唐时青龙寺山门与樱庭复原全貌。',
      action: { type: 'ar_restore', name: '青龙寺山门' },
    },
    {
      id: 'qs1-5',
      audio: 'https://aka.doubaocdn.com/s/eYgU7WKgVr',
      actor: 'yunque',
      text: '（掌心托起一片金鳞）跨过这道山门，求法的路便开始了——这片「寻师鳞」，送给你。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default qinglongShanmen;
