# 模块交付：现场 AR（feature/ar-xrframe）

## 职责
在大明宫现场通过识别图与方位，在遗址之上叠加殿宇复原；不支持真机 AR 时自动降级，保证可演示。

## 文件清单
- `package-tour/pages/ar-camera/`：现场 AR 相机页（wxml / wxss / ts / json）；
- `docs/ar-contract.md`：AR 能力契约与降级策略；
- `package-tour/assets/scenes/*-restore.jpg`：七点位 AR 复原图。

## 关键设计
- 优先 VKSession v2：marker 识别图为主，平面识别为辅；监听 anchors 更新；
- LBS / 罗盘兜底：`wx.getLocation`（gcj02）+ 罗盘朝向，haversine 计算距离，进入触发半径自动叠加复原图；
- 户外低纹理夯土不靠裸平面，现场以 marker 为主、方位叠加兜底；
- 机型不支持 / 权限拒绝 / 不在现场，均自动降级到复原图浏览，云游模式不依赖实地。

## 边界
VKSession 机型有限（iOS 基础库 2.22、安卓 2.25），安卓不支持竖直平面、需平移初始化；真机前需实测七点位坐标（当前为近似值）。

## 验收
- 现场 AR 相机可进入、可扫描、可叠加；
- 任一环节失败均有降级路径，无黑屏 / 崩溃。
