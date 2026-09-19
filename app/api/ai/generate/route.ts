import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { checkAIGenerationLimit } from "@/app/actions/plan-gates";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, documentId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response("Prompt is required", {
        status: 400,
      });
    }

    if (!documentId || typeof documentId !== "string") {
      return new Response("Document ID is required", {
        status: 400,
      });
    }

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return new Response("Document not found", {
        status: 404,
      });
    }

    // Check the organisation's AI generation limit
    const limitCheck = await checkAIGenerationLimit(
      document.orgId
    );

    if (!limitCheck.allowed) {
      return new Response(limitCheck.message, {
        status: 403,
      });
    }

    const modelName = "gpt-4o-mini";

    const result = streamText({
      model: openai(modelName),
      prompt,

      async onFinish({ text, usage }) {
        try {
          await prisma.aIGeneration.create({
            data: {
              documentId: document.id,
              userId: "demo-user-1",
              prompt,
              completion: text,
              tokens: usage.totalTokens,
              inputTokens: usage.promptTokens,
              outputTokens: usage.completionTokens,
              model: modelName,
            },
          });

          const currentMonth = new Date()
            .toISOString()
            .slice(0, 7);

          await prisma.usageMetric.upsert({
            where: {
              orgId_month: {
                orgId: document.orgId,
                month: currentMonth,
              },
            },
            update: {
              aiGenerations: {
                increment: 1,
              },
            },
            create: {
              orgId: document.orgId,
              month: currentMonth,
              aiGenerations: 1,
            },
          });

          console.log("AI generation saved successfully.");
          console.log("Tokens:", usage.totalTokens);
        } catch (error) {
          console.error(
            "FAILED TO SAVE AI GENERATION:",
            error
          );
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI ROUTE ERROR:", error);

    return new Response("AI generation failed", {
      status: 500,
    });
  }
}