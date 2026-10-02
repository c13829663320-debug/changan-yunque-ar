# Line5（商品图与商城详情 / 官方形象与全局打磨 / 氛围短视频 / 云开发切换）交付报告

分支 `feature/line5-mall`，已 push。`npx tsc -p . --noEmit` 通过。主包体积 1.6MB（≤1.8MB）。

## 一、自检结果

| 项 | 结果 |
|---|---|
| `npx tsc -p . --noEmit` | ✅ PASS |
| 14 张运行时商品封面 | ✅ 全部存在、非 0 字节、单张 ≤90KB（最大约 88KB） |
| 主包总体积 | ✅ 1.6MB（预算 ≤1.8MB） |
| 商城全链路页面 | ✅ goods-detail / cart / intention 四件套齐全 |
| 越界改动 | ✅ 未改 package-tour scene 页面、各点位 *.ts、others.meta、index.ts、spot-detail、data/types |
| app.json | ✅ 零改动（4 Tab / 三分包结构未动） |

## 二、商品图（14 SKU）

母版高清 PNG 在 `assets/goods/<id>.png`；运行时压缩 JPG 在 `miniprogram/assets/goods/<id>.jpg`（maxWidth 900 / q82，深色图压至 q72-78）。风格统一遵循 `docs/frontend-art-spec.md` §2。

| goodsId | 类型 | 生成方式 |
|---|---|---|
| g-sx-nangnang 葡萄花鸟纹银香囊 | 文物典藏 | image_gen |
| g-necklace 银香囊吊坠 | 文物首饰 | image_gen |
| g-yunque-blindbox 萌龙盲盒 | 云阙 IP | image_edit 引用 Q版萌龙官方资产 |
| g-shanhe-set 山河祈愿套装 | 云阙 IP | image_edit 引用 Q版萌龙官方资产 |
| g-girl-figure 云阙少女手办 | 云阙 IP | image_edit 引用官方少女立绘 |
| g-city-blindbox 西安城市盲盒 | 城市文创 | image_gen |
| g-tongguan 通关文牒 | 城市文创 | image_gen |
| g-yushou 御守套装 | 城市文创 | image_gen |
| g-shihe 长安食盒 | 城市文创 | image_gen |
| g-yinghua 青龙寺樱花礼盒 | 城市文创 | image_gen |
| g-xuanzang 玄奘书香礼盒 | 城市文创 | image_gen |
| g-digital-ar 文物3D数藏AR | 数字AR | image_gen |
| g-ar-theater AR沉浸剧场 | 体验 | image_gen |
| g-makeup 盛唐妆造旅拍 | 体验 | image_gen |

文物相关均保留/补足 `culturalNote`「文物灵感 / AIGC 再现」。catalog 已填 `cover`（主包本地，离线可显示）与 `gallery`（高清网络图）。

## 三、氛围短视频（Seedance 2.5）

模型 `seedance_2.5`（会员专属，已小步试生成成功，未触发降级），9:16 720x1280，各 5s：

| 母版文件 | CDN URL | 用途 |
|---|---|---|
| `assets/videos/yunque-opening.mp4` (484K) | https://aka.doubaocdn.com/s/He5QMciyH6 | 云阙开场 |
| `assets/videos/tour-transition.mp4` (372K) | https://aka.doubaocdn.com/s/AJ3sd7mzV9 | 巡游转场 |
| `assets/videos/finale.mp4` (551K) | https://aka.doubaocdn.com/s/ZxSUSV4ILn | 终章氛围 |

降级说明：**无需降级**——2.5 额度可用，三条均成功生成。因主包 1.8MB 预算所限（已 1.6MB），视频**未打包进主包**，仅作母版入库；首页保留「官方走龙立绘 + 呼吸/光晕动效」作为离线回退。接入首页开场需先在小程序后台配置 CDN downloadFile 合法域名（见 cloud-switch.md §3）。

## 四、全局打磨点

- 首页 hero：接入官方走龙立绘 `/assets/characters/yunque-dragon.jpg`，圆形 medallion + 呼吸缩放（breathe 3.6s）+ 光晕扩散 + 入场 fade-up 动效。
- 我的页：头像接入官方少女立绘 `yunque-girl.jpg`。
- 商城列表（mall）与首页「云阙甄选」横滑：占位渐变改为真实商品封面图。
- goods-detail：首屏封面图 + gallery 缩略切换；文物灵感卡加「鼎」图标与「AIGC 再现」徽标；AR 预览层由占位圆环升级为取景框四角 + 旋转虚线环 + 扫描光束 + 商品封面「召唤中→已召唤」动效，数据驱动（有 glb 给 3D 提示、无 glb 用封面优雅示意）。
- `styles/common.wxss`：卡片/按钮按压反馈与平滑过渡。

## 五、云开发切换

新增 `docs/cloud-switch.md`：从 `useMock=true` 离线演示，分步切换云开发（创建环境→填 `cloudEnvId`→部署 `intention` 云函数/`intentions` 集合→配 downloadFile 合法域名→各 Repository 按 `config.useMock` 分流改异步），并保留回退方式。`useMock=true` 时一切离线可演示。

## 六、改动文件清单（绝对路径）

修改：
- `miniprogram/data/goods/catalog.ts`
- `miniprogram/package-mall/pages/goods-detail/{goods-detail.ts,wxml,wxss}`
- `miniprogram/pages/home/{home.ts,wxml,wxss}`
- `miniprogram/pages/mine/{mine.wxml,wxss}`
- `miniprogram/pages/mall/{mall.wxml,wxss}`
- `miniprogram/styles/common.wxss`

新增：
- `miniprogram/assets/goods/<14>.jpg`（运行时封面）
- `assets/goods/<14>.png`（高清母版）
- `assets/videos/{yunque-opening,tour-transition,finale}.mp4`
- `docs/cloud-switch.md`、`docs/line5-mall-report.md`

## 七、遗留问题 / 建议

1. gallery 高清网络图与视频 CDN 在真机需配置 downloadFile 合法域名，否则仅本地封面可用（开发期可勾选「不校验域名」预览）。
2. goods-detail AR 预览当前为封面 + 动效示意；待 XRFrame / glb 模型接入后替换为真 3D（`arPreview` 字段已预留 `*.glb` 判定）。
3. cart/intention 仍写本地 storage；上云时按 cloud-switch.md §2 接入 `intention` 云函数。
4. 视频母版未入包；如需首页视频开场，建议配置域名后用 `<video poster=本地封面>` 渐进接入，保持离线回退。
