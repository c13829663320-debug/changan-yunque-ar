#!/usr/bin/env node
/**
 * validate_m1.mjs — 静态校验闸门（文件系统级，不执行 TS）
 * 用法: node scripts/validate_m1.mjs
 * 校验:
 *  1. app.json 所有页面/分包页面四件套齐全
 *  2. miniprogram 下所有 .json 可解析
 *  3. 多景点剧场文件齐全，含 id/sourceCard/choices/ar_restore/collect_scale/龙鳞
 *  4. 各景点 index.ts 聚合其全部剧场；sceneRepo 聚合全部景点
 *  5. 商品数据与封面（本地封面≤95KB，网络封面免本地校验）
 *  6. 主包/逐分包/全包体积（主包≤2MB、单分包≤2MB、全包≤20MB）
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

/** 景点 → 目录 + [场景id, 龙鳞名]（数据驱动，新增景点只改这里） */
const SPOTS = [
  {
    id: 'daminggong',
    pairs: [
      ['danfengmen', '启程鳞'],
      ['hanyuan', '朝会鳞'],
      ['xuanzheng', '廊下鳞'],
      ['zichen', '召对鳞'],
      ['taiyechi', '池苑鳞'],
      ['linde', '盛宴鳞'],
      ['xuanwumen', '归愿鳞'],
    ],
  },
  {
    id: 'dayanta',
    pairs: [
      ['shanmen', '初谒鳞'],
      ['yichang', '翻经鳞'],
      ['shengjiaobei', '圣教鳞'],
      ['timing', '登科鳞'],
      ['yata-ding', '归雁鳞'],
    ],
  },
  {
    id: 'qinglongsi',
    pairs: [
      ['qinglong-shanmen', '寻师鳞'],
      ['qinglong-guanding', '灌顶鳞'],
      ['qinglong-mantuluo', '曼荼鳞'],
      ['qinglong-fufa', '付法鳞'],
      ['qinglong-donggui', '东归鳞'],
    ],
  },
];

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

// 3. 多景点剧场结构
console.log('[3] 多景点剧场结构完整');
for (const spot of SPOTS) {
  const sceneDir = join(mp, 'data/scenes', spot.id);
  for (const [id, scale] of spot.pairs) {
    const f = join(sceneDir, id + '.ts');
    if (!existsSync(f)) { fail(`[${spot.id}] 缺少剧场 ${id}.ts`); continue; }
    const src = readFileSync(f, 'utf8');
    if (!src.includes(`id: '${id}'`)) fail(`${id}: id 不匹配`);
    if (!src.includes(`spotId: '${spot.id}'`)) fail(`${id}: spotId 非 ${spot.id}`);
    if (!src.includes('sourceCard')) fail(`${id}: 缺史料卡`);
    if (!src.includes('choices')) fail(`${id}: 缺轻分支 choices`);
    if (!src.includes("'ar_restore'")) fail(`${id}: 缺 AR 复原`);
    if (!src.includes("'collect_scale'")) fail(`${id}: 缺集鳞`);
    if (!src.includes(scale)) fail(`${id}: 缺龙鳞「${scale}」`);
  }
}
if (failures === 0) ok(`${SPOTS.map((s) => s.pairs.length).join('+')} 剧场（${SPOTS.map((s) => s.id).join('/')}）结构齐全`);

// 4. 各景点 index 聚合 + sceneRepo 聚合全部景点
console.log('[4] 景点聚合');
for (const spot of SPOTS) {
  const sceneDir = join(mp, 'data/scenes', spot.id);
  const indexSrc = readFileSync(join(sceneDir, 'index.ts'), 'utf8');
  for (const [id] of spot.pairs) {
    if (!indexSrc.includes(`./${id}`)) fail(`[${spot.id}] index.ts 未聚合 ${id}`);
  }
}
const sceneRepoSrc = readFileSync(join(mp, 'data/repositories/sceneRepo.ts'), 'utf8');
for (const spot of SPOTS) {
  if (!sceneRepoSrc.includes(`scenes/${spot.id}/index`)) fail(`sceneRepo 未聚合景点 ${spot.id}`);
}
if (existsSync(join(mp, 'data/scenes/daminggong/others.meta.ts'))) fail('others.meta.ts 仍存在');
if (failures === 0) ok('各景点 index.ts 聚合、sceneRepo 聚合全部景点，others.meta.ts 已移除');

// 5. 商品数据与封面（本地封面校验体积；网络封面免本地文件）
console.log('[5] 商品数据与封面');
const catalogSrc = readFileSync(join(mp, 'data/goods/catalog.ts'), 'utf8');
const ids = [...catalogSrc.matchAll(/id: '(g-[a-z0-9-]+)'/g)].map((m) => m[1]);
if (ids.length < 14) fail(`商品数应不少于 14，实际 ${ids.length}`);
if (new Set(ids).size !== ids.length) fail('存在重复商品 id');
const covers = [...catalogSrc.matchAll(/cover: '([^']+)'/g)].map((m) => m[1]);
let netCovers = 0;
let localCovers = 0;
for (const cv of covers) {
  if (/^https?:\/\//.test(cv)) { netCovers += 1; continue; }
  localCovers += 1;
  const f = join(mp, cv.replace(/^\//, ''));
  if (!existsSync(f)) fail(`缺本地封面 ${cv}`);
  else if (statSync(f).size > 95 * 1024) fail(`${cv} 超过 95KB`);
}
if (failures === 0) ok(`${ids.length} 商品：${localCovers} 本地封面（≤95KB）+ ${netCovers} 网络封面，id 无重复`);

// 6. 体积
console.log('[6] 包体积');
const fsSizeKB = (p) => {
  if (!existsSync(p)) return 0;
  const st = statSync(p);
  if (st.isFile()) return Math.ceil(st.size / 1024);
  let sum = 0;
  for (const e of readdirSync(p)) sum += fsSizeKB(join(p, e));
  return sum;
};
const du = (p) => {
  if (!existsSync(p)) return 0;
  // Windows：纯 Node 字节求和（确定性，正是微信代码体积口径），不依赖 shell du
  if (process.platform === 'win32') return fsSizeKB(p);
  try {
    const out = execSync(`du -sk "${p}"`).toString().trim().split('\t')[0];
    const kb = parseInt(out, 10);
    return Number.isNaN(kb) ? fsSizeKB(p) : kb;
  } catch {
    return fsSizeKB(p); // 无 du 时的跨平台兜底
  }
};
const subs = (appJson.subpackages || []).map((sp) => ({ name: sp.root, dir: join(mp, sp.root) }));
let subSum = 0;
for (const s of subs) {
  const kb = du(s.dir);
  subSum += kb;
  console.log(`  ${s.name}: ${(kb / 1024).toFixed(2)} MB（限 2MB）`);
  if (kb > 2048) fail(`${s.name} 分包超 2MB`);
}
const totalSize = du(mp);
const mainSize = totalSize - subSum;
console.log(`  主包约 ${(mainSize / 1024).toFixed(2)} MB（限 2MB）`);
console.log(`  全包约 ${(totalSize / 1024).toFixed(2)} MB（限 20MB）`);
if (mainSize > 2048) fail('主包超 2MB');
if (totalSize > 20480) fail('全包超 20MB');

console.log('\n' + (failures === 0 ? '✅ 静态校验通过' : `❌ 静态校验失败：${failures} 项`));
process.exit(failures === 0 ? 0 : 1);
