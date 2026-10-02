# AR 技术契约（feature/ar-xrframe）

> 适用范围：`package-tour/pages/ar-camera/*`、`package-tour/pages/scene` 的 AR 层、
> `package-tour/ar-libs/*`、`package-tour/ar-components/*`、`package-tour/assets/{markers,panorama}`。
> 本文件是 AR/XRFrame 线的唯一对外契约，覆盖 marker 规范、坐标口径、降级策略、3D 资源清单。

---

## 1. 能力与版本

| 能力 | API | 说明 |
|---|---|---|
| VKSession | `wx.createVKSession` | 页面内单例，与页面生命周期绑定，页面间互斥 |
| Marker 2D 识别 | VKSession `track.marker` | 识别现场图片，可多 marker；输出锚点姿态 |
| 平面检测 | VKSession `track.plane` | v1 单平面；v2 物理距离定位、平面识别、点击放置 |
| XRFrame | `xr-scene` / `xr-ar-tracker` | marker 与 VIO，加载 glb/glTF，支持光照/全景 |
| 陀螺仪/罗盘 | `onDeviceOrientationChange` / `onCompassChange` | 云游环视、方位兜底 |

**基础库门槛（机型兼容口径）**

| 平台 | 最低基础库 | 备注 |
|---|---|---|
| iOS | **2.22.0** | 支持水平 + 竖直平面 |
| Android | **2.25.0** | v2 仅水平平面，**不支持竖直平面**；首次需平移初始化 |
| 开发者工具 / 其它 | — | VKSession 通常不可用，一律走降级，不报错 |

> 版本比较见 `ar-libs/capability.ts` 的 `compareVersions / meetsMinVersion`；
> 能力画像 `ARCapability` 在一次运行内缓存。

---

## 2. Marker 规范

### 2.1 识别图物理规范
- **内容**：高对比、亚光、非对称、信息熵高（丰富角点/纹理）；七张彼此明显不同。
- **避免**：大块纯色/白区、重复纹理、反光覆膜、径向/轴对称图案、与复原图同图。
- **载体**：点位解说牌、通关文牒图案；建议印刷尺寸 ≥ 15cm，平整无褶皱、无强反光。
- **安全边距**：图案四周留约 8% 白/暗边，避免被边框裁切影响识别。

### 2.2 文件规范
- 格式 **PNG**（无损），建议像素 ≥ 900×900，单张 ≤ 250KB。
- 命名与路径：`/package-tour/assets/markers/<sceneId>.png`（共 7 张）。
- 数据字段 `scene.markerImage`（`markers/<sceneId>.png`）为 **CDN 相对路径约定**；
  包内识别由 `ar-libs/types.ts` 的 `ASSET_PATHS.markerDir` 统一解析，
  不修改 `data/` 数据文件。若 VKSession 不接受包内只读路径，
  用 `getFileSystemManager` 拷贝到 `wxfile://` 临时目录再加载。

### 2.3 识别与叠加
- 创建会话后加载识别图，监听 `updateAnchors` / `removeAnchors`；
  锚点 `transform` 为 16 长度列优先模型矩阵（右手系）。
- **必须可用路径**：识别成功后把 `scene.arRestoreImage` 作为贴合 marker 姿态的
  **透视四边形**叠加（平面/透视叠加）。
- **升级路径**：`enableGlb` 且模型 URL 可解析（`config.cdnBase + scene.arModel`）时
  经 XRFrame 加载 glb；当前 `cdnBase` 为空，默认走复原图叠加，glb 缺失不得崩溃。

---

## 3. 坐标口径

- **坐标系**：统一使用国测局 **GCJ-02**（`wx.getLocation({ type: 'gcj02' })`），
  与七点位数据一致；不得混用 WGS-84。
- **角度**：罗盘/方位角以 **正北为 0°、顺时针递增**，结果归一化到 [0,360)；
  相对转向角取 [-180,180]，正=向右转、负=向左转。
- **距离**：Haversine 球面距离（米），实现见 `ar-libs/geo.ts`（纯函数，已用样例验证）。
- **触发**：进入 `geo.radius`（米）即判定到达并叠加；数据缺失时用 `DEFAULT_RADIUS=120`。

### 七点位坐标（**近似值，需现场实测**）
| 顺序 | 点位 id | 名称 | latitude | longitude | radius(m) |
|---|---|---|---|---|---|
| 1 | danfengmen | 丹凤门 | 34.2816 | 108.9636 | 120 |
| 2 | hanyuan | 含元殿 | 34.2852 | 108.9634 | 120 |
| 3 | xuanzheng | 宣政殿 | 34.2882 | 108.9633 | 110 |
| 4 | zichen | 紫宸殿 | 34.2912 | 108.9632 | 100 |
| 5 | taiyechi | 太液池 | 34.2955 | 108.9605 | 150 |
| 6 | linde | 麟德殿 | 34.2921 | 108.9528 | 140 |
| 7 | xuanwumen | 玄武门 | 34.3001 | 108.9631 | 120 |

> 以上坐标与半径均为**近似值**：代码使用处带注释「需现场实测」，
> LBS 界面展示小字「点位坐标为近似值，需现场实测」。现场实测后回填数据并移除标注。
> **云游模式不使用 geo**，按路线顺序解锁。

---

## 4. 现场定位策略（按优先级）

