SELECT m.id, m.content, m."createdAt", u."displayName"
FROM "ChatMessage" m
JOIN "User" u ON u.id = m."userId"
WHERE m.content ILIKE '%MCP test%'
   OR m.content ILIKE '%automated MCP%';
