import fs from "node:fs";
import path from "node:path";

function stripComments(code, isTSX) {
  let out = "";
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];
    if (ch === '"' || ch === "'") {
      out += ch;
      i++;
      while (i < n && code[i] !== ch) {
        if (code[i] === "\\" && i + 1 < n) {
          out += code[i] + code[i + 1];
          i += 2;
          continue;
        }
        out += code[i++];
      }
      if (i < n) out += code[i++];
      continue;
    }
    if (ch === "`") {
      out += ch;
      i++;
      while (i < n && code[i] !== "`") {
        if (code[i] === "\\" && i + 1 < n) {
          out += code[i] + code[i + 1];
          i += 2;
          continue;
        }
        if (code[i] === "$" && code[i + 1] === "{") {
          out += "${";
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (code[i] === "{") depth++;
            else if (code[i] === "}") depth--;
            if (depth === 0) break;
            out += code[i++];
          }
          if (i < n) out += code[i++];
          continue;
        }
        out += code[i++];
      }
      if (i < n) out += code[i++];
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < n - 1 && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  out = out.replace(/^[ \t]+\n/gm, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

function walk(dir, filter, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "generated") continue;
      walk(full, filter, list);
    } else if (filter(full)) {
      list.push(full);
    }
  }
  return list;
}

const root = path.resolve(process.argv[2] || "src");
const files = walk(root, (f) => /\.(ts|tsx|mjs|js)$/.test(f));
let changed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const out = stripComments(src, f.endsWith(".tsx"));
  if (out !== src) {
    fs.writeFileSync(f, out);
    changed++;
    console.log(`stripped: ${path.relative(process.cwd(), f)}`);
  }
}
console.log(`\nDone. ${changed} / ${files.length} files modified.`);
