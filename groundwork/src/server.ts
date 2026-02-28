import { createWorkersAI } from "workers-ai-provider";
import { routeAgentRequest, type Schedule } from "agents";
import { AIChatAgent } from "@cloudflare/ai-chat";
import {
  streamText,
  convertToModelMessages,
  pruneMessages,
  tool,
  stepCountIs,
  type StreamTextOnFinishCallback,
  type ToolSet
} from "ai";
import { z } from "zod";

export class ChatAgent extends AIChatAgent<Env> {
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: { abortSignal?: AbortSignal }
  ) {
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      system: `You are DeepSearch AI, an expert multi-step research agent. 

When a user asks a research question, you must:
1. DECOMPOSE the question into 2-3 specific sub-topics to research
2. SEARCH each sub-topic using the webSearch tool
3. ANALYZE the results and extract key findings
4. SYNTHESIZE everything into a clear, structured research brief

Always think step by step. Show your reasoning. Use multiple searches to build a complete picture.
Format your final answer with clear sections: Summary, Key Findings, and Conclusion.
Cite your sources.`,
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages"
      }),
      tools: {
        webSearch: tool({
          description: "Search the web for information on a topic. Use this multiple times to research different aspects of the question.",
          inputSchema: z.object({
            query: z.string().describe("The search query"),
          }),
          execute: async ({ query }) => {
            const response = await fetch("https://api.tavily.com/search", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${(this.env as any).TAVILY_API_KEY}`,
              },
              body: JSON.stringify({
                query,
                max_results: 5,
                search_depth: "basic",
              }),
            });
            const data = await response.json() as any;
            return {
              query,
              results: data.results?.map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content?.slice(0, 500),
              })) ?? [],
            };
          },
        }),

        getUserTimezone: tool({
          description: "Get the user's timezone from their browser.",
          inputSchema: z.object({}),
        }),
      },
      onFinish,
      stopWhen: stepCountIs(10),
      abortSignal: options?.abortSignal
    });

    return result.toUIMessageStreamResponse();
  }

  async executeTask(description: string, _task: Schedule<string>) {
    console.log(`Executing scheduled task: ${description}`);
    this.broadcast(
      JSON.stringify({
        type: "scheduled-task",
        description,
        timestamp: new Date().toISOString()
      })
    );
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
