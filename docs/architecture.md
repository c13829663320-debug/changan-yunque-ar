# 技术架构说明

## 1. 技术选型
- **前端**：微信小程序原生 + TypeScript（对官方 AR/XR 能力支持最直接、真机最稳）。
- **3D/XR**：官方 **XRFrame**（声明式 3D 场景、glTF 模型、内置相机/光照、AR tracker）。
- **AR 算法**：**VisionKit / VKSession**（marker 识别、VIO 平面、位姿）。
- **后端**：**微信云开发 CloudBase**（云函数、云数据库、云存储，零运维）。
- **工程化**：TS 编译插件、npm 构建、ESLint、组件化、分包。

## 2. 分层
```
视图层 pages / package-*      // 只负责渲染与交互
组件层 components             // 云阙形象、对话气泡、史料卡、龙鳞徽章
数据访问 data/repositories    // Spot/Scene/Goods Repository（本地↔云端可切换）
数据内容 data/spots|scenes|goods + types   // 结构化内容，数据驱动
状态 store/progress           // 龙鳞/集章/当前点位（本地持久化）
能力 utils                    // 音频、定位、罗盘、AR 会话封装
配置 config                   // 云环境ID、CDN、开关
```

## 3. 数据层
- 所有内容为强类型 TS 数据；页面只通过 Repository 取数。
- M0/M1：本地数据（`useMock=true`）。
- M2：Repository 内部切换为云数据库/云函数，页面签名保持不变。

## 4. 3D / AR 方案
- **云游模式**：XRFrame 渲染 3D 长安城与殿宇、云阙模型；无模型时以沉浸式 2D 舞台兜底。
- **现场模式**：识别图 marker 定位为主，VIO 平面为辅，LBS/罗盘方位叠加兜底；不依赖户外裸平面检测。
- 详见 `docs/ar-contract.md`。

## 5. 分包与资源
- 主包：首页、巡游/商城/我的 Tab、核心框架。
- 分包：`package-tour`（剧场、AR 相机）、`package-spot`（景点数字馆）、`package-mall`（详情/购物车/意向单）。
- glb 模型、贴图、配音、大图走云存储 CDN，按需加载；进入巡游页预加载 tour 分包。

## 6. 云开发
- 集合 `intentions`：{ goodsId, contact, openid, createdAt, notified }。
- 云函数 `intention` 写入意向；M2 增加开售提醒、进度同步。

## 7. 构建与运行
1. 微信开发者工具导入仓库根目录。
2. 在 `project.config.json` 或工具内填入小程序 AppId（当前为测试号 `touristappid`）。
3. 安装并「构建 npm」（XRFrame 等）。
4. 需要云能力时开通云开发，将环境 ID 填入 `miniprogram/config/index.ts`。
5. 真机预览验证现场 AR。
