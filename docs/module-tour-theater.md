# 模块交付：云阙巡游剧场（feature/tour-theater）

## 职责
承载大明宫七点位的互动叙事剧场，让用户以「当事人」身份跟随云阙走完剧情、看懂典故、集齐龙鳞。

## 文件清单
- `data/scenes/daminggong/`：七个独立剧场文件（danfengmen / hanyuan / xuanzheng / zichen / taiyechi / linde / xuanwumen），`index.ts` 聚合排序；
- `package-tour/pages/scene/`：剧场承载页（对话引擎、轻分支、AR 复原层、史料卡、龙鳞结算、下一点位跳转）；
- `package-tour/components/share-card/`：终章长安祈愿卡组件（Canvas 2D、保存相册、分享）。

## 关键设计
- 每个剧场含完整对话节点 `dialogs`、分支 `choices`（轻分支，只影响即时反馈与彩蛋、不改结局）、史料卡 `sourceCard`、AR 复原 `ar_restore`、集鳞 `collect_scale`；
- 云阙定位为「懵懂同伴」，寻找失散同伴，贯穿七剧场；
- 叙事以中轴为骨、集龙鳞为线、兴衰为底；
- 终章玄武门集齐七鳞后可生成长安祈愿卡并分享。

## 验收
- 七剧场结构完整（validate 第 3 项）；
- 云游模式 10–15 分钟可走完七剧场、集齐七鳞；
- 祈愿卡可生成、保存、分享。
