# 模块交付：景点数字馆模板（feature/spot-template）

## 职责
沉淀一套可复用的「景点数字馆」数据与页面模板，使后续文旅景点可快速复制接入。

## 文件清单
- `data/types/spot.ts`：景点数据结构（概览 / 时间线 / 看点 / 到访信息 / 关联剧场）；
- `data/spots/daminggong.ts`：大明宫完整实例；
- `data/spots/dayanta.ts`：大雁塔第二景点示例（复用证明，剧场暂空、标注即将上线）；
- `data/spots/index.ts`：景点聚合；
- `package-spot/pages/spot-detail/`：景点数字馆页；
- `pages/mine/`：全部景点列表入口。

## 复用步骤
1. 复制 `daminggong.ts`（或参考 `dayanta.ts`）为新景点文件；
2. 替换概览、时间线、看点、到访信息与关联剧场 id；
3. 在 `spots/index.ts` 注册；
4. 准备好剧场后置 `enabled = true`，此前数字馆可浏览、剧场显示「即将上线」。

## 验收
- 大明宫可巡游；大雁塔数字馆可浏览并正确显示「即将上线」；
- 数字馆按景点 `enabled` 与 `sceneIds` 动态呈现巡游入口。
