# 模块交付：现场 AR / XRFrame（feature/ar-xrframe）

## 职责
在大明宫现场识别 marker，在遗址之上叠加殿宇复原；marker 未命中时以 LBS + 罗盘方位引导；
不支持真机 AR 时自动降级为「复原图 + 方位指引」，任何路径不白屏、不崩溃。云游模式提供可环视 / 带光影呈现。

## 实际交付文件
- `package-tour/pages/ar-camera/`：薄编排页（能力探测 / 授权 / 模式决议 / 运行时降级 / 权限重试）；
- `package-tour/ar-libs/`：共享能力层
  - 冻结契约：`types / event-bus / permission / capability / degrade / geo`；
  - 分片实现：`marker-tracker / vk-render`（marker 片）、`compass / lbs-guide`（LBS 片）、`gyro / panorama`（云游片）；
- `package-tour/ar-components/`：`marker-layer`（VKSession 相机画布 + 透视叠加）、
  `lbs-layer`（相机/主题背景 + 方位引导/静态兜底）、`panorama-viewer`（云游三级回退）；
- `package-tour/assets/markers/`：7 张 marker 识别图（PNG，高对比高熵）；
- `package-tour/assets/panorama/`：7 张云游宽幅全景（JPG，约 2:1）；
- `docs/ar-contract.md`：marker 规范、坐标口径、降级策略、3D 资源清单（唯一对外契约）。

## 关键设计
- 模式阶梯：`marker`（VKSession marker + WebGL 相机背景 + 复原图透视叠加，glb 为升级项）
  → `lbs`（GCJ-02 定位 + 罗盘方位箭头/转向文案，到达半径叠加）
  → `static`（复原图 + 方位示意 + 授权入口）；
- 相机/定位授权完整覆盖申请、拒绝、永久拒绝（引导 openSetting）；
- 安卓：平移初始化提示、不支持竖直平面提示；
- 云游 `panorama-viewer`：XRFrame（光影/阴影）→ 全景图 + 陀螺仪视差/拖动环视 → 复原图视差 → CSS 殿宇兜底；
- 户外低纹理夯土不靠裸平面，现场以 marker 为主、方位叠加兜底。

## 边界
VKSession 机型口径：iOS 基础库 2.22、安卓 2.25；安卓不支持竖直平面、需平移初始化。
七点位 geo/radius 为近似值，代码与界面均标注「需现场实测」。
未改 app.json、剧场对话文案、package-spot、package-mall、data/ 数据文件。

## 验证
- `node scripts/validate_m1.mjs`：✅ 通过（主包约 1.43MB / 全包约 11.46MB）；
- `tsc -p . --noEmit`：0 错误；
- node 实测 geo 距离/方位、marker-tracker/panorama 纯逻辑断言；`?simulate=1` 可在无真机演示叠加；
- 残留：真机 marker 识别率、WebGL 相机背景与 glb 渲染、七点位坐标需现场实测与真机回归。
