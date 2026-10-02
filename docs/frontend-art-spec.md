# 前端美术与资源规范（M1）

> 目标：七剧场 + 数字馆 + 商城前端「精致、统一、可演示」。所有线必须遵循本规范，避免五种风格、五种路径。

## 1. 模型与工具（固定）

- 生图：`image_gen` / `image_edit`，`model_version=seedream_5.0_pro`。
- 生视频：`model_version=seedance_2.5`（**会员专属、消耗较大**；若额度/权限受限，降级为 Seedream 高质量关键帧 + CSS/小程序动效，并在交付说明中注明，不得静默卡住）。
- 云阙/走龙衍生图：**必须**用 `image_edit` 引用官方资产，禁止凭空重画。
  - 官方少女立绘 https://aka.doubaocdn.com/s/DPiScV5sAD
  - 官方走龙立绘 https://aka.doubaocdn.com/s/QEEf7erlku
  - Seedream 少女 https://aka.doubaocdn.com/s/O16MT91zSV
  - Q版萌龙 https://aka.doubaocdn.com/s/yj3ZDn51PR （仅表情包/衍生；走龙本体以官方写实修长形象为准）
- 生图/生视频前先 Read 对应 Skill：`~/.doubao/agent_mode/workspace/.skills/seedream-50/SKILL.md`、`seedance-25/SKILL.md`、`doubao-creative-design/SKILL.md`。

## 2. 统一美术风格 prompt（逐字遵循）

> 盛唐敦煌壁画美学、国风奇幻电影质感、真人3D高级CG、沉静华贵、古典东方神秘；矿物颜料质感、壁画经年褪色的温润、低饱和；主色象牙白/月白/浅石青/淡青绿/浅赭，暗金仅少量用于神性文物龙鳞鎏金，低饱和朱砂克制；避免艳俗红金、荧光、高饱和、塑料感、AI 味。

Design Token：ivory `#f4ecdd`、moon `#e6ebea`、azurite `#8fa6ab`、celadon `#a6bfae`、ochre `#c7a987`、dark-gold `#a8893a`、cinnabar `#9e4a2a`、ink `#463e36`。

## 3. 资源两级存放（重要）

| 内容 | 高清母版（仓库根，不打包） | 运行时副本（小程序包内，压缩 JPG） | 引用示例 |
|---|---|---|---|
| 剧场背景 / AR复原图 | `assets/scenes/<sceneId>/` | `miniprogram/package-tour/assets/scenes/<sceneId>/` | `/package-tour/assets/scenes/hanyuan/bg.jpg` |
| 数字馆（点位） | `assets/spot/` | `miniprogram/package-spot/assets/spot/` | `/package-spot/assets/spot/relic-1.jpg` |
| 商品图 | `assets/goods/` | `miniprogram/assets/goods/`（**主包**） | `/assets/goods/g-sx-nangnang.jpg` |
| 官方形象 | `assets/characters/official/` | `miniprogram/assets/characters/`（主包，已提供） | `/assets/characters/yunque-girl.jpg` |

- 商品图放主包：商城 Tab 列表页在主包，必须能显示封面；分包页可引用主包资源（反之不可）。
- 剧场图放 tour 分包：仅剧场页使用，避免撑大主包。
- 母版与运行时副本都要提交；母版保留生成的高清 PNG，运行时一律 JPG。

## 4. 命名与体积预算

- 剧场：背景 `bg.jpg`、AR 复原 `ar-restore.jpg`；必要的分镜 `shot-1.jpg …`。
- 商品：封面 `<goodsId>.jpg`；详情多图可写 `gallery`，优先用网络图或 1–2 张本地图。
- 数字馆：`relic-<n>.jpg`、`timeline.jpg`、`overview.jpg`。
- 压缩用 `python3 scripts/optimize_assets.py <src> <dst> [maxWidth] [quality]`：
  - 剧场背景 maxWidth 1600 / q80，单张 ≤ 500KB；AR 复原 maxWidth 1400，≤ 450KB。
  - 数字馆 maxWidth 1400，单张 ≤ 400KB。
  - 商品封面 maxWidth 900 / q82，单张 ≤ 90KB（14 张合计 ≤ 1.3MB）。
- 主包总体积 ≤ 1.8MB；全包合计 ≤ 20MB。

## 5. 数据接线（数据驱动，不要改共享页面）

- 剧场对象设置 `bg`、`arRestoreImage`（`ScenePoint` 已含这两个可选字段）。
- 商品对象设置 `cover`、`gallery`；文物相关必须保留 `culturalNote`「文物灵感 / AIGC 再现」。
- 共享剧场页 `package-tour/pages/scene/scene.*` 已按字段自动渲染背景、云阙肖像、AR 复原图，并带 CSS 回退：
  - Line1–3 **不得**修改 `scene.wxml/wxss/ts`、`data/types/*`、`styles/*`、`app.json`、`scenes/daminggong/index.ts`。
  - Line4 因终章分享卡需要，**独占**对 `scene.*` 的进一步修改，但必须保持通用、数据驱动、不破坏其余剧场。
  - 仅 Line5 / 集成阶段可改 `app.json`。

## 6. 史实红线（文旅生命线）

- 大明宫 634 始建、663 启用，17 帝、200 余年；动线＝三朝中轴（丹凤门→含元外朝→宣政中朝→紫宸内朝）＋北部后寝（太液池、麟德殿），北门玄武门。
- 廊下食：贞观四年（630）唐太宗诏光禄寺于朝堂外廊按品级供给（约四菜一汤）；始设时大明宫尚未建成、先在太极宫，后延续至大明宫。
- 武德九年（626）玄武门之变发生在**太极宫北门**，非大明宫；终章由云阙主动纠偏。
- 文物形象标注「文物灵感 / AIGC 再现」；真实历史人物只做符合史载之事，多用虚构配角。史料卡可溯源（《唐六典》《唐会要》《旧唐书》《资治通鉴》等）。

## 7. 各线文件归属（互不重叠）

- Line1：`data/scenes/daminggong/hanyuan.ts`；`assets/scenes/hanyuan/*`、`assets/scenes/danfengmen/*`（丹凤门仅补图提质、不改剧情结构）。
- Line2：`xuanzheng.ts`、`zichen.ts`；`assets/scenes/xuanzheng/*`、`assets/scenes/zichen/*`。
- Line3：`taiyechi.ts`、`linde.ts`；`assets/scenes/taiyechi/*`、`assets/scenes/linde/*`。
- Line4：`xuanwumen.ts`、祈愿分享卡、数字馆 `spot-detail`；`assets/scenes/xuanwumen/*`、`assets/spot/*`。
- Line5：商品图、`goods-detail`、首页/我的/全局组件、视频；`assets/goods/*`。
- 共享聚合 `index.ts` 由集成阶段统一重建，各线不要改。
