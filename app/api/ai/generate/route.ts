import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("AI PROMPT:", prompt);
    console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    result.text.then((text) => {
      console.log("AI RESULT:", text);
    }).catch((error) => {
      console.error("AI STREAM ERROR:", error);
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI ROUTE ERROR:", error);

    return new Response("AI generation failed", {
      status: 500,
    });
  }
}