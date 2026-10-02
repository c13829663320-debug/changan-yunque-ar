import { Spot } from '../types/spot';

/**
 * 大雁塔（大慈恩寺）— 第二个景点实例
 * 复用 spot-detail 模板页：本文件仅为数据 + 图片，页面代码零改动。
 * theaters 为空数组（大雁塔无点位剧场），该板块自动隐藏。
 */
const dayanta: Spot = {
  id: 'dayanta',
  name: '大雁塔 · 大慈恩寺',
  subtitle: '玄奘藏经之塔 · 丝路佛缘与唯识宗祖庭',
  city: '西安',
  cover: '/package-spot/assets/spot/dayanta/cover.jpg',
  summary:
    '大雁塔坐落于西安大慈恩寺内，又名慈恩寺塔。唐永徽三年（652）玄奘为保存由天竺取回的经像舍利，奏请于寺西院建塔，初为五层仿西域窣堵坡形制、砖表土心；武周长安间重建为七层，明万历间包砖修葺成今貌，通高约六十四米。寺本太子李治追荐生母文德皇后所建，是玄奘主持译场与法相唯识宗祖庭；2014 年作为丝绸之路遗产点列入世界文化遗产。',
  tags: ['世界文化遗产', '唐代楼阁式砖塔', '玄奘译经地', '法相唯识宗祖庭', '全国重点文保'],
  stats: [
    { label: '塔始建', value: '652年·唐永徽三年' },
    { label: '现存形制', value: '方形七层楼阁式砖塔' },
    { label: '通高', value: '约64米' },
    { label: '遗产属性', value: '世界文化遗产·全国重点文保' },
  ],
  timeline: [
    {
      year: '648年·贞观二十二年',
      title: '大慈恩寺创建',
      desc: '太子李治（后为高宗）为追荐生母文德皇后长孙氏，于隋无漏寺旧址扩建寺院，取名「慈恩」；玄奘入主寺务，后于此设译场。',
      era: '唐代营建',
    },
    {
      year: '652年·永徽三年',
      title: '玄奘奏建大雁塔',
      desc: '玄奘恐经本散失、兼防火难，奏请于寺端门之阳造石浮图安置西域所将经像；高宗以功大难成、敕改用砖造，改就西院，建成五层砖表土心之塔。',
      era: '唐代营建',
    },
    {
      year: '701—704年·武周长安间',
      title: '重建为七层',
      desc: '原砖表土心塔约五十年后倾圮，武则天率王公贵族集资于原址重建，成方锥形楼阁式砖塔；重建后层数有七层、十层两说，今取七层通说。',
      era: '唐代营建',
    },
    {
      year: '930—933年·后唐长兴间',
      title: '五代整修',
      desc: '西京留守安重霸重修大慈恩寺并对大雁塔加以整修，维持唐代塔体形制。',
      era: '历代修葺',
    },
    {
      year: '1556年·明嘉靖三十四年',
      title: '关中大地震',
      desc: '陕西关中发生八级强震，塔刹震落，塔下碑刻亦受损，塔身残破待修。',
      era: '历代修葺',
    },
    {
      year: '1573—1620年·明万历间',
      title: '包砖成今貌',
      desc: '沿唐代塔体外形包砌一层磨砖对缝的砖面（厚约36—60厘米），并复安塔刹，形成今日七层外观与轮廓。',
      era: '历代修葺',
    },
    {
      year: '1961年',
      title: '首批全国重点文保',
      desc: '国务院公布大雁塔为第一批全国重点文物保护单位。',
      era: '现代文保',
    },
    {
      year: '2014年6月22日',
      title: '列入世界文化遗产',
      desc: '作为「丝绸之路：长安—天山廊道的路网」遗产点之一，在卡塔尔多哈第38届世界遗产委员会会议上列入《世界遗产名录》。',
      era: '现代文保',
    },
  ],
  route: {
    title: '园区简化动线',
    note: '示意动线，非真实地理比例（归一化坐标，仅示游览先后）',
    zones: [
      {
        id: 'axis',
        name: '寺院中轴',
        desc: '南广场—山门—殿宇—大雁塔—三藏院',
        bounds: { x: 25, y: 5, w: 50, h: 90 },
        color: '#a6bfae',
      },
    ],
    nodes: [
      { id: 'p1', name: '南广场 · 玄奘立像', role: '入口', desc: '寺外南侧广场，立玄奘法师像，为到访起点。', x: 50, y: 88 },
      { id: 'p2', name: '山门 · 天王殿', role: '寺院入口', desc: '入寺第一进，额「大慈恩寺」。', x: 50, y: 72 },
      { id: 'p3', name: '大雄宝殿 · 殿宇区', role: '祖庭殿宇', desc: '寺院主体殿宇，法相唯识宗祖庭核心。', x: 50, y: 55 },
      { id: 'p4', name: '大雁塔本体', role: '核心遗址', desc: '方形七层楼阁式砖塔，玄奘藏经之处。', x: 50, y: 35 },
      { id: 'p5', name: '玄奘三藏院', role: '纪念区', desc: '塔北侧院落，展陈玄奘西行与译经事迹。', x: 50, y: 15 },
    ],
    edges: [
      { from: 'p1', to: 'p2', primary: true, label: '入寺' },
      { from: 'p2', to: 'p3', primary: true },
      { from: 'p3', to: 'p4', primary: true, label: '趋塔' },
      { from: 'p4', to: 'p5', label: '三藏院' },
    ],
    startNodeId: 'p1',
  },
  highlights: [
    {
      id: 'h1',
      name: '大雁塔本体',
      tag: '核心地标',
      desc: '方形七层楼阁式砖塔，台基、塔体、塔刹三段，砖仿木檐、风铎层叠；玄奘为保存天竺经像舍利而建，登塔可俯瞰城南。',
      image: '/package-spot/assets/spot/dayanta/highlight-1.jpg',
    },
    {
      id: 'h2',
      name: '玄奘三藏院',
      tag: '玄奘纪念',
      desc: '位于塔北侧，以壁画、雕刻与展陈再现玄奘西行求法、归国译经的一生，是了解慈恩宗与丝路佛缘的专馆。',
      image: '/package-spot/assets/spot/dayanta/highlight-2.jpg',
    },
    {
      id: 'h3',
      name: '大慈恩寺殿宇',
      tag: '唯识宗祖庭',
      desc: '唐长安三大译场之一，玄奘在此主持译场、创法相唯识宗；现存殿宇多为明清以降重建，中轴依次推进。',
      image: '/package-spot/assets/spot/dayanta/highlight-3.jpg',
    },
    {
      id: 'h4',
      name: '雁塔题名 · 圣教序碑',
      tag: '人文典故',
      desc: '唐代新进士有雁塔题名之盛事；塔下《大唐三藏圣教序》及《圣教序记》二碑，记述玄奘西行与太宗、高宗制文，见证丝路佛教传播。',
      image: '/package-spot/assets/spot/dayanta/highlight-4.jpg',
    },
  ],
  theaters: [], // 大雁塔无点位剧场，板块自动隐藏
  citations: [
    {
      id: 'c1',
      work: '《大唐大慈恩寺三藏法师传》',
      chapter: '卷第七（唐·慧立、彦悰撰，CBETA T50n2053）',
      kind: 'classic',
      quote:
        '三年春三月，法师欲于寺端门之阳造石浮图，安置西域所将经像……敕使中书舍人李义府报法师云：「所营塔功大，恐难卒成，宜用砖造。」……于是用砖，仍改就西院。',
      note: '永徽三年造塔始末与改砖、移建西院的一手记载。',
      url: 'https://www.sxlib.org.cn/dfzy/sxfjwhzybk/sxhcfjztysywh/yjwx_5241/201701/t20170122_623223.html',
    },
    {
      id: 'c2',
      work: '《旧唐书》',
      chapter: '卷一百九十一·列传第一百四十一·方伎·玄奘',
      kind: 'classic',
      note: '正史载玄奘西行求法、归国译经与慈恩寺事；此处只列出处，未逐字征引，避免断句之误。',
    },
    {
      id: 'c3',
      work: '陕西省文物局《对省政协十二届三次会议第298号提案的复函》',
      chapter: '大雁塔基本情况',
      kind: 'modern',
      note: '官方口径：始建永徽三年（652），武周长安间（701—704）改建为七层，明万历间（1573—1620）包砖成今日外观。',
      url: 'http://wwj.shaanxi.gov.cn/zfxxgk/fdzdgknr/jyta/202011/t20201125_2112442.html',
    },
    {
      id: 'c4',
      work: '人民网《大雁塔，丝路繁华的见证者》',
      chapter: '文化中国行',
      kind: 'modern',
      note: '2014年作为「丝绸之路：长安—天山廊道的路网」遗产点列入《世界遗产名录》。',
      url: 'http://ent.people.com.cn/n1/2025/1010/c1012-40578659.html',
    },
    {
      id: 'c5',
      work: '陕西省佛教协会《唯识宗祖庭大慈恩寺》',
      chapter: '',
      kind: 'modern',
      note: '贞观二十二年（648）太子李治为追念文德皇后创建慈恩寺，玄奘主持译场、创唯识宗，为祖庭。',
      url: 'http://shanxifojiao.com.cn/index.php?m=home&c=View&a=index&aid=2922',
    },
  ],
  openInfo: {
    hours: '开放时段与登塔安排以大慈恩寺·大雁塔景区官方公示为准',
    ticket: '寺院门票与登塔票分别售票，价格以景区官方公示为准',
    traffic: '地铁3号线/4号线大雁塔站；地址：西安市雁塔区雁塔南路大慈恩寺',
  },
  enabled: true,
};

export default dayanta;
