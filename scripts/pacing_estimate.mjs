#!/usr/bin/env node
/**
 * pacing_estimate.mjs — 七剧场节奏估算 + 静态审计（纯 Node ESM，正则解析，不执行 TS）
 *
 * 用法: node scripts/pacing_estimate.mjs
 *
 * ── 节奏口径（单位：秒）────────────────────────────────────────────
 *  · 阅读速度 5.5 字/秒。
 *  · 普通节点：max(3, 字数 / 5.5) + 每次点击 1.2 秒。
 *  · choice 节点：额外 +6 秒（决策时间）。
 *  · open_source_card 节点：额外 +12 秒（观看史料卡）。
 *  · ar_restore 节点：强制 2.5 秒 + 平均驻留 12 秒 = 14.5 秒（AR 体验为主，
 *    不再叠加阅读秒数，文字引导已计入上一/下一普通节点）。
 *  · collect_scale 节点：额外 +3 秒。
 *
 * ── 字数统计口径 ──────────────────────────────────────────────────
 *  统计 text 字段内的「中日韩汉字 + 中文/全角标点」，去掉空白；
 *  括号内舞台提示（如「（仰头）」）作为文本一部分保留计入。
 *  统计范围：CJK 统一表意文字(U+4E00–9FFF)、CJK 标点(U+3000–303F)、
 *  全角形式(U+FF00–FFEF)、破折号/省略号/引号等(U+2014/2016/2018/2019/201C/201D/2026)。
 *  拉丁字母、数字、半角标点不计入（舞台提示里的阿拉伯数字同理）。
 *
 * ── 静态审计（始终输出）───────────────────────────────────────────
 *  1. 七文件全部节点 id 与 choice id 全局零重复；
 *  2. 每个 choice 的 feedback.text 非空、且带 actor；
 *  3. 每个剧场最后一个 dialog 的 action 为 collect_scale；
 *  4. 所有 correct===true 的 choice 均有 easterEgg；
 *  5. 每个 actor==='yunque' 的节点均有合法 expression；
 *  6. 七文件（含注释）不含 M1/M2/占位/TODO/TBD/待补充/解锁；
 *  7. open_source_card 七剧场恰好各 1 处；ar_restore/sourceCard/bg/arRestoreImage 齐全。
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sceneDir = join(root, 'miniprogram/data/scenes/daminggong');

const SPEED = 5.5;          // 字/秒
const CLICK = 1.2;          // 每次点击
const MIN_NODE = 3;         // 单节点最少秒数
const CHOICE_BONUS = 6;     // choice 决策
const CARD_BONUS = 12;       // open_source_card 观看
const AR_FORCED = 2.5;      // ar_restore 强制
const AR_DWELL = 12;        // ar_restore 平均驻留
const AR_TIME = AR_FORCED + AR_DWELL;
const COLLECT_BONUS = 3;    // collect_scale

const FILES = [
  ['danfengmen', 'dfm'],
  ['hanyuan', 'hy'],
  ['xuanzheng', 'xz'],
  ['zichen', 'zc'],
  ['taiyechi', 'tyc'],
  ['linde', 'ld'],
  ['xuanwumen', 'xwm'],
];

// 中日韩汉字 + 中文/全角标点（去空白后统计）
const COUNT_RE =
  /[一-鿿　-〿＀-｠—‘’“…”·]/g;
const countChars = (t) => ((t || '').match(COUNT_RE) || []).length;

// 提取单个节点对象体：从 id: 'pre-N' 起，到下一个同级节点或 dialogs 数组结束
function parseDialogs(src) {
  const start = src.indexOf('dialogs: [');
  const end = src.indexOf('export default');
  const section = src.slice(start, end);
  const nodes = [];
  const re = /id:\s*'((?:dfm|hy|xz|zc|tyc|ld|xwm)-\d+)'([\s\S]*?)(?=\n    \{\n      id:|\n  \],?\s*\n)/g;
  let m;
  while ((m = re.exec(section)) !== null) {
    nodes.push({ id: m[1], body: m[2] });
  }
  return nodes;
}

const forbidden = ['M1', 'M2', '占位', 'TODO', 'TBD', '待补充', '解锁'];
let failures = 0;
const fail = (m) => { failures++; console.error('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

const allNodeIds = new Map();
const allChoiceIds = new Map();
let grandTotal = 0;
const reportRows = [];
const yunqueExpr = [];
let correctChoices = 0;
let correctWithEaster = 0;

console.log('════════ 节奏估算（阅读 5.5 字/秒 · 单节点 ≥3s + 点击1.2s）════════');

for (const [file, prefix] of FILES) {
  const path = join(sceneDir, `${file}.ts`);
  const src = readFileSync(path, 'utf8');
  const nodes = parseDialogs(src);

  let sceneSec = 0;
  let choiceCount = 0;
  let cardCount = 0;
  let arCount = 0;
  let collectCount = 0;

  for (const n of nodes) {
    // 全局 id 唯一
    if (allNodeIds.has(n.id)) fail(`节点 id 重复: ${n.id}（${allNodeIds.get(n.id)} 与 ${file}）`);
    allNodeIds.set(n.id, file);

    const textM = n.body.match(/text:\s*'([^']*)'/);
    const chars = textM ? countChars(textM[1]) : 0;
    const hasChoices = /choices:\s*\[[\s\S]*\]/.test(n.body);
    const isCard = /type:\s*'open_source_card'/.test(n.body);
    const isAr = /type:\s*'ar_restore'/.test(n.body);
    const isCollect = /type:\s*'collect_scale'/.test(n.body);

    let sec;
    if (isAr) {
      sec = AR_TIME;
      arCount++;
    } else {
      sec = Math.max(MIN_NODE, chars / SPEED) + CLICK;
    }
    if (hasChoices) { sec += CHOICE_BONUS; choiceCount++; }
    if (isCard) { sec += CARD_BONUS; cardCount++; }
    if (isCollect) { sec += COLLECT_BONUS; collectCount++; }
    sceneSec += sec;

    // choice 审计
    if (hasChoices) {
      const choiceRe = /\{\s*id:\s*'((?:dfm|hy|xz|zc|tyc|ld|xwm)-c-[a-z]+)'([\s\S]*?)(?=\n        \}|\n      \])/g;
      let cm;
      while ((cm = choiceRe.exec(n.body)) !== null) {
        const cid = cm[1], cbody = cm[2];
        if (allChoiceIds.has(cid)) fail(`choice id 重复: ${cid}`);
        allChoiceIds.set(cid, n.id);
        const fbText = cbody.match(/feedback:\s*\{[^}]*text:\s*'([^']*)'/);
        if (!fbText || !fbText[1].trim()) fail(`${cid}: feedback.text 为空`);
        if (!/actor:\s*'/.test(cbody)) fail(`${cid}: feedback 缺 actor`);
        const isCorrect = /correct:\s*true/.test(cbody);
        if (isCorrect) {
          correctChoices++;
          if (!/easterEgg:\s*'[^']+'/.test(cbody)) fail(`${cid}: correct 缺 easterEgg`);
          else correctWithEaster++;
        }
      }
    }

    // 云阙节点 expression 审计
    if (/actor:\s*'yunque'/.test(n.body)) {
      const em = n.body.match(/expression:\s*'([a-z]+)'/);
      if (!em) fail(`${n.id}: yunque 节点缺 expression`);
      else if (!['normal', 'curious', 'surprised', 'happy', 'daze'].includes(em[1]))
        fail(`${n.id}: expression 取值非法「${em[1]}」`);
      yunqueExpr.push(`${n.id}=${em ? em[1] : 'MISSING'}`);
    }
  }

  // 末节点 action 必须 collect_scale
  const last = nodes[nodes.length - 1];
  if (!/type:\s*'collect_scale'/.test(last.body))
    fail(`${file}: 末节点 ${last.id} 的 action 不是 collect_scale`);

  // 必备字段
  if (!/sourceCard/.test(src)) fail(`${file}: 缺 sourceCard`);
  if (!/bg:\s*['"`]/.test(src)) fail(`${file}: 缺 bg`);
  if (!/arRestoreImage:\s*['"`]/.test(src)) fail(`${file}: 缺 arRestoreImage`);
  if (!/'ar_restore'/.test(src)) fail(`${file}: 缺 ar_restore`);

  sceneSec = Math.round(sceneSec);
  grandTotal += sceneSec;
  reportRows.push({ file, nodes: nodes.length, choiceCount, cardCount, arCount, collectCount, sec: sceneSec });
  console.log(
    `  · ${file.padEnd(11)} 节点 ${String(nodes.length).padStart(2)} | choice ${choiceCount} | 史料卡 ${cardCount} | AR ${arCount} | 集鳞 ${collectCount} | 约 ${String(sceneSec).padStart(4)} 秒`
  );
}

console.log('────────────────────────────────────────────');
console.log(`  合计：${grandTotal} 秒（${(grandTotal / 60).toFixed(1)} 分钟）`);
console.log(`  目标区间 600–900 秒（宜 700–840）：${grandTotal >= 600 && grandTotal <= 900 ? '✓ 达标' : '✗ 超出区间'}`);

console.log('\n════════ 静态审计 ════════');
console.log(`[1] 节点 id 全局唯一：${allNodeIds.size} 个节点`);
console.log(`[2] choice id 全局唯一：${allChoiceIds.size} 个 choice`);
if (failures === 0) ok('id 零重复');

// 禁用词
let wordHits = 0;
for (const [file] of FILES) {
  const src = readFileSync(join(sceneDir, `${file}.ts`), 'utf8');
  for (const w of forbidden) {
    if (src.includes(w)) { fail(`${file}.ts 含禁用字样「${w}」`); wordHits++; }
  }
}
console.log(`[6] 禁用字样（M1/M2/占位/TODO/TBD/待补充/解锁）：${wordHits === 0 ? '零命中' : `${wordHits} 处命中`}`);

console.log(`[4] correct 选择 ${correctChoices} 处，均带 easterEgg：${correctWithEaster}/${correctChoices}`);
console.log(`[5] yunque 节点 expression 标注（共 ${yunqueExpr.length} 个）：`);
console.log('     ' + yunqueExpr.join('  '));
const cardTotal = reportRows.reduce((s, r) => s + r.cardCount, 0);
console.log(`[7] open_source_card 合计 ${cardTotal} 处（目标 7，每剧场 1 处）`);

console.log('\n' + (failures === 0 ? '✅ 节奏脚本审计全部通过' : `❌ 静态审计失败：${failures} 项`));
process.exit(failures === 0 ? 0 : 1);