1. **识别图 marker（主）**：点位解说牌/通关文牒图案，稳定可控，姿态精确。
2. **LBS + 罗盘方位（兜底）**：marker 未命中或 AR 受限时，GPS 判定点位、
   罗盘决定朝向，给出距离、方位箭头与转向指引，并在到达半径后叠加复原示意；
   **不依赖平面检测**。
3. **复原图 + 方位示意（最终）**：无 AR/无定位时仍可查看复原图与方位说明。

> 不在户外开阔、低纹理夯土场地上依赖裸平面检测。

---

## 5. 降级策略

### 5.1 模式决议（`ar-libs/degrade.ts`）
启动流程：**能力探测 → 相机/定位授权 → `decideMode` 决议 → 挂载对应层**。

| 条件 | 模式 | 行为 |
|---|---|---|
| marker 支持 **且** 相机已授权 | `marker` | VKSession 相机画布 + marker 透视/3D 叠加 |
| 不满足上条 **但** 定位已授权（相机有无均可） | `lbs` | 相机（或主题背景）+ 距离/罗盘方位引导，到达叠加 |
| 其余（不支持 AR / 全未授权） | `static` | 复原图 + 方位示意，提供授权入口 |

### 5.2 运行时二次降级
- marker 初始化/相机渲染失败 → 定位可用则 `lbs`，否则 `static`；
- lbs 失败 → `static`。组件通过 `fallback` 事件上报，页面切换并强制重建（`reloadKey`）。
- **任何路径不得白屏或崩溃**：相机不可用即用主题背景，传感器不可用即给手动指引。

### 5.3 权限处理（`ar-libs/permission.ts`）
| 状态 | 处理 |
|---|---|
| 未请求（unknown） | `wx.authorize` 弹原生授权框 |
| 本次拒绝（denied） | 可再次请求，界面给说明 |
| 永久拒绝（permanently-denied） | 弹窗引导 `wx.openSetting` 手动开启 |
- 相机：`scope.camera`；定位：`scope.userLocation`（`app.json` 已声明
  `permission.scope.userLocation` 与 `requiredPrivateInfos`，**不改 app.json**）。
- 授权成功后重新决议模式并重建组件。

### 5.4 安卓专项提示
- 追踪初始化前：「请缓慢左右平移手机以初始化 AR」；
- 安卓不支持竖直平面：「当前机型不支持竖直平面，请将镜头对准地面/水平面」。

---

## 6. 云游模式（`pages/scene` AR 层）

云游 AR 层从静态复原图升级为**可环视 / 带光影**呈现，三级回退：
1. **XRFrame**：全景球或 glTF，带光照与阴影，可环视（门控 `xrframeSupport`）；
2. **宽幅全景 + 陀螺仪视差**（资源/能力受限时的可靠兜底）：
   `/package-tour/assets/panorama/<id>.jpg`，随设备方向水平偏移环视 + 手指拖动 + 光影扫光；
3. **复原图视差**：全景缺失时用 `arRestoreImage` 做视差。

> 现场（onsite）模式行为不变，走 `ar-camera`；云游（cloud）模式使用 `panorama-viewer`。

---

## 7. 3D / 素材资源清单

### 7.1 目录与命名
| 类型 | 目录 | 命名 | 格式/体积 |
|---|---|---|---|
| marker 识别图 | `assets/markers/` | `<sceneId>.png` | PNG，≥900²，≤250KB |
| 云游宽幅全景 | `assets/panorama/` | `<sceneId>.jpg` | JPG，约 2:1，≤500KB |
| 复原图 | `assets/scenes/<sceneId>/ar-restore.jpg` | 已存在 | JPG |
| 舞台背景 | `assets/scenes/<sceneId>/bg.jpg` | 已存在 | JPG |
| 3D 模型（升级） | CDN `models/<sceneId>.glb` | `<sceneId>.glb` | glb，Draco/网格压缩、单贴图 |

### 7.2 资源清单（7 点位统一）
sceneId：`danfengmen / hanyuan / xuanzheng / zichen / taiyechi / linde / xuanwumen`，
每点位对应：1 marker + 1 panorama（+ 已有 bg/ar-restore）；
glb 经 CDN 提供（`config.cdnBase + scene.arModel`），需在小程序后台配置 downloadFile 合法域名。

### 7.3 资源规范
- glb：单贴图、Draco/网格压缩，控制 DrawCall 与面数；命名 `models/<sceneId>.glb`。
- 图片统一压缩，优先包内本地路径；大尺寸/模型走 CDN（`config.cdnBase`）。
- 包体积硬约束：主包 ≤ 2MB、全包 ≤ 20MB（AR 素材全部位于 `package-tour` 分包，不占主包）。

---

## 8. 生命周期与性能
- 进入 AR 页创建会话，离开立即销毁（VKSession、相机、rAF、罗盘、音频）。
- 模型/贴图按需加载、复用缓存；监测内存与帧率，超限降级精度或模式。
- 组件 `detached` 必须释放会话与 GL 上下文；事件总线在页面销毁时 `clear`。

## 9. 验证方式
- 静态门禁：`node scripts/validate_m1.mjs`（页面四件套、JSON、七剧场、聚合、商品、体积）。
- 类型检查：`tsc -p . --noEmit` 保持 0 错误。
- 真机外路径：`?simulate=1` 模拟 marker 识别叠加；node 运行 `geo.ts` 验证距离/方位；
  代码走查权限拒绝、传感器缺失、三级降级路径。
- 残留：真机 marker 识别率、glb 实际渲染、七点位坐标需现场实测与真机回归。
