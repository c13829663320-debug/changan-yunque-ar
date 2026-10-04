import { Spot } from '../types/spot';

/**
 * 第三景点：青龙寺 · 密法东传
 * 与大雁塔「玄奘西行求法」构成「西行 / 东传」闭环。
 * 用户扮演：随空海入唐求法的请益僧。
 * 全部媒体走 CDN（静帧 / 复原视频 / 配音），本地只放数据。
 */
const qinglongsi: Spot = {
  id: 'qinglongsi',
  name: '青龙寺',
  subtitle: '唐风密宗 · 樱花名刹',
  city: '西安',
  cover: 'https://aka.doubaocdn.com/s/duaSCVGiQv',
  overviewImage: 'https://aka.doubaocdn.com/s/haEqODjTp5',
  timelineImage: 'https://aka.doubaocdn.com/s/WGsEpNwCsm',
  summary:
    '青龙寺遗址在唐长安新昌坊（今西安雁塔区西影路铁炉庙村北），前身隋灵感寺，是唐代密宗重要道场。日本僧空海于此从惠果阿阇梨受两部灌顶，归国后创日本真言宗；今日青龙寺亦是西安著名赏樱胜地。',
  tags: ['唐代密宗', '空海入唐', '真言宗祖庭', '赏樱胜地'],
  timeline: [
    {
      year: '582年·隋开皇二年',
      title: '始建灵感寺',
      desc: '青龙寺前身为灵感寺，建于隋开皇二年（582）；唐武德四年（621）一度废毁。',
    },
    {
      year: '662年·唐龙朔二年',
      title: '复为观音寺',
      desc: '龙朔二年（662）复立为观音寺，密宗道场渐成规模。',
    },
    {
      year: '711年·唐景云二年',
      title: '改名青龙寺',
      desc: '景云二年（711）正式改名青龙寺，惠果阿阇梨长期住持，为唐代密宗重镇。',
    },
    {
      year: '805年·唐贞元二十一年',
      title: '惠果传法空海',
      desc: '日本僧空海于此从惠果受胎藏界、金刚界两部灌顶；同年惠果圆寂。',
    },
    {
      year: '806年·唐元和元年',
      title: '空海东归日本',
      desc: '空海携经卷、曼荼罗与法器东归，后于高野山创日本真言宗（东密）。',
    },
    {
      year: '1973年',
      title: '遗址发掘',
      desc: '青龙寺遗址1963年起勘查、1973年发掘；1981—82年部分复建。',
    },
    {
      year: '1981年',
      title: '空海纪念碑',
      desc: '由日本四国四县捐资、与西安共建空海纪念碑，为现代纪念建筑；今为西安赏樱胜地。',
    },
  ],
  relics: [
    {
      name: '空海纪念碑',
      desc: '1981年由日本四国四县与西安共建于青龙寺遗址，唐风密檐塔式。',
      image: 'https://aka.doubaocdn.com/s/78KXHsZgMi',
    },
    {
      name: '金刚铃与金刚杵',
      desc: '密宗行法法器，铃表般若妙智、杵表菩提心。',
      image: 'https://aka.doubaocdn.com/s/Meua95UjRu',
    },
    {
      name: '胎藏界曼荼罗图',
      desc: '密宗两部根本图之一，惠果传空海、东传日本。',
      image: 'https://aka.doubaocdn.com/s/Xf9PparfCV',
    },
    {
      name: '《御请来目录》',
      desc: '空海归国后所献，登录入唐所请经卷、像与法器。',
      image: 'https://aka.doubaocdn.com/s/JDTc6LvfIy',
    },
    {
      name: '遗址出土莲花方砖',
      desc: '青龙寺遗址发掘出土的唐代陶质建筑构件。',
      image: 'https://aka.doubaocdn.com/s/m9WSFTQYP4',
    },
  ],
  openInfo: {
    hours: '开放时间以景区现场公示为准',
    ticket: '门票以现场公示为准（春季樱花季人流较大）',
    traffic: '地铁3号线 青龙寺站，近西安城墙东南、乐游原遗址',
  },
  sceneIds: ['qinglong-shanmen', 'qinglong-guanding', 'qinglong-mantuluo', 'qinglong-fufa', 'qinglong-donggui'],
  enabled: true,
};

export default qinglongsi;
