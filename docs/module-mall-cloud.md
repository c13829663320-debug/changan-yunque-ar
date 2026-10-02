# 模块交付：云阙商城与云开发（feature/mall-cloud）

## 职责
提供文创商品浏览、AR 预览、加购 / 预售登记、意向单闭环，并打通微信云开发。

## 文件清单
- `data/types/goods.ts`、`data/goods/catalog.ts`：14 个 SKU；
- `data/repositories/goodsRepo.ts`：商品数据访问与封面推导；
- `pages/mall/`：商城首页；
- `package-mall/pages/goods-detail/`：商品详情（含 AR 预览）；
- `package-mall/pages/cart/`：购物车；
- `package-mall/pages/intention/`：意向单（联系方式表单 + 云函数 + 本地降级）；
- `cloudfunctions/intention/`：意向云函数；
- `docs/cloud-setup.md`：云开发接入指南。

## 关键设计
- 商城阶段不接真实支付，采用「展示 + 预售意向登记」；
- 云函数 `intention`：`action='create'` 支持单 / 批量写入并在服务端校验手机号，`action='query'` 返回当前用户意向；
- `config.useMock = true` 时全本地、可离线演示；填 `cloudEnvId` 并置 `false` 后走云端；
- 云端不可用时自动降级本地登记，链路不断。

## 验收
- 浏览 → AR 预览 → 加购 / 预售登记 → 意向单提交，全程可演示；
- 云端模式意向可真实提交 / 查询；文档含环境 ID 配置步骤。
