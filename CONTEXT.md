# MYCOAT 项目交接 — 新对话快速接上

## 一句话现状
羽绒服独立站（对标 Moncler，$200 价位），复刻 mybirkin 架构。当前为**本地模式**（数据存 localStorage，无需任何账号即可完整跑通演示），上线前切换 Supabase 云模式。

## 代码位置
- 项目路径: `F:\mymoncler网站`（文件夹沿用旧名，品牌为 MYCOAT，域名 mycoat.shop）
- 参考项目: `F:\mybirkin网站`（皮具站，本项目的模板）

## 项目背景
高端羽绒服电商，客单价 $149–$289，目标客户欧美/中东。
技术栈: Next.js 14 + TypeScript + Tailwind CSS，黑白极简 + 红色点缀（蒙口风）。

## 当前功能
| 功能 | 路径 |
|------|------|
| 首页 | `/` — Hero、新品、精选、系列分类、品牌承诺 |
| 商品列表/详情 | `/shop`, `/product/[slug]`（含尺码选择） |
| 购物车 | Context + 侧边抽屉 + 移动端底部 Tab |
| 工艺展示 | `/craft` — 90/10 羽绒/面料/绗缝/版型 |
| 关于我们 | `/about` — Our Story |
| 客户评论 | 产品详情页下方（localStorage / Supabase） |
| 客服浮窗 | 右下 WhatsApp/Telegram（后台可配） |
| 管理后台 | `/admin` — 密码 `mycoat2026` |
| 结算支付 | `/checkout` — **PayPal + USDT 双通道** |

## 后台板块（全中文）
1. **产品管理** — 增删改产品（含尺码/颜色/多图上传）
2. **分类管理** — 男装/女装下的子分类（Short Down / Long Down / Vests / Parkas）
3. **首页编辑** — Hero 大图、标语、按钮、品牌承诺、系列区块
4. **联系方式** — WhatsApp/Telegram 链接
5. **支付设置** — PayPal（paypal.me 用户名）+ USDT（TRC-20 地址）
6. **关于我们** — Our Story 全部文字和图片
7. **客户订单** — 查看订单、标记状态（待处理/已收款/已联系/已完成）、删除

## 支付说明
- **PayPal**: 结算页下单后跳转 `paypal.me/{用户名}/{金额}`（后台支付设置里配用户名）
- **USDT**: 下单后展示 TRC-20 收款地址 + 金额，客户转账后在 WhatsApp 通知，后台手动"标记已收款"
- 订单含 `payment_method` 字段

## 数据存储（两模式）
- **本地模式（当前）**: 所有数据存 localStorage，键前缀 `mycoat_`（前后台同浏览器互通，换设备不互通）
- **云模式（上线前）**: 在 `.env.local` 填 Supabase 配置 + `NEXT_PUBLIC_DATA_MODE=supabase`，执行 `supabase-schema.sql`

## 产品图片
- AI 生成的 8 款羽绒服主图在 `public/products/`，同名替换即可换图
- 后台上传走 Cloudinary（复用 mybirkin 的账号，cloud: `vzsmwu1w`，preset: `mybirkin_uploads`）

## 环境约束
- Windows 机器，Node v22，npm 10
- 本机 git 不在 PATH（git commit/push 需在终端执行）
- 域名 `mycoat.shop` **已购买**（2026-09-04 注册）

## 用户偏好（沿用）
1. 后台中文，前端英文
2. 风格极简高级
3. 动手前先备份
4. 产品图用户之后会自己换
