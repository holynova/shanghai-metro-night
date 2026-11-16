# 正式版发布状态

- 类型：已发布项目检查补齐（旧 Sites 已发布，此次迁往 Cloudflare）。
- 应用：shanghai-metro-night v1.0.0，源码 main/f91f894。
- GitHub：https://github.com/holynova/shanghai-metro-night，公开仓库创建并推送成功。
- 界面：首轮审计两组遗留已修；默认浅色，切换深色并持久化，来源页共享主题。
- 验证：36 项测试通过；构建、Wrangler dry-run、README 和页面版本校验通过；390×844 手机滑块首屏可见；320/768 无横向溢出。未真机验证。
- 生产资产：仅 dist 内 12 个文件；截图 assets/screenshot.png、screenshot-dark.png（1440×1000）、screenshot-mobile.png（390×844）。
- Repo 链接与统一 Umami 已接入。
- Cloudflare：目标 Worker shanghai-metro-night，目标域名 shanghai-metro-night.xiaosang.cc。2026-11-16 部署失败：API code 10037，免费账户达到 100 Worker 上限。没有成功 deployment ID，没有宣称域名已上线。
- 二维码：已生成目标独立子域名的二维码；域名待部署，暂不能作为可用入口。
- GitHub Homepage、作品集、Profile：暂未发布，等待项目 HTTPS 验证。不会将不可用链接写入正式作品目录。
- 作品集：master 更新到 origin/master/2604cc1，用户未跟踪的 .impeccable/ 保留。现有 stage-cloudflare.mjs 还依赖本地图库完整产物，当前缺失；线上 /xiaosang-gallery/ 及 release.json 返回 404。未绕过构建保护或覆盖作品集部署。
- 待选择：保留独立域名并由用户处理配额，或复用现有 Worker 的站点路径；不自动删除 Worker、不自动升级付费。
