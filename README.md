# 许家印大模型

公益（玩笑）OpenAI 兼容接口，部署在 Cloudflare Worker 上。不限速、不限量、不需要密钥，任何 OpenAI 客户端填对 Base URL 就能用。

> 说明：本项目是玩笑性质，返回的是预设文本，**不是真模型**。

## 接口信息

| 项 | 值 |
| --- | --- |
| Base URL | `https://你的域名` |
| 模型名 | `许家印` |
| 鉴权 | 不需要（密钥随便填） |

支持的端点：

- `POST /v1/chat/completions`（支持 `stream: true`）
- `GET /v1/models`

## 调用示例

```bash
curl https://你的域名/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"许家印","messages":[{"role":"user","content":"你好"}],"stream":false}'
```

流式：

```bash
curl https://你的域名/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"许家印","messages":[{"role":"user","content":"你好"}],"stream":true}'
```

## 修改随机返回文案

有两种方式，二选一即可：

### 方式一：直接改 `worker.js`

编辑 `worker.js` 顶部的 `DEFAULT_REPLIES` 数组，增删改里面的字符串即可。

### 方式二：用环境变量（推荐）

在 Cloudflare 控制台 `Workers > 你的项目 > Settings > Variables` 里添加一个变量 `REPLIES`，值为 JSON 字符串数组：

```json
["文案一","文案二","文案三"]
```

或在 `wrangler.toml` 里加：

```toml
[vars]
REPLIES = "[\"文案一\",\"文案二\"]"
```

环境变量存在时会覆盖 `DEFAULT_REPLIES`。

## 本地调试

```bash
npm install
npm run dev
```

## 部署

```bash
npm install
npm run deploy
```

按提示登录 Cloudflare 即可。部署完成后把域名当 Base URL 用。

## 接入你自己的判断逻辑

`worker.js` 里 `randomReply(replies)` 是唯一的回复出口。把你 Python 判断函数翻译成 JS，改这一处即可（例如根据 `messages` 里最后一条用户发言做关键词判断，返回不同文案）。

> 免责声明：文案中的第三方邀请链接属于官方返利活动，点击、注册前请自行确认。