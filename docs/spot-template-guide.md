# 景点数字馆 · 可复用模板填充指南（Spot Digital Museum Template v1）

> 适用页面：`package-spot/pages/spot-detail/spot-detail`（**唯一模板页，完全数据驱动**）。
> 目标：**新增一个景点 = 只加数据和图片，不改任何页面代码（WXML/WXSS/TS）**。
> 本指南配合类型契约 `miniprogram/data/types/spot.ts` 使用；类型即权威，字段含义以类型注释为准。

---

## 1. 它是怎么工作的

```
data/types/spot.ts          统一数据契约（Spot Schema），字段与必填/选填的唯一来源
data/spots/<spotId>.ts       每个景点一个数据文件（你主要要写的东西）
data/spots/index.ts          注册全部景点
data/repositories/spotRepo.ts 数据访问收口，页面只通过它读数据
package-spot/pages/spot-detail/*  模板页（六大板块自动渲染，无需改动）
package-spot/assets/spot/<spotId>/ 该景点运行时图片（压缩 JPG）
assets/spot/<spotId>/         高清母版（不打包进小程序）
```

页面 `onLoad` 读取 query 中的 `id`（缺省回落为 `daminggong`），调用 `getSpot(id)` 得到数据，按固定顺序渲染六大板块：

1. **景点头图**（cover + 名称 + 副标题 + 标签 + 关键事实数据条）
2. **历史沿革时间线**（timeline，确定性竖向时间线）
3. **宫城 / 园区动线**（route，确定性 SVG 示意图，**非地图**）
4. **必看亮点**（highlights，图文卡片）
5. **关联剧场入口**（theaters，自动关联点位剧场；为空则整块隐藏）
6. **史料引用**（citations，可溯源文献 / 考古报告）

另有「到访信息」（openInfo）与「相关文创」为固定附加模块。

---

## 2. 字段说明（必填 / 选填）

### 顶层 `Spot`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✅ | 与文件名一致，全小写/连字符，如 `dayanta` |
| `name` | string | ✅ | 景点全称 |
| `subtitle` | string | ✅ | 一句话气质副标题 |
| `city` | string | ✅ | 所在城市 |
| `cover` | string | ✅ | 头图路径，16:9 横图 |
| `gallery` | string[] | ⛛选填 | 头图下图集 |
| `summary` | string | ✅ | 一段话定位（建议 80–160 字） |
| `tags` | string[] | ✅ | 标签，建议 3–5 个 |
| `stats` | `SpotStat[]` | 选填 | 头图下关键事实数据条，建议 3–4 条 |
| `timeline` | `SpotTimelineItem[]` | ✅ | 历史沿革节点，建议 5 个以上 |
| `route` | `SpotRoute` | ✅ | 动线示意图（无宫城的景点给园区简化动线） |
| `highlights` | `SpotHighlight[]` | ✅ | 必看亮点，建议 3–6 个 |
| `theaters` | `SpotTheaterLink[]` | ✅ | 关联剧场；**无剧场给 `[]`，板块自动隐藏** |
| `citations` | `SpotCitation[]` | ✅ | 史料引用，建议 3 条以上 |
| `openInfo` | `OpenInfo` | ✅ | 开放/门票/交通 |
| `enabled` | boolean | ✅ | 是否上线；开发期可 `false` 凭 id 预览 |

### 子结构

- `SpotStat`：`{ label, value }`，如 `{ label:'占地面积', value:'约3.2km²' }`。
- `SpotTimelineItem`：`{ year, title, desc, image?, era? }`。`year` 含纪年+年号，如 `634年·贞观八年`；`era` 可做时间线分组。
- `SpotRoute`：
  - `note` **必须**写明示意性质，如「示意动线，非真实地理比例」；
  - `zones`：分区底色 `{ id, name, desc?, bounds:{x,y,w,h}, color? }`；
  - `nodes`：点位 `{ id, name, role?, desc?, x, y, sceneId?, image? }`；
  - `edges`：连线 `{ from, to, primary?, label? }`，`primary:true` 表示主轴线；
  - `startNodeId`：巡游起点。
- `SpotHighlight`：`{ id, name, tag?, desc, image?, sceneId? }`。
- `SpotTheaterLink`：`{ sceneId, name?, subtitle?, image? }`，后三者缺省时自动取剧场数据。
- `SpotCitation`：`{ id, work, chapter?, quote?, kind?, note?, url? }`。
- `OpenInfo`：`{ hours, ticket, traffic }`。价格/开放时间等易变信息以官方公示口径书写，不写死承诺。

---

## 3. 动线坐标规范（重要，严禁地图）

- 动线是**确定性示意图**：`nodes` 的 `x / y` 为相对画布的归一化百分比坐标（0–100），**不是经纬度、不是真实比例**，禁止接入任何地图 SDK / 瓦片 / ECharts `geo/map`。
- 画布按竖向移动端设计：主轴线（如三朝中轴）建议沿竖直方向排布（同 `x`、`y` 递增），后寝与北门在上方/侧方分区。
- 点位用百分比绝对定位，连线与分区用内联 SVG（`viewBox="0 0 100 100"`、`preserveAspectRatio="none"`）绘制，布局引擎自动对齐，无需手算像素。
- 坐标一旦定下，新景点只改数据里的数字即可重排，页面代码不动。

