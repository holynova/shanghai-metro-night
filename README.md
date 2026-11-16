# 末班之后 / Shanghai Metro Night

拖动时间轴，查看上海地铁 14 条线路、338 个车站的双向服务状态。站点与线路沿用官方示意图布局，首末班来自官方时刻表；支持站名搜索、跨午夜播放、浅色与深色模式。灰色表示该方向当前无后续班次可上车，不代表轨道上没有列车，也不保证换乘成功。数据核验于 2026-11-16，不含临时运营调整。

Explore the first and last boarding times of 14 Shanghai Metro lines and 338 stations on the official schematic layout. Search stations, scrub through midnight, and switch between light and dark themes. Gray means no later boarding service at the selected station and direction. This is a published timetable snapshot, not live train tracking or a transfer guarantee.

![浅色地图 / Light map](assets/screenshot.png)

- [在线体验 / Live](https://xiaosang.cc/shanghai-metro-night/)
- [GitHub Repo](https://github.com/holynova/shanghai-metro-night)
- [深色预览 / Dark preview](assets/screenshot-dark.png)

<img src="assets/qr.png" width="180" alt="扫码打开上海地铁时间地图 / Open the metro map">

## 本地运行 / Run locally

```bash
npm ci
npm test
npm run build
npm run dev
```

Requires Node.js and Python 3. Open http://localhost:5179.

## 发布 / Deploy

```bash
npm run deploy:check
npm run deploy -- /path/to/holynova.github.io
```

Shared Worker `xiaosang-portfolio` · `xiaosang.cc/shanghai-metro-night/` · v1.0.0

源码与部署配置统一在 main；本地手动发布，不使用自动部署分支或 workflow。
Source and deployment configuration share main. Deploy manually from the committed production build.

官方数据与地图来源保存在 sources/；本项目不隶属于上海地铁。详细规则见站内数据来源页。
Official source snapshots are retained in sources/. This independent project is not affiliated with Shanghai Metro.

应用产物同步到作品集 master 的 shanghai-metro-night/ 后提交推送，再运行发布命令；脚本检查两边产物完全一致，防止只上传本站而覆盖其他项目。
Copy dist into the portfolio master route, commit and push both repositories, then deploy. The release script checks that all project assets match.

共享站点发布还需要完整图库产物；遵循作品集的 XIAOSANG_GALLERY_DIST 配置，缺失时构建会停止，避免覆盖其他作品。
The shared build also requires the complete gallery assets via XIAOSANG_GALLERY_DIST and refuses partial publication.
