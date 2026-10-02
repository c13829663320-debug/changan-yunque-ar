#!/usr/bin/env node
/**
 * validate_m1.mjs — M1 静态校验闸门（文件系统级，不执行 TS）
 * 用法: node scripts/validate_m1.mjs
 * 校验:
 *  1. app.json 所有页面/分包页面四件套齐全
 *  2. miniprogram 下所有 .json 可解析
 *  3. 七剧场文件齐全，含 id/sourceCard/choices/ar_restore/collect_scale
 *  4. index.ts 聚合七个剧场
 *  5. 14 个商品封面存在
 *  6. 主包/全包体积
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mp = join(root, 'miniprogram');
let failures = 0;
const fail = (m) => { failures++; console.error('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

// 1. 页面四件套
console.log('[1] 页面文件齐全');
const appJson = JSON.parse(readFileSync(join(mp, 'app.json'), 'utf8'));
const pagePaths = [...appJson.pages];
for (const sp of appJson.subpackages || []) {
  for (const p of sp.pages || []) pagePaths.push(join(sp.root, p));
}
for (const p of pagePaths) {
  for (const ext of ['.ts', '.wxml', '.json', '.wxss']) {
    const f = join(mp, p + ext);
    if (!existsSync(f)) fail(`缺少 ${p}${ext}`);
  }
}
if (failures === 0) ok(`${pagePaths.length} 个页面四件套齐全`);

// 2. JSON 合法
console.log('[2] JSON 合法');
let jsonCount = 0;
const walk = (d, cb) => {
  for (const name of readdirSync(d)) {
    const f = join(d, name);
    const st = statSync(f);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'miniprogram_npm') continue;
      walk(f, cb);
    } else cb(f);
  }
};
walk(mp, (f) => {
  if (f.endsWith('.json')) {
    jsonCount++;
    try { JSON.parse(readFileSync(f, 'utf8')); } catch (e) { fail(`JSON 解析失败 ${f}: ${e.message}`); }
  }
});
if (failures === 0) ok(`${jsonCount} 个 JSON 全部合法`);

// 3. 七剧场结构
console.log('[3] 七剧场结构完整');
const sceneDir = join(mp, 'data/scenes/daminggong');
const expected = [
  ['danfengmen', '启程鳞'],
  ['hanyuan', '朝会鳞'],
  ['xuanzheng', '廊下鳞'],
  ['zichen', '召对鳞'],
  ['taiyechi', '池苑鳞'],
  ['linde', '盛宴鳞'],
  ['xuanwumen', '归愿鳞'],
];
for (const [id, scale] of expected) {
  const f = join(sceneDir, id + '.ts');
  if (!existsSync(f)) { fail(`缺少剧场 ${id}.ts`); continue; }
  const src = readFileSync(f, 'utf8');
  if (!src.includes(`id: '${id}'`)) fail(`${id}: id 不匹配`);
  if (!src.includes('sourceCard')) fail(`${id}: 缺史料卡`);
  if (!src.includes('choices')) fail(`${id}: 缺轻分支 choices`);
  if (!src.includes("'ar_restore'")) fail(`${id}: 缺 AR 复原`);
  if (!src.includes("'collect_scale'")) fail(`${id}: 缺集鳞`);
  if (!src.includes(scale)) fail(`${id}: 缺龙鳞「${scale}」`);
  if (!/bg:\s*['"`]/.test(src)) fail(`${id}: 未设置 bg`);
  if (!/arRestoreImage:\s*['"`]/.test(src)) fail(`${id}: 未设置 arRestoreImage`);
}
if (failures === 0) ok('七剧场 id/史料卡/分支/AR/集鳞/龙鳞/图片字段齐全');

// 4. index 聚合
console.log('[4] index.ts 聚合七剧场');
const indexSrc = readFileSync(join(sceneDir, 'index.ts'), 'utf8');
for (const [id] of expected) {
  if (!indexSrc.includes(`./${id}`)) fail(`index.ts 未聚合 ${id}`);
}
if (existsSync(join(sceneDir, 'others.meta.ts'))) fail('others.meta.ts 仍存在，应被独立剧场取代');
if (failures === 0) ok('index.ts 聚合七剧场，others.meta.ts 已移除');

// 5. 商品封面
console.log('[5] 14 商品封面');
const catalogSrc = readFileSync(join(mp, 'data/goods/catalog.ts'), 'utf8');
const ids = [...catalogSrc.matchAll(/id: '(g-[a-z0-9-]+)'/g)].map((m) => m[1]);
if (ids.length !== 14) fail(`商品数应为 14，实际 ${ids.length}`);
for (const id of ids) {
  const f = join(mp, 'assets/goods', id + '.jpg');
  if (!existsSync(f)) fail(`缺商品封面 assets/goods/${id}.jpg`);
  else if (statSync(f).size > 95 * 1024) fail(`${id}.jpg 超过 95KB`);
}
if (failures === 0) ok('14 商品封面齐全且单张 ≤95KB');

// 6. 体积
console.log('[6] 包体积');
const du = (p) => {
  if (!existsSync(p)) return 0;
  const out = execSync(`du -sk "${p}"`).toString().trim().split('\t')[0];
  return parseInt(out, 10);
};
const mainSize = du(mp) - du(join(mp, 'package-tour')) - du(join(mp, 'package-spot')) - du(join(mp, 'package-mall'));
const totalSize = du(mp);
console.log(`  主包约 ${(mainSize / 1024).toFixed(2)} MB（限 2MB）`);
console.log(`  全包约 ${(totalSize / 1024).toFixed(2)} MB（限 20MB）`);
if (mainSize > 2048) fail('主包超 2MB');
if (totalSize > 20480) fail('全包超 20MB');

console.log('\n' + (failures === 0 ? '✅ M1 静态校验通过' : `❌ M1 静态校验失败：${failures} 项`));
process.exit(failures === 0 ? 0 : 1);
