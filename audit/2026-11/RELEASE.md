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

## 子路径发布结果（2026-11-16，取代上面的独立域名方案）

用户选择复用 xiaosang.cc/shanghai-metro-night/。项目已上线，独立 Worker 配置已移除。

- 应用 v1.0.0：生产源码 main/860a43a02e88bce6a22424bb54014eea780e9ca4；后续仅修改发布脚本和文档，main/a880a10。
- 项目与作品集共享 Worker xiaosang-portfolio，非两个独立 Worker。项目页面部署来源为作品集 master/44fc0feef78011ec9e8c2c1ce018c8d1281658d8。
- 成功 Cloudflare Version ID：ea60fe47-d0c9-48c3-88ab-ea156c1c1418。
- HTTPS 实测通过。线上 JS/CSS、地图数据、官方时刻数据和图标均 200，内容与源码逐字一致；来源页刷新可用。
- 浏览器验证：浅色默认、深色刷新记忆；跨午夜 2026-11-21 00:30 保持 144/836；3 号线显示上海南站、29 站、56 方向；390×844 下滑块底部 y=722，无横向溢出。未真机验证。
- 二维码独立解码为 https://xiaosang.cc/shanghai-metro-night/；README 与仓库 Homepage 已同步。截图复用已验证的相同界面。
- GitHub Profile main/6bcd903 已推送并在 GitHub 页面实测条目、Repo 和网站链接。
- 作品集卡片已推送 master/5513c1c，保留其他并行更新。尚未部署该卡片，线上 repos.json 回读确认还未收录。
- 原因：首次项目部署后，远端 ee72e47/7336ae3 加入“每次发布必须包含完整图库”的构建保护。已合入并遵守；本机缺少完整图库 dist、原图及衍生图，最新 dry-run 因 Gallery build missing 拒绝继续。未绕过最新保护。此前检查 /xiaosang-gallery/ 已是 404，本站首次发布没有声称修复它。
- 后续需要提供完整图库生产目录（XIAOSANG_GALLERY_DIST），再执行 npm run deploy，回读作品集 JSON 并检查卡片。地铁站点本身当前可用。
