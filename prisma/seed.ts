import { PrismaClient, Plan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "demo@example.com",
    },
    update: {},
    create: {
      id: "demo-user-1",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
    },
  });

  const organisation = await prisma.organisation.upsert({
    where: {
      id: "demo-org-1",
    },
    update: {},
    create: {
      id: "demo-org-1",
      name: "Demo Organisation",
      plan: Plan.FREE,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organisationId: {
        userId: user.id,
        organisationId: organisation.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organisationId: organisation.id,
      role: "OWNER",
    },
  });

  const document = await prisma.document.upsert({
    where: {
      collaborationRoomId: "demo-document-room",
    },
    update: {},
    create: {
      orgId: organisation.id,
      authorId: user.id,
      title: "My First AI Document",
      content: "",
      collaborationRoomId: "demo-document-room",
    },
  });

  console.log("Demo data created successfully.");
  console.log("User:", user.id);
  console.log("Organisation:", organisation.id);
  console.log("Document:", document.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });