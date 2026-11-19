export function generateCurlCode({ model, systemPrompt, messages, parameters }) {
  const allMessages = [];
  if (systemPrompt && systemPrompt.trim()) {
    allMessages.push({ role: 'system', content: systemPrompt.trim() });
  }
  messages.forEach(m => {
    if (m.content && m.content.trim()) {
      allMessages.push({ role: m.role, content: m.content.trim() });
    }
  });

  const payload = {
    model: model || 'openai/gpt-oss-120b',
    messages: allMessages.length > 0 ? allMessages : [{ role: 'user', content: 'Hello!' }],
    temperature: Number(parameters.temperature),
    max_tokens: Number(parameters.max_completion_tokens),
    stream: Boolean(parameters.stream),
  };

  if (parameters.json_mode) {
    payload.response_format = { type: 'json_object' };
  }

  if (parameters.reasoning_effort && (model.includes('r1') || model.includes('reasoning'))) {
    payload.reasoning_effort = parameters.reasoning_effort;
  }

  const jsonStr = JSON.stringify(payload, null, 2);

  return `curl "https://api.groq.com/openai/v1/chat/completions" \\
  -X POST \\
  -H "Authorization: Bearer \${GROQ_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonStr.replace(/'/g, "'\\''")}'`;
}

export function generatePythonCode({ model, systemPrompt, messages, parameters }) {
  const allMessages = [];
  if (systemPrompt && systemPrompt.trim()) {
    allMessages.push({ role: 'system', content: systemPrompt.trim() });
  }
  messages.forEach(m => {
    if (m.content && m.content.trim()) {
      allMessages.push({ role: m.role, content: m.content.trim() });
    }
  });

  const messagesStr = JSON.stringify(
    allMessages.length > 0 ? allMessages : [{ role: 'user', content: 'Hello!' }],
    null,
    4
  );

  return `import os
from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=${messagesStr},
    model="${model || 'openai/gpt-oss-120b'}",
    temperature=${parameters.temperature},
    max_tokens=${parameters.max_completion_tokens},
    stream=${parameters.stream ? 'True' : 'False'},${
      parameters.json_mode ? '\n    response_format={"type": "json_object"},' : ''
    }
)

${
  parameters.stream
    ? `for chunk in chat_completion:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`
    : `print(chat_completion.choices[0].message.content)`
}`;
}

export function generateJsCode({ model, systemPrompt, messages, parameters }) {
  const allMessages = [];
  if (systemPrompt && systemPrompt.trim()) {
    allMessages.push({ role: 'system', content: systemPrompt.trim() });
  }
  messages.forEach(m => {
    if (m.content && m.content.trim()) {
      allMessages.push({ role: m.role, content: m.content.trim() });
    }
  });

  const payload = {
    model: model || 'openai/gpt-oss-120b',
    messages: allMessages.length > 0 ? allMessages : [{ role: 'user', content: 'Hello!' }],
    temperature: Number(parameters.temperature),
    max_tokens: Number(parameters.max_completion_tokens),
    stream: Boolean(parameters.stream),
  };

  if (parameters.json_mode) {
    payload.response_format = { type: 'json_object' };
  }

  return `// JavaScript (Fetch / Node.js)
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.GROQ_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)}),
});

${
  parameters.stream
    ? `const reader = response.body.getReader();
const decoder = new TextDecoder("utf-8");

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  console.log(chunk);
}`
    : `const data = await response.json();
console.log(data.choices[0].message.content);`
}`;
}
