import { ScenePoint } from '../../types/scene';

/**
 * 点位 6 · 麟德殿（重剧场）
 * 身份：国宴宾客/外邦使节；龙鳞：盛宴鳞
 * 闭环：look_around → choices(敬酒礼节/座次) → ar_restore(宴饮舞马) → open_source_card(史料卡) → collect_scale
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
      audio: '/package-tour/assets/audio/ld-1.mp3',
      actor: 'narrator',
      text: '夜色如墨，你随众宾客步入麟德殿。前、中、后三殿相连、层层进深，灯烛通明，丝竹盈耳。',
      action: { type: 'look_around' },
    },
    {
      id: 'ld-2',
      audio: '/package-tour/assets/audio/ld-2.mp3',
      actor: 'yunque',
      text: '（拽你袖子）天呐，这殿也太阔了！你看殿中间——那是马吗？马怎么上殿了？快，我们往前排挤挤！',
    },
    {
      id: 'ld-3',
      actor: 'dianyi',
      actorName: '典仪',
      text: '（高声赞礼）此乃麟德殿，三殿相连、高宏敞阔。天子在此大宴群臣、接见外邦使节——今日同席的，便有远道而来的客人。',
    },
    {
      id: 'ld-4',
      audio: '/package-tour/assets/audio/ld-4.mp3',
      actor: 'narrator',
      text: '你侧目，邻席坐着卷发高鼻、服饰各异的外邦使节，正饶有兴致地打量着殿中百戏。',
    },
    {
      id: 'ld-5',
      audio: '/package-tour/assets/audio/ld-5.mp3',
      actor: 'narrator',
      text: '阶下百戏散乐杂陈：竿木攀缘、舞旋翻飞、幻术吐火，一片喧腾。鎏金器皿映着烛光，酒香浮动。',
    },
    {
      id: 'ld-6',
      audio: '/package-tour/assets/audio/ld-6.mp3',
      actor: 'yunque',
      text: '（眼睛不够用）那个翻跟头的！还有喷火的——比前头看过的都热闹！',
    },
    {
      id: 'ld-7',
      actor: 'dianyi',
      actorName: '典仪',
      text: '（低声赞礼）天子将赐酒。按礼，宾客当起身整衣、举杯过眉，再趋步向前；切勿喧挤——外邦使节皆在，观瞻所系。',
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
        },
        {
          id: 'ld-c-ji',
          text: '随云阙挤到前排，凑近看舞马',
          correct: false,
          feedback: {
            actor: 'dianyi',
            actorName: '典仪',
            text: '（低声制止）站住！国宴之地，宾客挤攘、外邦在侧，成何体统？看好你身后的使节席。',
          },
        },
      ],
    },
    {
      id: 'ld-8',
      audio: '/package-tour/assets/audio/ld-8.mp3',
      actor: 'narrator',
      text: '礼成，鼓乐骤起。数十匹舞马踏着《倾杯乐》的节拍入场，纵横起伏；及至曲终，竟有马儿屈膝跪地，口衔酒杯，向御座敬酒。开启AR复原，可看麟德殿三殿宴饮舞马的盛景。',
      action: { type: 'ar_restore', name: '麟德殿' },
    },
    {
      id: 'ld-9',
      audio: '/package-tour/assets/audio/ld-9.mp3',
      actor: 'yunque',
      text: '（看呆了，小声）马……马真的会跪着敬酒！比听说的还要灵！',
    },
    {
      id: 'ld-10',
      audio: '/package-tour/assets/audio/ld-10.mp3',
      actor: 'narrator',
      text: '典仪道：这舞马敬酒不是戏法——盛唐宫中专养舞马，宴则起舞、衔杯上寿。何家村窖藏出土的「鎏金舞马衔杯银壶」，正是它的模样。可点开史料卡一观。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'ld-11',
      audio: '/package-tour/assets/audio/ld-11.mp3',
      actor: 'narrator',
      text: '你随众举杯，向御座、也向同席的外邦使节致意。酒香混着丝竹，是这一夜最热闹的时候。',
    },
    {
      id: 'ld-12',
      audio: '/package-tour/assets/audio/ld-12.mp3',
      actor: 'yunque',
      text: '（趴在案上，腮帮子贴着酒杯，满足叹气）嗝……好饱，好热闹呀。',
    },
    {
      id: 'ld-13',
      audio: '/package-tour/assets/audio/ld-13.mp3',
      actor: 'yunque',
      text: '（迷迷糊糊伸出手，掌心浮起一片金红的鳞）这片「盛宴鳞」给你。你听——散宴了。夜尽了。大明宫的北门玄武门就在前头，我们去那儿吹吹风，醒醒酒。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default linde;
