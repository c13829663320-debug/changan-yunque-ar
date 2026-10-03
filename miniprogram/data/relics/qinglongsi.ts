import { Relic } from '../types/relic';

/**
 * 青龙寺「现场可扫描文物」数据（与大明宫 / 大雁塔对称）
 * 均围绕空海入唐、惠果传密宗与青龙寺遗址的可靠史迹；配图统一标注「文物灵感 · AIGC 再现」。
 * 图片全部走 CDN（不进小程序包）。
 *
 * ⚠️史实红线：
 *  - 空海纪念碑为 1981 年现代纪念建筑（日本四国四县捐资共建），非唐代文物；
 *  - 胎藏界曼荼罗现存古图多为后世摹本，非唐时原壁；
 *  - 《御请来目录》原帙藏日本，为空海归国后所献。
 */
const qinglongRelics: Relic[] = [
  {
    id: 'relic-qinglong-jinianbei',
    spotId: 'qinglongsi',
    sceneId: 'qinglong-shanmen',
    name: '空海纪念碑',
    era: '现代 · 纪念碑（1981）',
    image: 'https://aka.doubaocdn.com/s/78KXHsZgMi',
    yunqueLines: [
      '你眼前这座碑，是1981年为纪念空海而建的——日本四国四县的朋友们和西安一起，把它立在青龙寺的遗址上。',
      '可要记清楚：这是现代人立的纪念物，不是唐代的古碑，碑身做成了唐风密檐塔的样子。',
      '它纪念的，是一千二百年前那个从海那边来、又把法带回去的学问僧。',
    ],
    intro:
      '空海纪念碑于1981年由日本四国四县与西安共建于青龙寺遗址，碑身作唐风密檐塔式。它是为纪念日本僧空海入唐求法、从惠果受两部灌顶而立的现代纪念建筑，并非唐代文物。',
    culturalNote: '文物灵感 · AIGC 再现，非原文物。',
    sourceCard: {
      title: '空海纪念碑 · 现代纪念建筑',
      works: [],
      note: '空海纪念碑1981年由日本四国四县与西安共建于青龙寺遗址，为现代纪念建筑，非唐代文物；碑身作唐风密檐塔式。',
    },
  },
  {
    id: 'relic-jingang-lingchu',
    spotId: 'qinglongsi',
    sceneId: 'qinglong-mantuluo',
    name: '金刚铃与金刚杵',
    era: '唐 · 鎏金铜法器（密宗）',
    image: 'https://aka.doubaocdn.com/s/Meua95UjRu',
    yunqueLines: [
      '案上这一铃一杵，是密宗行法时用的法器——铃响表般若妙智，杵立表菩提心。',
      '五股的形制，对应着五智，空海在青龙寺受灌顶时，坛上用的就是这样的法器。',
      '你眼前这件，是照着唐代法器的样子再现的，不是出土原物。',
    ],
    intro:
      '金刚铃、金刚杵为密宗行法法器，铃表般若妙智、杵表菩提心，五股表五智。空海于青龙寺从惠果受两部灌顶，坛场行法即以此类法器。图为依唐制法器再现之物，并非出土原物。',
    culturalNote: '文物灵感 · AIGC 再现，非原文物。',
    sourceCard: {
      title: '金刚铃杵 · 密宗行法法器',
      works: [{ name: '《金刚顶经》' }],
      note: '金刚铃、金刚杵为密宗行法法器，铃表般若妙智、杵表菩提心，五股表五智；图为依唐制法器再现。',
    },
  },
  {
    id: 'relic-taizang-mantuluo',
    spotId: 'qinglongsi',
    sceneId: 'qinglong-mantuluo',
    name: '胎藏界曼荼罗图',
    era: '唐 · 密宗图像（后世摹本）',
    image: 'https://aka.doubaocdn.com/s/Xf9PparfCV',
    yunqueLines: [
      '这张图叫胎藏界曼荼罗，大日如来居中，诸尊各按方位环列，像把整个法界的秩序画了下来。',
      '它和金刚界曼荼罗合称「两部」，惠果传给空海，空海又把它带回了日本。',
      '现存的古图多是后世摹本，不是唐时的原壁——你眼前这张，是照着它的样子再现的。',
    ],
    intro:
      '胎藏界曼荼罗为密宗两部根本图之一，与金刚界曼荼罗合称「两部大法」，表理智二门。惠果于青龙寺将其传付空海，空海东归后携往日本，成为真言宗根本图像。现存古图多为后世摹本，非唐时原壁。',
    culturalNote: '文物灵感 · AIGC 再现，非原文物。',
    sourceCard: {
      title: '胎藏界曼荼罗 · 两部根本图',
      works: [{ name: '《大日经》' }],
      note: '胎藏界曼荼罗为密宗两部根本图之一，惠果传空海、东传日本；现存古图多为后世摹本，非唐时原壁。',
    },
  },
  {
    id: 'relic-qinglai-mulu',
    spotId: 'qinglongsi',
    sceneId: 'qinglong-donggui',
    name: '《御请来目录》',
    era: '日本平安 · 空海编',
    image: 'https://aka.doubaocdn.com/s/JDTc6LvfIy',
    yunqueLines: [
      '这本目录，是空海806年回到日本后献给朝廷的——里面一条条登录了他从唐朝请来的经卷、佛像和法器。',
      '它就像一张「入唐购物清单」，记下了青龙寺传给东密的那批法物到底有哪些。',
      '原帙藏在日本，是日本真言宗的重要文献；你眼前这本，是照着它的样子再现的。',
    ],
    intro:
      '《御请来目录》为空海806年东归日本后所献，登录其入唐所请经卷、像、法器之目，是日本真言宗重要文献。原帙藏于日本。图为依该目录形制再现之物。',
    culturalNote: '文物灵感 · AIGC 再现，非原文物。',
    sourceCard: {
      title: '《御请来目录》 · 入唐法物总目',
      works: [],
      note: '空海806年归国后献《御请来目录》，登录入唐所请经卷、像、法器；为日本真言宗重要文献，原帙藏日本。',
    },
  },
  {
    id: 'relic-qinglong-lianzhuan',
    spotId: 'qinglongsi',
    sceneId: 'qinglong-shanmen',
    name: '遗址出土莲花方砖',
    era: '唐 · 陶质建筑构件',
    image: 'https://aka.doubaocdn.com/s/m9WSFTQYP4',
    yunqueLines: [
      '这方砖上刻着莲花纹，是青龙寺遗址1973年发掘时出土的唐代建筑构件。',
      '和它一起出来的，还有瓦当、佛造像残件——正是这些实物，帮我们确认了寺址和唐代的形制。',
      '你眼前这件，是照着出土莲花方砖的样子再现的。',
    ],
    intro:
      '青龙寺遗址1973年发掘，出土唐代莲花纹方砖、瓦当与佛造像残件等建筑构件，是确认寺址与唐代形制的实物证据。图为依出土莲花方砖形制再现之物。',
    culturalNote: '文物灵感 · AIGC 再现，非原文物。',
    sourceCard: {
      title: '莲花方砖 · 遗址出土构件',
      works: [],
      note: '青龙寺遗址1973年发掘，出土唐代莲花纹方砖、瓦当与佛造像残件等建筑构件，是确认寺址与唐代形制的实物。',
    },
  },
];

export default qinglongRelics;
