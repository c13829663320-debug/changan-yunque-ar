# 云开发接入指南（本地演示 ↔ 云端）

本项目默认 `useMock = true`，所有景点、剧场、商品、意向数据均读取小程序包内的结构化数据，**可完全离线演示**。需要真实云端能力（意向登记落库、开售提醒、多端同步）时，按以下步骤接入微信云开发。

## 1. 准备 AppId

`project.config.json` 当前为测试号占位 `touristappid`。真机与云开发需使用真实 AppId：

- 在微信公众平台注册小程序并取得 AppId；
- 微信开发者工具 → 右上角「详情 → 项目设置」填入 AppId（或导入时选择对应小程序）。

## 2. 开通云开发并创建环境

1. 微信开发者工具顶部点击「云开发」，按提示开通；
2. 新建一个环境，自定义名称（如 `changan-prod`），复制 **环境 ID**（形如 `changan-prod-1a2b3c`）；
3. 在「云开发 → 数据库」中新建集合 `intentions`；
   - 权限可先设为「仅创建者可读写」（云函数以管理端写入，建议权限保持私有）。

## 3. 填入环境 ID 并关闭 Mock

打开 `miniprogram/config/index.ts`：

```ts
const config: AppConfig = {
  cloudEnvId: '你的环境ID', // 填入上一步的环境 ID
  cdnBase: '',             // 可选：静态资源 CDN 前缀
  useMock: false,          // 改为 false，数据层走云端
  version: '0.1.0',
};
```

- `useMock = true`：全部读本地数据，云函数不调用（评委离线演示用）；
- `useMock = false` 且 `cloudEnvId` 已填：`app.ts` 会 `wx.cloud.init`，意向单从云函数提交 / 查询。

## 4. 部署云函数 intention

1. 确认 `project.config.json` 中 `cloudfunctionRoot` 指向 `cloudfunctions/`；
2. 在开发者工具左侧目录找到 `cloudfunctions/intention`；
3. 右键 → 「上传并部署：云端安装依赖」（会自动安装 `wx-server-sdk`）；
4. 部署成功后可在云函数面板「云端测试」：
   - 提交：`{ "action": "create", "goodsIds": ["g-yunque-blindbox"], "name": "测试", "phone": "13800138000" }`
   - 查询：`{ "action": "query" }`

云函数能力：
- `action='create'`：单/批量写入 `intentions`，含商品、称呼、手机号（服务端校验 `^1[3-9]\d{9}$`）、备注、openid、时间；
- `action='query'`：返回当前 openid 的全部意向，按时间倒序。

## 5.（可选）CDN 与合法域名

- 3D 模型、视频、大图建议放云存储 / CDN，将前缀填入 `config.cdnBase`；
- 在「小程序后台 → 开发 → 服务器域名」将 CDN 域名加入 `downloadFile` / `request` 合法域名；
- 未配置时使用包内资源，AR 复原图、商品图已内置并压缩，不影响演示。

## 6. 验证清单

- [ ] `app.ts` 启动无云相关报错，全局 `cloudReady = true`；
- [ ] 商城 → 详情 → 预售登记 / 购物车结算 → 意向单填写手机号 → 提交成功；
- [ ] 云开发数据库 `intentions` 集合出现记录；
- [ ] 重新进入意向单，可从云端查询到历史登记；
- [ ] 切回 `useMock = true` 后离线演示链路依旧完整。
