// Improved markdown-to-HTML renderer for blog posts.
// Supports: headings, fenced code blocks, lists, blockquotes, hr, bold, italic,
// inline code, strikethrough, and links.

export function renderMarkdown(raw: string): string {
  if (!raw?.trim()) return "";

  // ── 1. Protect fenced code blocks ──────────────────────────────────────────
  const codeBlocks: string[] = [];
  const text = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const idx = codeBlocks.length;
    const langAttr = lang ? ` class="language-${lang.replace(/"/g, "")}"` : "";
    codeBlocks.push(
      `<pre class="bg-muted border border-border rounded-lg p-4 overflow-x-auto my-5 text-sm"><code${langAttr} class="font-mono whitespace-pre">${escaped}</code></pre>`
    );
    return `\x00CB${idx}\x00`;
  });

  // ── 2. Process block structure line-by-line ─────────────────────────────────
  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block placeholder (pass-through)
    if (trimmed.startsWith("\x00CB")) {
      out.push(trimmed);
      i++;
      continue;
    }

    // Blank line
    if (!trimmed) {
      i++;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const content = inline(esc(headingMatch[2]));
      const sizeMap: Record<number, string> = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-sm",
      };
      const cls = `${sizeMap[level] ?? "text-base"} font-bold mt-8 mb-3 tracking-tight`;
      out.push(`<h${level} class="${cls}">${content}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
      out.push('<hr class="border-border/50 my-6" />');
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      out.push(
        `<blockquote class="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4">${inline(esc(trimmed.slice(2)))}</blockquote>`
      );
      i++;
      continue;
    }

    // Unordered list (- or *)
    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(`<li class="leading-7">${inline(esc(lines[i].trim().slice(2)))}</li>`);
        i++;
      }
      out.push(
        `<ul class="list-disc list-outside pl-5 space-y-1 my-4">${items.join("")}</ul>`
      );
      continue;
    }

    // Ordered list (1. or 1))
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^\d+[.)]\s/, "");
        items.push(`<li class="leading-7">${inline(esc(content))}</li>`);
        i++;
      }
      out.push(
        `<ol class="list-decimal list-outside pl-5 space-y-1 my-4">${items.join("")}</ol>`
      );
      continue;
    }

    // Paragraph — collect consecutive non-block lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("\x00CB") &&
      !/^#{1,6}\s/.test(lines[i].trim()) &&
      !/^-{3,}$/.test(lines[i].trim()) &&
      !/^\*{3,}$/.test(lines[i].trim()) &&
      !/^> /.test(lines[i].trim()) &&
      !/^[-*]\s/.test(lines[i].trim()) &&
      !/^\d+[.)]\s/.test(lines[i].trim())
    ) {
      paraLines.push(inline(esc(lines[i])));
      i++;
    }

    if (paraLines.length > 0) {
      out.push(`<p class="mb-4 leading-7">${paraLines.join("<br />")}</p>`);
    }
  }

  // ── 3. Restore code blocks ──────────────────────────────────────────────────
  let html = out.join("\n");
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`\x00CB${idx}\x00`, block);
  });

  return html;
}

// Escape HTML special characters in text content.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Apply inline formatting (bold, italic, code, links, strikethrough).
function inline(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-primary underline underline-offset-4 hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}