---

## 4. 图片规范

| 项 | 规范 |
|---|---|
| 存放（运行时） | `miniprogram/package-spot/assets/spot/<spotId>/` |
| 存放（母版） | `assets/spot/<spotId>/`（高清，不打包） |
| 头图 cover | 16:9，maxWidth 1400，**单张 ≤400KB** |
| 亮点/图集 | 3:2 或 4:3，maxWidth 1400，单张 ≤400KB |
| 格式 | 运行时一律 `.jpg`；母版可保留高清 PNG/JPG |
| 命名 | `cover.jpg`、`highlight-<n>.jpg`、`gallery-<n>.jpg` |
| 压缩 | `python3 scripts/optimize_assets.py <src> <dst> 1400 80` |

- 头图/场景氛围图属具象画面，使用生图能力（`seedream_5.0_pro`），统一「盛唐敦煌壁画美学、低饱和、沉静华贵」风格；避免艳俗红金、荧光、塑料感。
- 动线示意图本身用 SVG 绘制，**不要**用生成的地图类图片替代。
- 数据中引用运行时绝对路径：`/package-spot/assets/spot/<spotId>/cover.jpg`。
- 注意分包体积：单个景点图片建议总量 ≤ 2MB；`node scripts/validate_m1.mjs` 会校验全包 ≤ 20MB。

---

## 5. 如何关联「七剧场」

- 只做**入口关联**，不改剧场本体代码与 `data/scenes`。
- 在 `theaters` 中按巡游顺序填入剧场 `sceneId`（大明宫七剧场：`danfengmen / hanyuan / xuanzheng / zichen / taiyechi / linde / xuanwumen`）。
- 仅填 `sceneId` 时，卡片名称、简介、龙鳞名、配图自动取自剧场数据；如需自定义展示文案，再填 `name/subtitle/image` 覆盖。
- 点击卡片跳转 `/package-tour/pages/scene/scene?id=<sceneId>`。
- **与剧场无对应的新景点（如大雁塔）直接给 `theaters: []`**，板块自动隐藏，不影响其余板块。

---

## 6. 从零新增一个景点（步骤）

1. **建数据文件** `miniprogram/data/spots/<spotId>.ts`，复制第 7 节最小骨架填写。
2. **备图**：生成/收集头图与亮点图，母版放 `assets/spot/<spotId>/`，用压缩脚本产出运行时副本到 `miniprogram/package-spot/assets/spot/<spotId>/`。
3. **注册**：在 `miniprogram/data/spots/index.ts` 的数组里加入新实例：
   ```ts
   import <spotId> from './<spotId>';
   const spots: Spot[] = [daminggong, <spotId>];
   ```
4. **预览**：开发者工具内跳转 `/package-spot/pages/spot-detail/spot-detail?id=<spotId>`（**模板页代码保持不变**）。
5. **校验**：`node scripts/validate_m1.mjs` 必须通过；并用 `git diff --name-only` 确认未改动 `app.json`、剧场/AR、`package-mall`。

> 证明「零改页面代码」：新增景点的 `git diff` 只应出现 `data/spots/<spotId>.ts`、`data/spots/index.ts` 与 `assets` 素材，**不应出现** `package-spot/pages/spot-detail/*`。

---

## 7. 最小可用数据骨架（复制即用）

```ts
import { Spot } from '../types/spot';

const <spotId>: Spot = {
  id: '<spotId>',
  name: '景点全称',
  subtitle: '一句话副标题',
  city: '西安',
  cover: '/package-spot/assets/spot/<spotId>/cover.jpg',
  summary: '一段话定位这个景点的历史地位与今日看点（80–160字）。',
  tags: ['标签一', '标签二', '标签三'],
  stats: [
    { label: '关键事实', value: '示例值' },
  ],
  timeline: [
    { year: '年份·年号', title: '事件名', desc: '一句话说明。' },
  ],
  route: {
    note: '示意动线，非真实地理比例',
    nodes: [
      { id: 'p1', name: '入口', x: 50, y: 85 },
      { id: 'p2', name: '主体', x: 50, y: 50 },
    ],
    edges: [{ from: 'p1', to: 'p2', primary: true }],
    startNodeId: 'p1',
  },
  highlights: [
    { id: 'h1', name: '看点名', tag: '核心看点', desc: '看点说明。', image: '/package-spot/assets/spot/<spotId>/highlight-1.jpg' },
  ],
  theaters: [], // 无关联剧场时为空数组，板块自动隐藏
  citations: [
    { id: 'c1', work: '文献名', chapter: '卷/篇', kind: 'classic' },
  ],
  openInfo: {
    hours: '以景区官方公示为准',
    ticket: '以官方公示为准',
    traffic: '公共交通与地址',
  },
  enabled: false, // 准备好后改为 true
};

export default <spotId>;
```

---

## 8. 史实与交付红线

- **史料生命线**：`quote` 必须逐字可溯源（精确到卷/篇），无法确证就只列出处或标注存疑，**严禁杜撰原文**。
- 真实历史人物只做符合史载之事；开放时间、门票等易变信息用「以官方公示为准」。
- 交付前自检：六大板块齐全且可浏览 → `node scripts/validate_m1.mjs` 通过 → 未越界改动 → 提交并推送。
