"use server";

import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

const PLAN_LIMITS = {
  FREE: {
    aiGenerations: 10,
    documents: 5,
  },
  PRO: {
    aiGenerations: 500,
    documents: Infinity,
  },
  ENTERPRISE: {
    aiGenerations: Infinity,
    documents: Infinity,
  },
} as const;

export async function checkAIGenerationLimit(
  organisationId: string
) {
  const organisation = await prisma.organisation.findUnique({
    where: {
      id: organisationId,
    },
  });

  if (!organisation) {
    return {
      allowed: false,
      message: "Organisation not found.",
    };
  }

  const plan = organisation.plan as Plan;
  const limit = PLAN_LIMITS[plan];

  const currentMonth = new Date().toISOString().slice(0, 7);

  const usage = await prisma.usageMetric.findUnique({
    where: {
      orgId_month: {
        orgId: organisationId,
        month: currentMonth,
      },
    },
  });

  const generationsUsed = usage?.aiGenerations ?? 0;

  if (generationsUsed >= limit.aiGenerations) {
    return {
      allowed: false,
      message: `You have reached the ${plan} plan limit of ${limit.aiGenerations} AI generations this month. Please upgrade your plan to continue.`,
      plan,
      used: generationsUsed,
      limit: limit.aiGenerations,
    };
  }

  return {
    allowed: true,
    plan,
    used: generationsUsed,
    limit: limit.aiGenerations,
  };
}

export async function checkDocumentLimit(
  organisationId: string
) {
  const organisation = await prisma.organisation.findUnique({
    where: {
      id: organisationId,
    },
  });

  if (!organisation) {
    return {
      allowed: false,
      message: "Organisation not found.",
    };
  }

  const plan = organisation.plan as Plan;
  const limit = PLAN_LIMITS[plan];

  const documentsCreated = await prisma.document.count({
    where: {
      orgId: organisationId,
    },
  });

  if (documentsCreated >= limit.documents) {
    return {
      allowed: false,
      message: `You have reached the ${plan} plan document limit. Please upgrade your plan to create more documents.`,
      plan,
      used: documentsCreated,
      limit: limit.documents,
    };
  }

  return {
    allowed: true,
    plan,
    used: documentsCreated,
    limit: limit.documents,
  };
}