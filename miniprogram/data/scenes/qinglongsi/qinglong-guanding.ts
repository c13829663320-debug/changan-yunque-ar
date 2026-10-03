import { ScenePoint } from '../../types/scene';

/** 点位 2 · 东塔院灌顶坛（重剧场 · 青龙寺） */
const qinglongGuanding: ScenePoint = {
  id: 'qinglong-guanding',
  spotId: 'qinglongsi',
  index: 2,
  name: '东塔院灌顶坛',
  role: '随空海入唐求法的请益僧',
  scaleName: '灌顶鳞',
  weight: 'heavy',
  geo: { latitude: 34.2364, longitude: 109.0009 },
  bg: 'https://aka.doubaocdn.com/s/tHnjFaH1CL',
  arRestoreImage: 'https://aka.doubaocdn.com/s/tHnjFaH1CL',
  poster: 'https://aka.doubaocdn.com/s/tHnjFaH1CL',
  intro:
    '灌顶为密宗入法、得阿阇梨位的重要仪轨；空海于青龙寺从惠果受胎藏界、金刚界两部灌顶。',
  sourceCard: {
    title: '密宗灌顶 · 两部大法',
    works: [{ name: '《大日经》' }],
    note:
      '灌顶为密宗传法仪轨，弟子入坛、受印可，方得传授。空海在青龙寺先后受胎藏界、金刚界两部灌顶，为惠果印可的传法弟子。仪轨以《大日经》等密典为据。',
  },
  dialogs: [
    {
      id: 'qs2-1',
      audio: 'https://aka.doubaocdn.com/s/BmqhVUvC33',
      actor: 'narrator',
      text: '东塔院坛场庄严，香炉供灯，华鬘垂覆。惠果阿阇梨升座，将为空海授密宗灌顶。',
      action: { type: 'look_around' },
    },
    {
      id: 'qs2-2',
      audio: 'https://aka.doubaocdn.com/s/ieJLhR8SMh',
      actor: 'huiguo',
      actorName: '惠果阿阇梨',
      text: '汝远涉沧溟而来，因缘不浅。今为汝授两部灌顶——自今而后，当护持密法，莫令断绝。',
    },
    {
      id: 'qs2-3',
      audio: 'https://aka.doubaocdn.com/s/WVypriXTi3',
      actor: 'yunque',
      text: '（小声）坛上洒水、结印、念诵，这是师父把法正式传给弟子的仪式……你看空海师父，神情多郑重。',
      choices: [
        {
          id: 'qs2-c1',
          text: '灌顶＝传法印可，须恭敬受持',
          correct: true,
          feedback: {
            actor: 'huiguo',
            actorName: '惠果阿阇梨',
            text: '如是。法付其人，方得灯灯相续。',
          },
        },
        {
          id: 'qs2-c2',
          text: '不过是洒水的形式罢了',
          correct: false,
          feedback: {
            actor: 'yunque',
            text: '才不是形式呢，对求法的人，这是把一生的信仰都接了过来。',
          },
        },
      ],
    },
    {
      id: 'qs2-4',
      audio: 'https://aka.doubaocdn.com/s/eCyq7AXz1d',
      actor: 'narrator',
      text: 'AR 复原唐代密宗灌顶坛场布置。',
      action: { type: 'ar_restore', name: '灌顶坛场' },
    },
    {
      id: 'qs2-5',
      audio: 'https://aka.doubaocdn.com/s/VmRiyckTpJ',
      actor: 'yunque',
      text: '金铃一响，法便入了心——这片「灌顶鳞」，替你记下这一刻。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default qinglongGuanding;
