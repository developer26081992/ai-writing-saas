"use server";

import { prisma } from "@/lib/prisma";
import { checkDocumentLimit } from "@/app/actions/plan-gates";

export async function createDocument(
  organisationId: string,
  userId: string,
  title: string
) {
  if (!title.trim()) {
    return {
      success: false,
      message: "Document title is required.",
    };
  }

  const limitCheck = await checkDocumentLimit(organisationId);

  if (!limitCheck.allowed) {
    return {
      success: false,
      message: limitCheck.message,
    };
  }

  const document = await prisma.document.create({
    data: {
      orgId: organisationId,
      authorId: userId,
      title: title.trim(),
      content: "",
      collaborationRoomId: `document-${Date.now()}`,
    },
  });

  return {
    success: true,
    document,
  };
}