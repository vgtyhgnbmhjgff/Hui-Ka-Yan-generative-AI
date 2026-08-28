# 许家印大模型

OpenAI 兼容接口，部署在 Cloudflare Worker 上。不限速、不限量、不需要密钥，任何 OpenAI 客户端填对 Base URL 就能用。

说明：本项目是玩笑，返回的是预设文本，不是真模型。

## 接口信息

Base URL：`https://你的域名/v1`

模型名：`许家印大模型`、`许家印图片生成`

鉴权：不需要，密钥随便填。

支持的端点：

- `POST /v1/chat/completions`，支持 `stream: true`
- `GET /v1/models`
- `GET /`，居中的落地页，Base URL 会自动显示当前域名

## 调用示例

```bash
curl https://你的域名/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"许家印大模型","messages":[{"role":"user","content":"你好"}]}'
```

流式：

```bash
curl https://你的域名/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"许家印大模型","messages":[{"role":"user","content":"你好"}],"stream":true}'
```

OpenAI 官方 SDK：

```python
from openai import OpenAI
client = OpenAI(base_url="https://你的域名/v1", api_key="随便填")
r = client.chat.completions.create(
    model="许家印大模型",
    messages=[{"role": "user", "content": "你好"}],
)
print(r.choices[0].message.content)
```

## 修改随机回复文案

二选一。

方式一：改 `worker.js` 顶部的 `DEFAULT_REPLIES` 数组。

方式二：在 Cloudflare 控制台 `Workers > 你的项目 > Settings > Variables` 加变量 `REPLIES`，值为 JSON 字符串数组：

```json
["文案一","文案二","文案三"]
```

环境变量存在时会覆盖 `DEFAULT_REPLIES`。

## 本地调试

```bash
npm install
npm run dev
```

## 部署

用 `wrangler` 命令行：

```bash
npm install
npm run deploy
```

或者从 GitHub 部署：推上 GitHub 后，在 Cloudflare `Workers & Pages > Create > Continue with GitHub` 选仓库，构建命令留空，`Save and Deploy`。

## 绑定自定义域名

`Workers & Pages > 你的项目 > Settings > Domains & Routes > Add > Custom Domain`，填入域名即可。域名托管在 Cloudflare 时 DNS 会自动配好。

## 接入自己的判断逻辑

`worker.js` 里 `randomReply(replies)` 是唯一的回复出口，把判断逻辑写在这里即可。

免责声明：文案中的第三方邀请链接属于官方返利活动，点击、注册前请自行确认。