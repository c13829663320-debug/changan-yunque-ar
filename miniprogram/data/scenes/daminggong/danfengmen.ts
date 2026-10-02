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
  bg: '/package-tour/assets/scenes/danfengmen/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/danfengmen/ar-restore.jpg',
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
      expression: 'curious',
      text: '（小声）好多人呀……你也是来上朝的吗？前面有五道门，我们……该走哪一道？',
      choices: [
        {
          id: 'dfm-c-mid',
          text: '走中间最宽的那道门',
          correct: false,
          feedback: {
            actor: 'liguan',
            actorName: '守门礼官',
            text: '且慢！中间那道是天子御道，百官不可擅行。来，随队列依品秩从两侧门道依次而入——这才合礼。',
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
          easterEgg: '（吐了吐舌头）好险——我刚才都差点想拉你走中间那条宽的，原来那是天子专属的道呀。',
        },
      ],
    },
    {
      id: 'dfm-4',
      actor: 'yunque',
      expression: 'curious',
      text: '原来中间那道是留给皇帝的……（仰头）那这座大门，叫什么名字？',
    },
    {
      id: 'dfm-5',
      actor: 'liguan',
      actorName: '守门礼官',
      text: '此乃丹凤门，大明宫正门。史料卡可一观。',
      action: { type: 'open_source_card' },
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
      expression: 'daze',
      text: '好高的门……（掌心浮起金鳞）我好像记起了一点什么。这片「启程鳞」送给你。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default danfengmen;
