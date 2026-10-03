import { ScenePoint } from '../../types/scene';

/** 点位 2 · 含元殿（重剧场 · 外邦使臣视角的大朝会） */
const hanyuan: ScenePoint = {
  id: 'hanyuan',
  spotId: 'daminggong',
  index: 2,
  name: '含元殿',
  role: '外邦使臣',
  scaleName: '朝会鳞',
  weight: 'heavy',
  geo: { latitude: 34.2852, longitude: 108.9634, radius: 120 },
  markerImage: 'markers/hanyuan.png',
  arModel: 'models/hanyuan.glb',
  intro: '外朝正殿，龙尾道三折而上，元旦、冬至大朝会于此，王维写「万国衣冠拜冕旒」。',
  sourceCard: {
    title: '含元殿与大朝会',
    works: [
      { name: '王维《和贾舍人早朝大明宫之作》', quote: '九天阊阖开宫殿，万国衣冠拜冕旒。' },
      { name: '《唐六典》' },
      { name: '《旧唐书》' },
    ],
    note: '含元殿为大明宫外朝正殿，殿基踞龙首原高地，以龙尾道登临，举行元旦、冬至大朝会，立于殿上可俯瞰长安。',
  },
  dialogs: [
    {
      id: 'hy-1',
      audio: '/package-tour/assets/audio/hy-1.mp3',
      actor: 'narrator',
      text: '含元殿前广场。你率使团随百官来到宫前，抬头望去——高台巍峨，龙尾道如三折云梯，直抵云端。',
      action: { type: 'look_around' },
    },
    {
      id: 'hy-2',
      audio: '/package-tour/assets/audio/hy-2.mp3',
      actor: 'yunque',
      text: '（仰头）好高的台基……我们从丹凤门一路走来，到这里已经抬了好多级台阶。你看上面那座大殿，就是含元殿了。',
    },
    {
      id: 'hy-3',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '外邦使臣，请随我来。今日元旦大朝会，百官与诸国使节依班列于殿前，再由龙尾道三折而上，至含元殿庭朝拜。莫要走错了班次。',
    },
    {
      id: 'hy-4',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '龙尾道分三折：第一折上行七十级，平台稍歇；第二折再上；第三折便到殿庭。诸位使臣随我右列，勿与汉官班次相淆。',
    },
    {
      id: 'hy-5',
      audio: '/package-tour/assets/audio/hy-5.mp3',
      actor: 'yunque',
      text: '（小声）我也跟你们一起走……这条道好长，抬头只能看见天和殿角的鸱尾。你扶着使团的节杖，慢慢往上。',
    },
    {
      id: 'hy-6',
      audio: '/package-tour/assets/audio/hy-6.mp3',
      actor: 'narrator',
      text: '第一折平台。你驻足回望——长安城在脚下铺开，坊市如棋，渭水如带。风从原上吹来，衣冠猎猎。',
    },
    {
      id: 'hy-7',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '诸位稍歇，随我上第二折。到了殿庭，外邦使节立于五品班列之后，面向御座，勿言勿动，听赞唱行事。',
    },
    {
      id: 'hy-8',
      audio: '/package-tour/assets/audio/hy-8.mp3',
      actor: 'yunque',
      text: '（扯了扯你的衣袖）等会儿到了上面，站位可有讲究？我听说站错了班次是要被御史弹劾的……你要不要先问问导引官？',
      choices: [
        {
          id: 'hy-c-ask',
          text: '向鸿胪寺导引官确认班次位置',
          correct: true,
          feedback: {
            actor: 'honglu',
            actorName: '鸿胪寺导引官',
            text: '嗯，谨慎是对的。贵使立于西列外蕃班，面向殿中御座，与东列汉官相对。记好了，到了殿庭自有人引你们入位。',
          },
        },
        {
          id: 'hy-c-follow',
          text: '跟着前面同列使臣走，应该错不了',
          correct: false,
          feedback: {
            actor: 'honglu',
            actorName: '鸿胪寺导引官',
            text: '且慢！前面那列是新罗使节的班次，贵使是大食使团，须入西列。来，随我这边走——莫要赶错了班次。',
          },
        },
      ],
    },
    {
      id: 'hy-9',
      audio: '/package-tour/assets/audio/hy-9.mp3',
      actor: 'narrator',
      text: '第三折。你终于登上含元殿庭。钟鼓忽起，雅乐声从两厢传来——大朝会开始了。',
    },
    {
      id: 'hy-10',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '听好了：赞礼官唱「山呼」，你等随众百官躬身，三呼「万岁」；再唱「再拜」，各行起舞礼——就是双手加额、躬身下拜。莫要迟疑。',
    },
    {
      id: 'hy-11',
      audio: '/package-tour/assets/audio/hy-11.mp3',
      actor: 'yunque',
      text: '（紧张地攥住你的衣角）我、我怕我喊错节拍……等会儿大家一起喊的时候，你跟着周围人就是了，别一个人抢先也别落后。',
      choices: [
        {
          id: 'hy-c-wait',
          text: '等鸿胪寺导引官抬手示意再跟着喊',
          correct: true,
          feedback: {
            actor: 'yunque',
            text: '对，看导引官的手势最稳妥。他一抬手，你就跟着前面的使臣一起躬身、山呼——稳当得很。',
          },
        },
        {
          id: 'hy-c-shout',
          text: '听到赞礼官唱「山呼」就立刻喊「万岁」',
          correct: false,
          feedback: {
            actor: 'honglu',
            actorName: '鸿胪寺导引官',
            text: '（低声）贵使且慢——赞唱之后尚有一息空隙，与众官同呼方为合礼。抢先了，怕是要被殿中侍御史记下来。',
          },
        },
      ],
    },
    {
      id: 'hy-12',
      audio: '/package-tour/assets/audio/hy-12.mp3',
      actor: 'narrator',
      text: '赞礼官高唱「山呼——」。鸿胪寺导引官抬手，你随万国衣冠一齐躬身，三呼万岁。声浪在殿庭间回荡，钟鼓随之而和。',
    },
    {
      id: 'hy-13',
      audio: '/package-tour/assets/audio/hy-13.mp3',
      actor: 'narrator',
      text: '再拜。你双手加额，行起舞礼。抬眼时，远远望见殿上御座的方向——那里垂着帷幔，隐隐有人影。云阙低声说：',
    },
    {
      id: 'hy-14',
      audio: '/package-tour/assets/audio/hy-14.mp3',
      actor: 'yunque',
      text: '（轻声）那上面坐的……就是圣人了。天子临朝，万国来朝。你看——东西两列的使臣，正在依次出班朝拜。',
    },
    {
      id: 'hy-15',
      actor: 'envoy',
      actorName: '同列异国使臣',
      text: '（低声朝你）贵使是从大食来的吧？我是新罗的。你看这含元殿……踞在龙首原上，殿庭比我们王宫的正殿还高出数倍。',
    },
    {
      id: 'hy-16',
      actor: 'envoy',
      actorName: '同列异国使臣',
      text: '往日只在国书中读到「九天阊阖」，今日亲见——这便是大唐的天子气象了。',
    },
    {
      id: 'hy-17',
      audio: '/package-tour/assets/audio/hy-17.mp3',
      actor: 'yunque',
      text: '（伸手指向殿外）你往南边看——从龙尾道下来，整个长安都在脚下。一百零八坊、东西两市、大明宫的含元殿、宣政殿、紫宸殿……都在这条中轴线上。',
    },
    {
      id: 'hy-18',
      audio: '/package-tour/assets/audio/hy-18.mp3',
      actor: 'narrator',
      text: '朝礼毕，百官退班。你立于含元殿庭之上，俯瞰龙首原下的长安城。开启摄像头，可在遗址之上看含元殿当年的复原全景。',
      action: { type: 'ar_restore', name: '含元殿' },
    },
    {
      id: 'hy-19',
      audio: '/package-tour/assets/audio/hy-19.mp3',
      actor: 'yunque',
      text: '（掌心浮起一片温润的金鳞）我好像……想起了万国来朝的鼓乐声。这片「朝会鳞」，是你替我亲眼见证的。收好它。',
      action: { type: 'collect_scale' },
    },
    {
      id: 'hy-20',
      audio: '/package-tour/assets/audio/hy-20.mp3',
      actor: 'yunque',
      text: '朝会散了，接下来百官要往宣政殿方向去——听说退朝之后，廊下还有「廊下食」，按品级供饭食。走吧，我们也去看看。',
    },
  ],
};

export default hanyuan;
