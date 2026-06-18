import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

interface GenerateOptions {
  systemPrompt: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json_object" | "text";
}

export async function generateAIResponse(options: GenerateOptions) {
  const {
    systemPrompt,
    messages,
    temperature = 0.3,
    maxTokens = 2000,
    responseFormat = "json_object",
  } = options;

  const response = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature,
    max_tokens: maxTokens,
    ...(responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateStreamingResponse(
  systemPrompt: string,
  messages: ChatCompletionMessageParam[],
  onToken: (token: string) => void,
  maxTokens: number = 3000
) {
  const stream = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.3,
    max_tokens: maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) onToken(content);
  }
}
