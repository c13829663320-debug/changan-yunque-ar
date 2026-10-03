import { ScenePoint } from '../../types/scene';

/**
 * 点位 5 · 塔名由来（重剧场 · 本景点终章）
 * 身份：登塔远眺的旅人；龙鳞：归雁鳞
 * 闭环：look_around → choices(塔名出处正误) → ar_restore(大雁塔与雁塔本生) → open_source_card(史料卡) → collect_scale
 * 红线：“雁塔”之名典出印度佛教本生、载于玄奘《大唐西域记》，非西安本地雁的故事。
 */
const yataDing: ScenePoint = {
  id: 'yata-ding',
  spotId: 'dayanta',
  index: 5,
  name: '塔名由来',
  role: '登塔远眺的旅人',
  scaleName: '归雁鳞',
  weight: 'heavy',
  geo: { latitude: 34.2286, longitude: 108.9593, radius: 120 },
  bg: 'https://aka.doubaocdn.com/s/FA53ALMmmM',
  arRestoreImage: 'https://aka.doubaocdn.com/s/90kVlKVw23',
  restoreVideo: 'https://aka.doubaocdn.com/s/zWO8DXVeau',
  poster: 'https://aka.doubaocdn.com/s/7s6UKAUlun',
  intro: '本景点终章——登塔远眺长安，并解开“雁塔”之名，自印度远来东土的由来。',
  sourceCard: {
    title: '“雁塔”之名——印度本生与玄奘亲记',
    works: [
      { name: '玄奘《大唐西域记》' },
      { name: '《大慈恩寺三藏法师传》' },
      { name: '《法苑珠林》' },
    ],
    note:
      '大雁塔为供养玄奘自天竺取回的舍利、经像而建。“雁塔”之名源自印度佛教本生：据玄奘《大唐西域记》记载，摩揭陁国因陀罗势罗窭诃山有“雁塔”，昔有群僧饥乏，见一雁飞堕前、投身布施，众僧感其灵异，葬雁起塔，自此不复食三净肉。此典出自印度，由玄奘西行亲见亲记、载于书中，并非西安本地大雁的故事。所记山川、僧名音译诸书小有异同，以原典为准。',
  },
  dialogs: [
    {
      id: 'yd-1',
      audio: 'https://aka.doubaocdn.com/s/eQtArl90k9',
      actor: 'narrator',
      text: '拾级而上，你登上大雁塔中层。凭栏远眺，坊市错落、终南如黛，长安城尽收眼底。',
      action: { type: 'look_around' },
    },
    {
      id: 'yd-2',
      audio: 'https://aka.doubaocdn.com/s/ZDdeis5uGh',
      actor: 'yunque',
      text: '（趴在栏边，小声）你知道吗……这座塔为什么叫“雁塔”？可不是咱们西安本地的大雁哦。',
    },
    {
      id: 'yd-3',
      actor: 'seng',
      actorName: '行脚僧',
      text: '（合十）女居士说得是。此塔为供养三藏法师自天竺取回的舍利经像而建；“雁塔”之名，实有出处。施主且说——它源自何处？',
      choices: [
        {
          id: 'yd-c-india',
          text: '源自印度佛教本生，玄奘《大唐西域记》亲见亲记',
          correct: true,
          feedback: {
            actor: 'seng',
            actorName: '行脚僧',
            text: '（欣然颔首）善哉。昔日摩揭陁国一雁投身布施，众僧感其灵异、葬雁起塔——此典出自印度，非本埠所有。',
          },
        },
        {
          id: 'yd-c-local',
          text: '因塔下曾栖息西安本地的大雁而得名',
          correct: false,
          feedback: {
            actor: 'seng',
            actorName: '行脚僧',
            text: '（微笑摇头）非也。此“雁”是天竺本生之雁、《西域记》所载之雁，不是长安城下栖居的雁。莫把远来的典故，认作本地的风光。',
          },
        },
      ],
    },
    {
      id: 'yd-4',
      audio: 'https://aka.doubaocdn.com/s/ZgHtgnLCEv',
      actor: 'narrator',
      text: '开启AR复原，可看大雁塔，以及它名字的由来。据玄奘《大唐西域记》记载：典出印度摩揭陁国因陀罗势罗窭诃山，昔有群僧饥乏，一雁堕前、投身布施，众僧感其灵异，葬雁起塔，遂不复食三净肉。此乃印度佛教本生，由玄奘西行亲见亲记、载于书中，并非西安本地雁的故事。',
      action: { type: 'ar_restore', name: '大雁塔' },
    },
    {
      id: 'yd-5',
      actor: 'narrator',
      text: '这一雁塔本生，详载于《大唐西域记》，亦见《大慈恩寺三藏法师传》《法苑珠林》。可点开史料卡，看玄奘笔下那只远自印度飞来的雁。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'yd-6',
      audio: 'https://aka.doubaocdn.com/s/ZfbJQrvaHc',
      actor: 'yunque',
      text: '（望着塔外，轻声）这座塔，是玄奘法师从天竺取回经像后建的。塔名从印度来，经文也从印度来……这片“归雁鳞”给你。长安云阙，我们下回再见啦。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default yataDing;
