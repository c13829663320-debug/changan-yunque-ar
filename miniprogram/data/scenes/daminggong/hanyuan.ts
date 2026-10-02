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
  bg: '/package-tour/assets/scenes/hanyuan/bg.jpg',
  arRestoreImage: '/package-tour/assets/scenes/hanyuan/ar-restore.jpg',
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
      actor: 'narrator',
      text: '含元殿前。你率使团随百官来到宫前，抬头望去——高台巍峨，龙尾道三折云梯直抵云端。',
      action: { type: 'look_around' },
    },
    {
      id: 'hy-2',
      actor: 'yunque',
      expression: 'surprised',
      text: '（仰头）好高的台基……从丹凤门一路抬级上来。上面那座大殿，就是含元殿了。',
    },
    {
      id: 'hy-3',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '外邦使臣随我来。今日元旦大朝会，先随百官列殿前，再沿龙尾道三折上殿庭——一折七十级稍歇，二、三折便到。诸位随我右列，勿与班次相淆。',
    },
    {
      id: 'hy-5',
      actor: 'yunque',
      expression: 'normal',
      text: '（小声）我也跟着走……这条道好长，抬头只看见天和殿角鸱尾。你扶着节杖慢慢往上。',
    },
    {
      id: 'hy-6',
      actor: 'narrator',
      text: '第一折平台。你驻足回望——长安城在脚下铺开，坊市如棋，渭水如带。',
    },
    {
      id: 'hy-7',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '稍歇上第二折。到殿庭，外邦使节立五品班列之后，面向御座，勿言勿动，听赞唱行事。',
    },
    {
      id: 'hy-8',
      actor: 'yunque',
      expression: 'curious',
      text: '（扯你衣袖）等会儿到了上面，站位可有讲究？我听说站错班次要被御史弹劾……先问问导引官？',
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
          easterEgg: '（松了口气）问清楚就好，我就怕你跟着人流一脚踏错班列，那可就当着满朝文武丢大人啦。',
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
      actor: 'narrator',
      text: '第三折。你登上含元殿庭。钟鼓忽起，雅乐从两厢传来——大朝会开始了。',
    },
    {
      id: 'hy-10',
      actor: 'honglu',
      actorName: '鸿胪寺导引官',
      text: '听好了：赞礼官唱「山呼」，你等随众躬身三呼「万岁」；再唱「再拜」就行礼——双手加额下拜。莫迟疑。',
    },
    {
      id: 'hy-11',
      actor: 'yunque',
      expression: 'normal',
      text: '（紧张攥你衣角）我、我怕喊错节拍……等会儿大家一起喊，你跟着周围人就是，别抢先别落后。',
      choices: [
        {
          id: 'hy-c-wait',
          text: '等鸿胪寺导引官抬手示意再跟着喊',
          correct: true,
          feedback: {
            actor: 'yunque',
            actorName: '云阙',
            text: '对，看导引官的手势最稳妥。他一抬手，你就跟着前面的使臣一起躬身、山呼——稳当得很。',
          },
          easterEgg: '（学着点举手的样子）对对，看手势最稳——我就在你旁边，到时候我先动，你跟着我就好。',
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
      actor: 'narrator',
      text: '赞礼官高唱「山呼——」。导引官抬手，你随万国衣冠躬身三呼万岁；再拜起舞，抬眼望见御座——帷幔后有人影。',
    },
    {
      id: 'hy-14',
      actor: 'yunque',
      expression: 'normal',
      text: '（轻声）那上面坐的……就是圣人了。你看——东西两列使臣，正依次出班朝拜。',
    },
    {
      id: 'hy-15',
      actor: 'envoy',
      actorName: '同列异国使臣',
      text: '（低声朝你）贵使从大食来的吧？我是新罗的。你看这含元殿踞龙首原上，殿庭比我们王宫正殿高数倍。',
    },
    {
      id: 'hy-16',
      actor: 'envoy',
      actorName: '同列异国使臣',
      text: '往日只在国书中读到「九天阊阖」，今日亲见，这便是大唐天子气象。史料卡可一观。',
      action: { type: 'open_source_card' },
    },
    {
      id: 'hy-17',
      actor: 'yunque',
      expression: 'normal',
      text: '（伸手指向殿外）你往南边看——从龙尾道下去，整个长安都在脚底下。我们这一路，都顺着一条线。',
    },
    {
      id: 'hy-18',
      actor: 'narrator',
      text: '朝礼毕，百官退班。你立于含元殿庭之上，俯瞰龙首原下的长安城。开启摄像头，可在遗址之上看含元殿当年的复原全景。',
      action: { type: 'ar_restore', name: '含元殿' },
    },
    {
      id: 'hy-19',
      actor: 'yunque',
      expression: 'happy',
      text: '朝会散了，百官正退往宣政殿——听说退朝后廊下还有按品供的「廊下食」。走吧，去看看。',
    },
    {
      id: 'hy-20',
      actor: 'yunque',
      expression: 'happy',
      text: '（掌心浮起温润金鳞）这片「朝会鳞」，是你替我亲眼见证的——收好它，下一站宣政殿。',
      action: { type: 'collect_scale' },
    },
  ],
};

export default hanyuan;
