import { ScenePoint } from '../../types/scene';

/** 点位 1 · 丹凤门（重剧场 · 样板） */
const danfengmen: ScenePoint = {
  id: 'danfengmen',
  spotId: 'daminggong',
  index: 1,
  name: '丹凤门',
  role: '入京朝参的官员',
  scaleName: '启程鳞',
  weight: 'heavy',
  geo: { latitude: 34.2816, longitude: 108.9636, radius: 120 },
  markerImage: 'markers/danfengmen.png',
  arModel: 'models/danfengmen.glb',
  intro: '大明宫正南门，五门道、天子由此出入，被誉为盛唐第一门。',
  sourceCard: {
    title: '丹凤门与五门道',
    works: [
      { name: '《唐六典》' },
      { name: '《旧唐书·地理志》' },
      { name: '丹凤门遗址考古与保护展示工程资料' },
    ],
    note:
      '丹凤门为大明宫正南门，设五个门道，是唐代最高等级的宫门形制，现存丹凤门遗址保护展示建筑建于原址之上。大明宫始建于贞观八年（634），初名永安宫。具体条文以原典与考古报告为准。',
  },
  dialogs: [
    {
      id: 'dfm-1',
      actor: 'narrator',
      text: '清晨，丹凤门前广场。金色晨光落在五道城门上，百官列队，钟鼓将鸣。',
      action: { type: 'look_around' },
    },
    {
      id: 'dfm-2',
      actor: 'liguan',
      actorName: '守门礼官',
      text: '今日大朝——百官验鱼符、整朝服，依品秩入宫，不得喧哗错乱！',
    },
    {
      id: 'dfm-3',
      actor: 'yunque',
      text: '（小声）好多人呀……你也是来上朝的吗？前面有五道门，我们……该走哪一道？',
      choices: [
        {
          id: 'dfm-c-mid',
          text: '走中间最宽的那道门',
          correct: false,
          feedback: {
            actor: 'liguan',
            actorName: '守门礼官',
            text: '站住！中间门道乃天子御道，百官由两侧门道依序而入，不可僭越！',
          },
        },
        {
          id: 'dfm-c-side',
          text: '随队列走左侧门道',
          correct: true,
          feedback: {
            actor: 'liguan',
            actorName: '守门礼官',
            text: '嗯，依品秩左入，合礼。',
          },
        },
      ],
    },
    {
      id: 'dfm-4',
      actor: 'yunque',
      text: '原来中间那道是留给皇帝的……（仰头）那这座大门，叫什么名字？',
    },
    {
      id: 'dfm-5',
      actor: 'liguan',
      actorName: '守门礼官',
      text: '此乃丹凤门，大明宫正门，五门道，天子由此出入，万国来朝，皆从此门觐见。',
    },
    {
      id: 'dfm-6',
      actor: 'narrator',
      text: '你随百官穿过门道。开启摄像头，可在原址之上看丹凤门复原全貌。',
      action: { type: 'ar_restore', name: '丹凤门' },
    },
    {
      id: 'dfm-7',
      actor: 'yunque',
      text: '好高的门……（掌心浮起一片金鳞）我好像，记起了一点点什么。这片「启程鳞」，送给你。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default danfengmen;
