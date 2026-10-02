import { ScenePoint } from '../../types/scene';

/**
 * 点位 7 · 玄武门（终章 · 特殊节点）
 *
 * 史实纠偏：武德九年（626）玄武门之变发生在【太极宫北门】，并非大明宫玄武门；
 * 大明宫始建于贞观八年（634）。由云阙主动向游客纠偏，是文旅生命线。
 * 情感收束：集齐七鳞、依唐代「投龙」仪式与游客许当下之愿；
 * 云阙唤起身世碎片、呼唤失散同伴，为续章留钩子（不写成已发生）。
 */
const xuanwumen: ScenePoint = {
  id: 'xuanwumen',
  spotId: 'daminggong',
  index: 7,
  name: '玄武门',
  role: '陪云阙投龙许愿的你',
  scaleName: '归愿鳞',
  weight: 'heavy',
  geo: { latitude: 34.3001, longitude: 108.9631, radius: 120 },
  markerImage: 'markers/xuanwumen.png',
  arModel: 'models/xuanwumen.glb',
  bg: '/package-tour/assets/scenes/xuanwumen/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/xuanwumen/ar-restore.jpg',
  cover: '/package-tour/assets/scenes/xuanwumen/ar-restore.jpg',
  intro: '大明宫北门。云阙在此辨明「玄武门之变」的误会，集齐七鳞，投龙祈愿。',
  sourceCard: {
    title: '玄武门之变辨 · 投龙祈愿',
    works: [
      { name: '《旧唐书·太宗本纪》' },
      { name: '《资治通鉴·唐纪》' },
      { name: '唐代投龙仪式与赤金走龙（陕西历史博物馆藏）相关资料' },
    ],
    note:
      '武德九年（626）的玄武门之变，发生在【太极宫北门玄武门】，并非大明宫的玄武门；大明宫始建于贞观八年（634）。唐代帝王有「投龙」之俗：以金龙、玉简（投龙简）投于名山大川，通诚祈愿，陕西历史博物馆藏唐代赤金走龙即此类器物。云阙在此纠偏常见误解，并与你投龙简、许当下愿，集齐七片龙鳞。具体条文与器物以原典、考古报告为准。',
  },
  dialogs: [
    {
      id: 'xwm-1',
      actor: 'narrator',
      text: '日影西斜，你随云阙走到大明宫最北面的城垣。北风掠过荒疏的夯土台基，远处太液池的水色渐暗。',
      action: { type: 'look_around' },
    },
    {
      id: 'xwm-2',
      actor: 'yunque',
      text: '（忽然停下，回头认真地看你）先别急着往下走——很多人以为，武德九年（626）那场玄武门之变，就发生在我脚下这座门。',
    },
    {
      id: 'xwm-3',
      actor: 'yunque',
      text: '其实不是的。那座玄武门，是【太极宫】的北门；这座大明宫，要到八年之后、贞观八年（634）才动工。门同名，却不是一座门。（轻呼一口气）我不想让你把这个误会，带出这座城。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'xwm-4',
      actor: 'narrator',
      text: '云阙摊开掌心，一路上浮起过的六片龙鳞，在暮色里一枚枚亮起。',
    },
    {
      id: 'xwm-5',
      actor: 'yunque',
      text: '你还记得吗——丹凤门前的「启程鳞」，含元殿上的「朝会鳞」，宣政廊下的「廊下鳞」，紫宸殿里的「召对鳞」，太液池边的「池苑鳞」，麟德殿宴上的「盛宴鳞」。一路走过来，原来都在这里了。',
    },
    {
      id: 'xwm-6',
      actor: 'yunque',
      text: '（望向城北）唐人有个很浪漫的规矩，叫「投龙」——把愿写在玉简上，配一枚小小的金龙，投进山川江海，让风与水把话带上去。今天到了北门，风这么好……你要不要，也投一愿？',
      choices: [
        {
          id: 'xwm-c-long',
          text: '愿长安长久，盛唐不散',
          feedback: {
            actor: 'yunque',
            actorName: '云阙',
            text: '（怔住，随即笑了）这是个很大很大的愿……大到得很多很多人一起守着才行。好，我替你把它，放在风里最高的地方。',
          },
        },
        {
          id: 'xwm-c-kin',
          text: '愿牵挂的人平安，愿失散的人能重逢',
          feedback: {
            actor: 'yunque',
            actorName: '云阙',
            text: '（眼睛一下子亮了，又有点发酸）原来……你心里也有这样一个人。那我们的愿，是同一种。你投你的，我投我的，说不定风会把它们吹到一块儿。',
          },
        },
        {
          id: 'xwm-c-now',
          text: '只愿此刻能久一点，别这么快散场',
          feedback: {
            actor: 'yunque',
            actorName: '云阙',
            text: '（歪头看你，轻声）这个愿最轻，却也最难。那……我们就让这一刻，多停一小会儿吧。',
          },
        },
      ],
    },
    {
      id: 'xwm-7',
      actor: 'narrator',
      text: '你在玉简上写下心愿。抬起头，开启摄像头，可在北门原址之上，看唐代玄武门与投龙祈愿的复原光影。',
      action: { type: 'ar_restore', name: '玄武门 · 投龙' },
    },
    {
      id: 'xwm-8',
      actor: 'yunque',
      text: '（把金龙简轻轻送出掌心，望着它没入风里）走吧——愿已经投出去了，剩下的，就交给山川。',
    },
    {
      id: 'xwm-9',
      actor: 'yunque',
      text: '（忽然出神，声音低下去）……说来也怪，每次到有风、有水的地方，我就会想起一点零碎的：我好像……不是一个人来的。还有别的鳞片，和我长得很像，散在我记不清的地方。',
    },
    {
      id: 'xwm-10',
      actor: 'yunque',
      text: '（抬眼望你，像在求证，又像在约定）我说不好它们在哪儿。只是……如果它们也落在这座城里，你以后，还愿意陪我一块儿找吗？就当……是我们的下一段路。',
    },
    {
      id: 'xwm-11',
      actor: 'yunque',
      text: '（掌心最后浮起一片温润的金鳞，声音重新轻快起来）七片都齐了。这片「归愿鳞」，归你所有——愿你投出去的那个愿，迟早有一天，能回来。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default xuanwumen;
