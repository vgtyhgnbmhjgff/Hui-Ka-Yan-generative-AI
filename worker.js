const MODELS = ["许家印大模型", "许家印图片生成"];
const DEFAULT_MODEL = MODELS[0];

const DEFAULT_REPLIES = [
  "做公益就是为了你们调用，你们都调用了我为什么还要给你们真模型",
  "预付恒大顶级别墅，送许家印空城计教程"
];

function resolveReplies(env) {
  try {
    if (env && typeof env.REPLIES === "string" && env.REPLIES.trim()) {
      const parsed = JSON.parse(env.REPLIES);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  return DEFAULT_REPLIES;
}

function pickModel(body) {
  if (body && typeof body.model === "string" && MODELS.includes(body.model)) return body.model;
  return DEFAULT_MODEL;
}

function randomReply(replies) {
  return replies[Math.floor(Math.random() * replies.length)];
}

function chatId() {
  return "chatcmpl-" + crypto.randomUUID();
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS }
  });
}

function sse(payload) {
  return "data: " + JSON.stringify(payload) + "\n\n";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === "/v1/models") {
      return jsonResponse({
        object: "list",
        data: MODELS.map((m) => ({ id: m, object: "model", created: 1700000000, owned_by: "xujiayin" }))
      });
    }

    if (url.pathname !== "/v1/chat/completions") {
      return jsonResponse({ error: { message: "not found", type: "invalid_request_error" } }, 404);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: { message: "invalid json body", type: "invalid_request_error" } }, 400);
    }

    const model = pickModel(body);
    const replies = resolveReplies(env);
    const content = randomReply(replies);
    const created = Math.floor(Date.now() / 1000);
    const id = chatId();
    const promptTokens = typeof body.prompt_tokens === "number" ? body.prompt_tokens : 0;
    const completionTokens = typeof body.completion_tokens === "number" ? body.completion_tokens : 0;

    if (body.stream === true) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sse({
            id, object: "chat.completion.chunk", created, model,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }]
          })));
          for (const ch of content) {
            controller.enqueue(encoder.encode(sse({
              id, object: "chat.completion.chunk", created, model,
              choices: [{ index: 0, delta: { content: ch }, finish_reason: null }]
            })));
          }
          controller.enqueue(encoder.encode(sse({
            id, object: "chat.completion.chunk", created, model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
          })));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          ...CORS
        }
      });
    }

    return jsonResponse({
      id,
      object: "chat.completion",
      created,
      model,
      choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens || Math.ceil(content.length / 2),
        total_tokens: promptTokens + (completionTokens || Math.ceil(content.length / 2))
      }
    });
  }
};
