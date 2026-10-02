import { ScenePoint } from '../../types/scene';

/**
 * 点位 6 · 麟德殿（重剧场）
 * 身份：国宴宾客/外邦使节；龙鳞：盛宴鳞
 * 闭环：look_around → choices(敬酒礼节/座次) → ar_restore(宴饮舞马) → open_source_card → collect_scale
 */
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
  bg: '/package-tour/assets/scenes/linde/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/linde/ar-restore.jpg',
  intro: '三殿相连的宴饮大殿，帝王在此大宴群臣、接见外宾，舞马百戏毕陈。',
  sourceCard: {
    title: '麟德殿国宴与舞马',
    works: [
      { name: '《旧唐书》' },
      { name: '何家村窖藏「鎏金舞马衔杯银壶」' },
    ],
    note: '麟德殿是大明宫主要的宴会与外事大殿，三殿相连，规模宏大。盛唐宫廷养舞马，宴时舞马跪拜衔杯敬酒，何家村窖藏鎏金舞马衔杯银壶即其形象见证。',
  },
  dialogs: [
    {
      id: 'ld-1',
      actor: 'narrator',
      text: '夜色如墨，你随众宾客步入麟德殿。前、中、后三殿相连，灯烛通明，丝竹盈耳。',
      action: { type: 'look_around' },
    },
    {
      id: 'ld-2',
      actor: 'yunque',
      expression: 'surprised',
      text: '（拽你袖子）天呐，这殿也太阔了！你看殿中间——那是马吗？马怎么上殿了？快，往前排挤挤！',
    },
    {
      id: 'ld-3',
      actor: 'dianyi',
      actorName: '典仪',
      text: '（高声赞礼）此乃麟德殿，三殿相连。天子在此大宴群臣、接见外邦使节——今日同席便有远客。',
    },
    {
      id: 'ld-4',
      actor: 'narrator',
      text: '你侧目望去，邻席上尽是卷发高鼻、服饰各异的外邦使节，正打量百戏；阶下竿木攀缘、舞旋翻飞、幻术吐火，一片喧腾。',
    },
    {
      id: 'ld-6',
      actor: 'yunque',
      expression: 'happy',
      text: '（眼睛不够用）那个翻跟头的！还有喷火的——比前头看过的都热闹！',
    },
    {
      id: 'ld-7',
      actor: 'dianyi',
      actorName: '典仪',
      text: '（低声赞礼）天子将赐酒。按礼起身整衣、举杯过眉，趋步向前；切勿喧挤——外邦使节皆在观瞻。',
      choices: [
        {
          id: 'ld-c-li',
          text: '起身整衣，举杯过眉，依礼而进',
          correct: true,
          feedback: {
            actor: 'dianyi',
            actorName: '典仪',
            text: '（颔首）好。客虽远来，知礼守度，满殿都看着呢——这便是大唐的体面。',
          },
          easterEgg: '（偷偷学你正衣冠的样子）这样才像话嘛——你看，满殿的使节都挑不出礼来。',
        },
        {
          id: 'ld-c-ji',
          text: '随云阙挤到前排，凑近看舞马',
          correct: false,
          feedback: {
            actor: 'dianyi',
            actorName: '典仪',
            text: '（低声）且慢——国宴之上宾客挤攘，外邦使节都在看着呢。来，先退回席中，整衣举杯，依礼上前便好。',
          },
        },
      ],
    },
    {
      id: 'ld-8',
      actor: 'narrator',
      text: '礼成，鼓乐骤起。数十匹舞马踏着《倾杯乐》的节拍入场，纵横起伏；及至曲终，竟有马儿屈膝跪地，口衔酒杯，向御座敬酒。开启AR复原，可看麟德殿三殿宴饮舞马的盛景。',
      action: { type: 'ar_restore', name: '麟德殿' },
    },
    {
      id: 'ld-9',
      actor: 'yunque',
      expression: 'surprised',
      text: '（看呆了，小声）马……马真的会跪着敬酒！比听说的还要灵！',
    },
    {
      id: 'ld-10',
      actor: 'narrator',
      text: '盛唐宫中常养舞马，宴则衔杯上寿；何家村出土的银壶，铸的正是它的模样。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'ld-11',
      actor: 'narrator',
      text: '你随众举杯，向御座、也向同席使节致意。酒香混着丝竹，是这一夜最热闹的时候。',
    },
    {
      id: 'ld-12',
      actor: 'yunque',
      expression: 'happy',
      text: '（趴在案上，腮帮子贴着酒杯，满足叹气）嗝……好饱，好热闹呀。',
    },
    {
      id: 'ld-13',
      actor: 'yunque',
      expression: 'happy',
      text: '（迷迷糊糊伸手，掌心浮起金红的鳞）这片「盛宴鳞」给你——玄武门就在前头，去吹吹风醒醒酒。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default linde;
