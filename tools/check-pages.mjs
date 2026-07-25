/* Проверка согласованности боевых страниц In-CRM.
   Запуск: node tools/check-pages.mjs
   Падает с кодом 1, если хотя бы одна страница отличается от остальных. */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Кавычки обязательны: без них глоб раскроет шелл и в список попадут
// только файлы из корня. Файлы на `_` — превью и прототипы, они не боевые;
// `tools/` — вспомогательные HTML-исходники для сборки ассетов (например,
// og-image.html), тоже не боевые страницы.
const pages = execSync('git ls-files "*.html"', { encoding: "utf8" })
  .trim().split(/\r?\n/)
  .filter((f) => f && !f.startsWith("_") && !f.startsWith("tools/"));

// Что обязано быть на каждой боевой странице.
// Ключ — человекочитаемое имя, значение — регулярка.
const required = {
  "favicon": /<link rel="icon"[^>]*favicon\.svg/,
  "apple-touch-icon": /<link rel="apple-touch-icon"/,
  "og:image": /<meta property="og:image" content="[^"]+"/,
  "twitter:card": /<meta name="twitter:card"/,
  "preload шрифта": /<link rel="preload"[^>]*onest-cyrillic[^>]*as="font"/,
  "skip-link": /class="skip-link"/,
};

const versions = new Set();
const problems = [];

for (const page of pages) {
  const html = readFileSync(page, "utf8");

  for (const [name, re] of Object.entries(required)) {
    if (!re.test(html)) problems.push(`${page}: нет «${name}»`);
  }

  // Версия кэш-бастера должна быть одна на весь сайт
  for (const m of html.matchAll(/assets\/site\.(?:css|js)\?v=([\w.-]+)/g)) {
    versions.add(m[1]);
  }
  if (/assets\/site\.(?:css|js)"/.test(html)) {
    problems.push(`${page}: подключение assets без ?v= — кэш не сбросится`);
  }
}

if (versions.size > 1) {
  problems.push(`Разные версии кэш-бастера: ${[...versions].join(", ")}`);
}

console.log(`Проверено страниц: ${pages.length}`);
if (problems.length) {
  console.log(`\nПроблем: ${problems.length}\n` + problems.join("\n"));
  process.exit(1);
}
console.log(`Версия ассетов: ${[...versions][0]}\nВсё согласовано.`);

/* Обновить версию ассетов во всех боевых страницах:
   git ls-files '*.html' | grep -v '^_' | xargs sed -i 's/?v=СТАРАЯ/?v=НОВАЯ/g'
   После — обязательно `node tools/check-pages.mjs`. */
