// One-off cleanup: remove test chat message left from MCP testing.
// Run: node --env-file=.env.local scripts/delete-test-chat.mjs

import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

const filters = [
  { content: { contains: "automated MCP test" } },
  { content: { contains: "MCP test" } },
];

let total = 0;
for (const where of filters) {
  const matches = await prisma.chatMessage.findMany({
    where,
    select: { id: true, content: true, createdAt: true, user: { select: { displayName: true } } },
  });
  if (matches.length === 0) continue;
  console.log(`\nMatching ${matches.length} message(s):`);
  for (const m of matches) {
    console.log(`  · [${m.createdAt.toISOString()}] ${m.user?.displayName ?? "?"}: ${m.content}`);
  }
  const result = await prisma.chatMessage.deleteMany({ where });
  total += result.count;
  console.log(`  → deleted ${result.count}`);
}

if (total === 0) console.log("Nothing to delete.");
else console.log(`\nDone. Total deleted: ${total}`);

await prisma.$disconnect();
