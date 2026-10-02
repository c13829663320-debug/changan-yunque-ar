# 云开发切换说明（useMock → 云开发）

> 目标：Demo 阶段 `useMock=true` 可离线直接演示；上线前按本指南逐步切到微信云开发，**每一步都可单独回退**。切换期间不要一次性改完全部数据源，按「先验证环境 → 再切写操作 → 最后切读」的顺序灰度。

## 0. 当前默认状态（开箱即演示）

`miniprogram/config/index.ts`：

```ts
{
  cloudEnvId: '',     // 空 = 不调用云能力
  cdnBase: '',        // 空 = gallery 网络图可能因未配域名而不显示，但本地 cover 不受影响
  useMock: true,      // true = 全部读本地结构化数据
}
```

- `app.ts` 的 `onLaunch` 已写好：**只有 `wx.cloud && config.cloudEnvId` 同时为真才 `wx.cloud.init`**；留空时静默跳过，小程序可完全离线运行。
- 商品封面 `cover` 是**主包本地图**（`/assets/goods/<id>.jpg`），不依赖网络，演示时列表与详情首图始终可见。
- `gallery` 高清图与 3D 模型是**网络图**，未配合法域名前会加载失败——属预期，不影响本地封面。

## 1. 创建云环境

1. 微信开发者工具 → 云开发 → 开通，新建环境，记下 **环境 ID**。
2. 把环境 ID 填入 `miniprogram/config/index.ts`：

```ts
cloudEnvId: '你的云环境ID',
```

此时 `app.ts` 会自动 `wx.cloud.init`，`globalData.cloudReady=true`。**不要**同时把 `useMock` 改成 false，先保持 true 验证初始化成功（控制台无 `[cloud] init skipped`）。

## 2. 部署 intention（预售意向）云函数

仓库已带 `cloudfunctions/intention/`（读写云数据库 `intentions` 集合）：

1. 右键 `cloudfunctions/intention` → 上传并部署：云端安装依赖。
2. 在云开发控制台新建集合 `intentions`，权限选「仅创建者可读写」。
3. 函数入参/出参：
   - 入参 `{ goodsId: string, contact?: string }`
   - 出参 `{ success: boolean, _id?: string, message?: string }`

### 前端接线（把本地 storage 意向单升级为云端）

当前 `package-mall/pages/goods-detail/goods-detail.ts` 与 `intention` 页用本地 storage：

```ts
const INTENTION_KEY = 'changan_yunque_intentions'; // 本地数组
```

切换写法（保留本地为离线兜底）：

```ts
async registerIntention() {
  const id = this.data.goods?.id;
  if (!id) return;
  if (config.useMock || !getApp().globalData.cloudReady) {
    // 现有本地逻辑：push 进 storage，跳转 intention 页
    return;
  }
  const res = await wx.cloud.callFunction({ name: 'intention', data: { goodsId: id } });
  if (res.result?.success) wx.showToast({ title: '已登记意向', icon: 'success' });
}
```

`cart` 同理：`changan_yunque_cart` 本地数组先保留；正式订单再走云函数/云数据库 `orders`。

## 3. 合法域名（downloadFile）

`catalog.ts` 中 `gallery` 与（未来的）3D 模型都走网络图，需要：

1. 微信公众平台 → 开发管理 → 开发设置 → 服务器域名。
2. 在 **downloadFile 合法域名**加入你的 CDN 域名（即 `config.cdnBase` 的来源域名）。
   - 云开发静态托管/云存储域名形如 `https://<env-id>.file.myqcloud.com`。
3. 填入 `config.cdnBase`，前端用 `config.cdnBase + path` 拼接。
4. 注意：`wx.cloud.callFunction` 与云存储走云通道，**不需要**配 request/downloadFile 域名；只有自建 CDN 图才需要。

> 开发阶段可在开发者工具勾选「不校验合法域名」临时预览 gallery，**但真机预览必须配域名**。

## 4. 各 Repository 数据源切换（读侧，最后做）

当前读侧全部读本地模块：

| Repository | 当前本地数据源 | 切云后 |
|---|---|---|
| `goodsRepo.ts` | `data/goods/catalog.ts` | 云数据库 `goods` 集合，或云静态 JSON |
| `spotRepo.ts` | `data/spot/*` | 云数据库 `spots` |
| `sceneRepo.ts` | `data/scenes/*`（三朝中轴七点位） | 云数据库 `scenes`，字段保持 `ScenePoint` 结构 |
| `store/progress.ts` | storage `changan_yunque_progress_v1` | 云数据库 `progress`（按 openid），本地仍作缓存 |

切换模式建议：在每个 Repo 内部按 `config.useMock` 分流，**不要**改页面调用签名：

```ts
import config from '../../config';
export async function getGoods(id: string): Promise<Goods | undefined> {
  if (config.useMock) return catalog.find((g) => g.id === id);
  const db = wx.cloud.database();
  const res = await db.collection('goods').where({ id }).get();
  return res.data[0];
}
```

> 读侧改异步会牵动页面 `onLoad`，建议**最后切**，且先只切一个 Repository 验证，再逐个铺开。页面侧把同步取值改成 `await` 即可。

## 5. 切换检查清单

- [ ] `cloudEnvId` 已填，控制台无 init 报错。
- [ ] `intention` 云函数已上传部署，`intentions` 集合已建。
- [ ] 真机点「预售登记」→ 云数据库 `intentions` 出现一条记录（openid 自动带上）。
- [ ] downloadFile 合法域名已配，gallery 高清图真机可显示。
- [ ] `useMock=false` 前，先在 `useMock=true` 下把云端写通路（意向登记）跑通。
- [ ] 回退方式：把 `cloudEnvId` 置空、`useMock` 置 true 即可恢复离线 Demo。

## 6. 红线

- 切换云开发**不改变**史实与文案：文物相关仍标注「文物灵感 / AIGC 再现」。
- 不要把用户 openid 等隐私写进前端日志或界面。
- 云数据库集合权限默认最小化（仅创建者可读写），不要为图方便开「所有用户可读」。
