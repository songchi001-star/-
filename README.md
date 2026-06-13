# 联网小球排位对战 V1

第一版是一个可运行的自动战斗排位闭环：账号注册/登录、职业选择、直接排位匹配、真人不足时 AI 补位、服务端结算战斗、前端 Canvas 播放结果。

## 当前职业

- 三叉戟：穿刺突进、额外伤害、击退。
- 近战吸血鬼：碰撞吸血、血之撕咬、近战续航。

## 运行

需要 Node.js 18 或更高版本。

```bash
npm run dev
```

然后打开：

```text
http://localhost:3000
```

## 当前技术实现

- 后端：Node.js 原生 HTTP 服务，无第三方依赖。
- 前端：原生 HTML/CSS/JavaScript + Canvas。
- 数据：本地 `data/db.json`，服务启动后自动创建。
- 匹配：优先真人排位；等待约 3.5 秒没有对手时自动创建 AI 对手。
- 战斗：服务端生成完整战斗事件流，前端只负责播放。

## 上线前建议替换

- 把 `data/db.json` 替换成 PostgreSQL。
- 把 `TOKEN_SECRET` 设置为生产环境强随机密钥。
- 后端部署到 Railway、Render、Fly.io、腾讯云或阿里云。
- 前端可以继续由后端托管，也可以拆到 Vercel/Cloudflare Pages。
