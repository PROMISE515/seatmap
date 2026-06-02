# Safe Seat 项目报告

## 1. 项目概述

**Safe Seat**（代码内名：SeatMap，曾用部署名：Swift Restroom Finder）是一个移动端优先的 Web 应用，帮助在中国的外国人快速找到附近的坐式马桶（非蹲坑）。核心卖点是 10 秒内给出结果，覆盖商场、酒店、咖啡馆等场所。

## 2. 技术栈

| 类别   | 技术                                              |
| ------ | ------------------------------------------------- |
| 框架   | TanStack Start (React 19 + SSR)                   |
| 路由   | TanStack Router v1                                |
| UI     | shadcn/ui (Radix + Tailwind CSS v4)               |
| 数据库 | Supabase (Postgres)                               |
| 地图   | 高德 AMap Web Service API                         |
| 支付   | Stripe Embedded Checkout                          |
| AI翻译 | Google Gemini 2.5 Flash Lite (Lovable AI Gateway) |
| 部署   | Cloudflare Workers                                |
| 包管理 | Bun                                               |

## 3. 核心功能

- **附近搜索** — 获取用户 GPS 坐标（WGS-84 → GCJ-02），调高德 API 搜索 1km 内厕所，用分类器筛选坐便器
- **厕所详情** — 显示名称、距离、楼层、类型标签（室内/无障碍/母婴/公共），一键导航（Apple Maps / Google Maps / 高德）
- **城市指南** — 上海、北京的公共厕所攻略页（SEO 优化）
- **Travel Pass 付费** — 首次免费，后续搜索需付费（$1.99/7天，$3.99/14天，$6.99/30天）
- **名称翻译** — AI 将中文 POI 名称翻译为英文，缓存到 Supabase

## 4. 页面结构

| 路由                    | 说明                                            |
| ----------------------- | ----------------------------------------------- |
| `/`                     | 首页搜索，绿色按钮 "Find Nearby Western Toilet" |
| `/toilet/$id`           | 厕所详情 + 导航入口                             |
| `/$city/public-toilets` | 城市指南（上海/北京）                           |
| `/checkout/return`      | 支付成功页，保存私密访问链接                    |
| `/pass`                 | 验证并激活 Travel Pass                          |

## 5. 数据库架构

**toilets 表** — 缓存高德 POI 数据（amap_id, name, name_en, address, city, lat, lng, photo_url 等）
**toilet_search_cache 表** — 搜索结果缓存（cache_key, lat, lng, radius_m, amap_ids），24 小时 TTL

## 6. 业务流程

```
用户定位 → 坐标转换(WGS-84→GCJ-02) → 查Supabase缓存
→ (命中: 直接返回 / 未命中: 调高德API)
→ 过滤坐便器(isLikelyWestern) → AI翻译名称 → 缓存结果
→ 展示ToiletCard → (第2次搜索弹出Stripe付费)
```

## 7. 代码规模

项目约 500 个 dependencies，核心代码分布在 `src/routes/`（5 个路由），`src/components/`（30+ shadcn UI 组件 + 业务组件），`src/lib/`（11 个工具模块）。

## 8. 初始化状态

- ✅ 已从 GitHub 克隆到本地
- ✅ `bun install` 成功，505 packages 安装完成
- ❌ 缺少环境变量，无法直接运行（AMAP_WEB_SERVICE_KEY、Stripe keys、LOVABLE_API_KEY）
- ❌ 需要先在 Supabase 运行 migrations 创建表结构

## 9. 主要问题

1. **名称混乱** — 文件夹/代码/部署域名用了三套不同名字
2. **付费形同虚设** — localStorage 计数，清缓存即可无限免费用
3. **依赖太多外部服务** — AMap + Supabase + Stripe + Lovable AI + Cloudflare，任一挂了应用不可用
4. **硬编码域名白名单** — 部署到自定义域名会报错
5. **高德 API 限流** — 无配额处理和 fallback
6. **无离线模式** — mock 数据未实际接入
