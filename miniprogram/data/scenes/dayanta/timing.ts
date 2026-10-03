import { ScenePoint } from '../../types/scene';

/**
 * 点位 4 · 雁塔题名（重剧场）
 * 身份：新科进士；龙鳞：登科鳞
 * 闭环：look_around → choices(题名举止正误) → ar_restore(大慈恩寺复原) → open_source_card(史料卡) → collect_scale
 */
const timing: ScenePoint = {
  id: 'timing',
  spotId: 'dayanta',
  index: 4,
  name: '雁塔题名',
  role: '新科进士',
  scaleName: '登科鳞',
  weight: 'heavy',
  geo: { latitude: 34.2287, longitude: 108.9596, radius: 100 },
  bg: 'https://aka.doubaocdn.com/s/HiDoizhVxk',
  arRestoreImage: 'https://aka.doubaocdn.com/s/WVG2YtIceP',
  restoreVideo: 'https://aka.doubaocdn.com/s/AvAzGYxoZl',
  poster: 'https://aka.doubaocdn.com/s/7xX16L0cug',
  intro: '新科进士曲江赐宴后，同至大慈恩寺塔下题名留姓——这便是千年传为佳话的“雁塔题名”。',
  sourceCard: {
    title: '雁塔题名与塔之沿革',
    works: [
      { name: '王定保《唐摭言》' },
      { name: '白居易《慈恩塔下题名》', quote: '慈恩塔下题名处，十七人中最少年。' },
      { name: '徐松《登科记考》' },
    ],
    note:
      '唐代新科进士曲江赐宴后，例至大慈恩寺塔下题名，称“雁塔题名”。塔之沿革：永徽三年（652）玄奘奏建五层，武周长安年间（701—704）改建为七层，现存七层为明代包砖、通高约六十四米。白居易贞元十六年（800）及第，同榜十七人，有“慈恩塔下题名处，十七人中最少年”之句；其及第年龄诸书所记略有异同，年龄从慎，以原典为准。',
  },
  dialogs: [
    {
      id: 'tmg-1',
      audio: 'https://aka.doubaocdn.com/s/29u0pEGsVe',
      actor: 'narrator',
      text: '春放榜后，曲江宴罢。你随新科进士步入大慈恩寺，塔影高耸，壁间已留前贤题名。',
      action: { type: 'look_around' },
    },
    {
      id: 'tmg-2',
      audio: 'https://aka.doubaocdn.com/s/bbQgwdc7DI',
      actor: 'yunque',
      text: '（仰脸望塔）这里就是大雁塔啦！新科进士们要在塔下题名，把自己的名字写上——这就叫“雁塔题名”。',
    },
    {
      id: 'tmg-3',
      actor: 'zhuguan',
      actorName: '题名官',
      text: '（整衣而立）今日新科进士题名，须依年齿名次，敬录姓名、乡贯于塔壁；字宜端楷，不得争前恐后、喧乱题名之所。',
      choices: [
        {
          id: 'tmg-c-li',
          text: '依年齿名次，在壁上端楷敬录姓名与乡贯',
          correct: true,
          feedback: {
            actor: 'zhuguan',
            actorName: '题名官',
            text: '（颔首）好。题名所以旌别才俊、昭示后来，端敬如此，方不负十年寒窗。',
          },
        },
        {
          id: 'tmg-c-zhuang',
          text: '抢在最显眼处，大书自己姓名压倒众人',
          correct: false,
          feedback: {
            actor: 'zhuguan',
            actorName: '题名官',
            text: '（低声制止）站住！题名乃斯文盛事，非争名之地。退后，依名次来。',
          },
        },
      ],
    },
    {
      id: 'tmg-4',
      audio: 'https://aka.doubaocdn.com/s/HLcOZtUQlG',
      actor: 'narrator',
      text: '开启AR复原，可看盛唐大慈恩寺与七层雁塔的全貌。唐时新科进士曲江宴后皆来塔下题名；白居易及第时同榜十七人，于塔下题云：“慈恩塔下题名处，十七人中最少年。”',
      action: { type: 'ar_restore', name: '大慈恩寺' },
    },
    {
      id: 'tmg-5',
      actor: 'narrator',
      text: '这“雁塔题名”之制，见载于《唐摭言》《登科记考》；白居易那句“十七人中最少年”，更是千古传诵。可点开史料卡一观。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'tmg-6',
      audio: 'https://aka.doubaocdn.com/s/ItAFClKUpV',
      actor: 'yunque',
      text: '（掌心浮起一片金鳞）十七人中最少年……真好呀。这片“登科鳞”送给你，愿你也金榜题名。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default timing;
