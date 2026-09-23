import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';
const messages = new Set();
const technical = new Set(['slug', 'guideSlug', 'related', 'src', 'href', 'reviewed', 'name', 'url', 'appId', 'appStoreUrl', 'appStoreCampaignUrl', 'email', 'published']);
const add = text => { if (text?.trim() && !text.startsWith('/')) messages.add(text); };
for (const file of ['components.tsx', 'pages/Home.tsx', 'pages/GuidesIndex.tsx', 'pages/LegalPages.tsx', 'pages/GuidePage.tsx', 'routes.tsx', 'seo.ts', 'data.ts']) {
  const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isStringLiteral(node)) {
      let parent = node.parent;
      if (ts.isPropertyAssignment(parent) && parent.name === node) return;
      while (parent && !ts.isCallExpression(parent) && !ts.isPropertyAssignment(parent) && !ts.isVariableDeclaration(parent)) parent = parent.parent;
      if (parent && ts.isCallExpression(parent) && ['t', 'webPageJsonLd'].includes(parent.expression.getText(ast))) add(node.text);
      if (parent && ts.isPropertyAssignment(parent)) {
        const field = parent.name.getText(ast).replaceAll('"', '');
        if (file === 'data.ts' && !technical.has(field)) add(node.text);
        // HowTo names are content; SITE.name remains a brand constant.
        if (file === 'data.ts' && field === 'name' && node.text !== 'Clarity Chat') add(node.text);
        if (file === 'pages/Home.tsx' && ['title', 'body'].includes(field)) add(node.text);
        if (file === 'routes.tsx' && parent.parent.parent?.name?.getText(ast) === 'guidePageTitles') add(node.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
const output = JSON.stringify(Object.fromEntries([...messages].map(text => [text, text])), null, 2) + '\n';
const target = new URL('../src/locales/en.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('English catalog is stale. Run node scripts/catalog.mjs and update all translations.');
} else writeFileSync(target, output);
console.log(`${messages.size} source messages`);
