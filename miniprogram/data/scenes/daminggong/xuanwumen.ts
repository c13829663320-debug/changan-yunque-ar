import { ScenePoint } from '../../types/scene';

/**
 * 点位 7 · 玄武门（终章 · 特殊节点）
 *
 * 史实纠偏：武德九年（626）玄武门之变发生在「太极宫北门」，并非大明宫玄武门；
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
      '武德九年（626）的玄武门之变，发生在「太极宫北门玄武门」，并非大明宫的玄武门；大明宫始建于贞观八年（634）。唐代帝王有「投龙」之俗：以金龙、玉简（投龙简）投于名山大川，通诚祈愿，陕西历史博物馆藏唐代赤金走龙即此类器物。云阙在此纠偏常见误解，并与你投龙简、许当下愿，集齐七片龙鳞。具体条文与器物以原典、考古报告为准。',
  },
  dialogs: [
    {
      id: 'xwm-1',
      actor: 'narrator',
      text: '日影西斜，你随云阙走到大明宫最北面的城垣。北风掠过夯土台基，远处太液池水色渐暗。',
      action: { type: 'look_around' },
    },
    {
      id: 'xwm-2',
      actor: 'yunque',
      expression: 'normal',
      text: '（忽然停下，回头看你）先别急着走——很多人以为，武德九年那场玄武门之变，就发生在我脚下这座门。',
    },
    {
      id: 'xwm-3',
      actor: 'yunque',
      expression: 'normal',
      text: '其实不是的。那座玄武门是「太极宫」北门；这座大明宫贞观八年（634）才动工。门同名，却不是一座门。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'xwm-4',
      actor: 'narrator',
      text: '云阙摊开掌心，一路浮起的六片龙鳞，在暮色里一枚枚亮起。',
    },
    {
      id: 'xwm-5',
      actor: 'yunque',
      expression: 'happy',
      text: '你还记得吗——启程鳞、朝会鳞、廊下鳞、召对鳞、池苑鳞、盛宴鳞，一路都在这里了。',
    },
    {
      id: 'xwm-6',
      actor: 'yunque',
      expression: 'normal',
      text: '（望向城北）唐人有个浪漫规矩叫「投龙」——愿写玉简上，配枚小金龙投进山川，让风水带上去。你也投一愿？',
      choices: [
        {
          id: 'xwm-c-long',
          text: '愿长安长久，盛唐不散',
          correct: true,
          feedback: {
            actor: 'yunque',
            actorName: '云阙',
            text: '（怔住，随即笑了）这是个很大很大的愿……大到得很多很多人一起守着才行。好，我替你把它，放在风里最高的地方。',
          },
          easterEgg: '（把玉简按在心口）这个愿太大了，我替你举高些——让风先听见。',
        },
        {
          id: 'xwm-c-kin',
          text: '愿牵挂的人平安，愿失散的人能重逢',
          correct: true,
          feedback: {
            actor: 'yunque',
            actorName: '云阙',
            text: '（眼睛一下子亮了，又有点发酸）原来……你心里也有这样一个人。那我们的愿，是同一种。你投你的，我投我的，说不定风会把它们吹到一块儿。',
          },
          easterEgg: '（用力点头）好呀……要是风真把愿捎到了，我们这趟就没白来。',
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
      expression: 'daze',
      text: '（把金龙简送出掌心）走吧——愿投出去了，剩下的交给山川。（忽然出神）……有风有水，我就想起一点零碎：我好像不是一个人来的。别的鳞片散在我记不清处——若它们也落在这座城，你还愿陪我找吗？',
    },
    {
      id: 'xwm-11',
      actor: 'yunque',
      expression: 'happy',
      text: '（掌心浮起最后一片金鳞，声音轻快）七片都齐了。这片「归愿鳞」归你——愿你投的愿，迟早能回来。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default xuanwumen;
