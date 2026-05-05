DELETE FROM "ChatMessage"
WHERE content ILIKE '%MCP test%'
   OR content ILIKE '%automated MCP%';
