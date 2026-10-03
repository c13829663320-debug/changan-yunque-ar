// 前端打磨视觉核验：wxss→CSS（rpx→px），真实数据静态渲染 tour/mine/mall 并截图
import fs from 'fs';
import { chromium } from 'playwright';

const MP = '/home/user/.doubao/agent_mode/workspace/changan-yunque-ar/miniprogram';
const OUT = '/home/user/.doubao/agent_mode/workspace/changan-yunque-ar/demo';

const conv = (css) =>
  css
    .replace(/page\s*\{/g, 'body {')
    .replace(/(\d*\.?\d+)rpx/g, (_m, n) => `${parseFloat(n) / 2}px`)
    .replace(/env\(safe-area-inset-bottom\)/g, '0px');

const read = (p) => fs.readFileSync(`${MP}/${p}`, 'utf8');
const tokens = conv(read('styles/tokens.wxss'));
const common = conv(read('styles/common.wxss'));

const baseCss = `
body{margin:0;background:#f4ecdd;}
.page-wrap{width:375px;margin:0 auto;}
div,span{box-sizing:border-box;}
span{display:block;}
.grid-price-symbol,.scale-num-sep{display:inline;}
button{font-family:inherit;}
`;

async function shot(name, pageCss, body, height = 1400) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${name}</title><style>${tokens}\n${common}\n${pageCss}\n${baseCss}</style></head>
<body>${body}</body></html>`;
  fs.writeFileSync(`${OUT}/${name}.html`, html);
  const browser = await chromium.launch({
    executablePath: '/opt/vm/preinstall/ms-playwright/chromium-1169/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(`file://${OUT}/${name}.html`);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await browser.close();
  console.log('shot:', name);
}

/* ---------------- TOUR ---------------- */
const scenes = [
  { index: 1, name: '丹凤门', role: '入宫使臣', scaleName: '启程鳞', state: 'completed', stateLabel: '已完成' },
  { index: 2, name: '含元殿', role: '朝会官员', scaleName: '朝会鳞', state: 'completed', stateLabel: '已完成' },
  { index: 3, name: '宣政殿', role: '朝堂廊下官员', scaleName: '廊下鳞', state: 'unlocked', stateLabel: '可进入' },
  { index: 4, name: '紫宸殿', role: '入閤近臣', scaleName: '召对鳞', state: 'locked', stateLabel: '待解锁' },
  { index: 5, name: '太液池', role: '临池文人', scaleName: '池苑鳞', state: 'locked', stateLabel: '待解锁' },
  { index: 6, name: '麟德殿', role: '赴宴宾客', scaleName: '盛宴鳞', state: 'locked', stateLabel: '待解锁' },
  { index: 7, name: '玄武门', role: '归愿之人', scaleName: '归愿鳞', state: 'locked', stateLabel: '待解锁' },
];
const tourChips = scenes.map((_, i) => `<div class="scale-chip ${i < 2 ? 'got' : ''}"><div class="scale-face"></div></div>`).join('');
const tourItems = scenes
  .map((s) => {
    const foot = s.state === 'unlocked' ? '<span class="route-cta">前往 →</span>' : s.state === 'locked' ? '<span class="route-lock">未解锁</span>' : '';
    return `<div class="route-item ${s.state} ${s.state === 'unlocked' ? 'is-current' : ''}">
      <div class="node"><span class="node-index">${s.index}</span><div class="node-badge"></div></div>
      <div class="route-card">
        <div class="row-between"><span class="route-name">${s.name}</span><span class="route-state">${s.stateLabel}</span></div>
        <span class="route-role">你将成为：${s.role}</span>
        <div class="route-foot"><span class="route-scale">◈ ${s.scaleName}</span>${foot}</div>
      </div></div>`;
  })
  .join('');
const tourBody = `<div class="page-wrap tour">
  <div class="card progress-head">
    <div class="row-between head-row">
      <div class="head-title"><span class="title-h2">云阙AR巡游</span><span class="head-sub">大明宫 · 七阙长卷</span></div>
      <div class="seg-group"><div class="seg on">云游</div><div class="seg">现场</div></div>
    </div>
    <div class="scale-line">
      <div class="row-between scale-head"><span class="scale-text">龙鳞集录</span><span class="scale-num">2<span class="scale-num-sep"> / </span>7</span></div>
      <div class="scale-row">${tourChips}</div>
      <span class="scale-hint">云游模式 · 在线复原盛唐宫殿</span>
    </div>
    <div class="btn-primary continue-btn">继续巡游</div>
  </div>
  <div class="scroll-wrap">
    <div class="scroll-rod"><div class="rod-cap left"></div><div class="rod-cap right"></div></div>
    <div class="route">${tourItems}</div>
    <div class="scroll-rod bottom"><div class="rod-cap left"></div><div class="rod-cap right"></div></div>
  </div></div>`;

/* ---------------- MINE ---------------- */
const wall = [
  ['启程鳞', '丹凤门'], ['朝会鳞', '含元殿'], ['廊下鳞', '宣政殿'], ['召对鳞', '紫宸殿'],
  ['池苑鳞', '太液池'], ['盛宴鳞', '麟德殿'], ['归愿鳞', '玄武门'],
];
const wallCells = wall
  .map(([name, hall], i) => `<div class="scale-cell">
    <div class="scale-medal ${i < 2 ? 'got' : ''}"><div class="scale-core"></div></div>
    <span class="scale-name ${i < 2 ? 'on' : ''}">${name}</span><span class="scale-hall">${hall}</span></div>`)
  .join('');
const spotRows = [
  { city: '西安', name: '大明宫国家遗址公园', sub: '千宫之宫 · 七阙长卷', tag: '已到访 2/7 处', badge: '可巡游', on: true, visited: true },
  { city: '西安', name: '大雁塔文化景区', sub: '大慈恩寺 · 玄奘译场', tag: '尚未到访', badge: '即将上线', on: false, visited: false },
]
  .map(
    (s) => `<div class="spot-row ${s.on ? '' : 'soon'}">
    <div class="spot-emblem ${s.on ? 'on' : ''}"><span class="spot-emblem-text">${s.city}</span></div>
    <div class="spot-info"><span class="spot-name">${s.name}</span><span class="spot-sub">${s.sub}</span>
      <div class="spot-meta"><span class="spot-tag ${s.visited ? 'visited' : ''}">${s.tag}</span></div></div>
    <span class="spot-badge ${s.on ? 'on' : 'soon'}">${s.badge}</span></div>`
  )
  .join('');
const mineBody = `<div class="mine">
  <div class="mine-head">
    <div class="avatar"><img class="avatar-img" src="../miniprogram/assets/characters/yunque-girl.jpg"></div>
    <span class="mine-name">云阙旅人</span><span class="mine-sub">已集 2 片龙鳞 · 走过 2 处</span>
  </div>
  <div class="page-wrap mine-body">
    <div class="stat-grid rise">
      <div class="stat"><span class="stat-num">2</span><span class="stat-label">龙鳞</span></div>
      <div class="stat"><span class="stat-num">2</span><span class="stat-label">集章</span></div>
      <div class="stat"><span class="stat-num">0</span><span class="stat-label">数藏</span></div>
    </div>
    <div class="card scale-card rise">
      <div class="card-head"><div class="card-head-titles"><span class="title-h2">龙鳞集章</span><span class="card-sub">七鳞聚齐 · 云阙归愿</span></div>
        <span class="scale-progress">2 / 7</span></div>
      <div class="scale-wall">${wallCells}</div>
    </div>
    <div class="card spot-card rise">
      <div class="card-head"><div class="card-head-titles"><span class="title-h2">景点巡游</span><span class="card-sub">已到访 2 处宫殿</span></div></div>
      <div class="spot-list">${spotRows}</div>
    </div>
    <div class="card menu-card rise">
      <div class="card-head"><div class="card-head-titles"><span class="title-h2">我的</span><span class="card-sub">意向 · 预约 · 收藏</span></div></div>
      <div class="menu-item hot"><div class="hot-left"><div class="hot-icon">意</div><div class="hot-info"><span class="m-label hot-label">我的意向单</span><span class="hot-sub">预售与意向登记 · 优先通知</span></div></div><span class="m-arrow">›</span></div>
      <div class="menu-item"><span class="m-label">体验预约</span><span class="m-arrow">›</span></div>
      <div class="menu-item"><span class="m-label">史料卡收藏</span><span class="m-arrow">›</span></div>
      <div class="menu-item"><span class="m-label">我的祈愿分享</span><span class="m-arrow">›</span></div>
      <div class="menu-item"><span class="m-label">关于长安云阙</span><span class="m-arrow">›</span></div>
    </div>
    <div class="btn-ghost reset-btn rise">重置巡游进度</div>
  </div></div>`;

/* ---------------- MALL ---------------- */
const cats = ['全部', '典藏复刻', '潮玩盲盒', '城市限定', '唐妆首饰', '数字AR'];
const catBar = cats.map((c, i) => `<div class="cat ${i === 0 ? 'on' : ''}">${c}</div>`).join('');
const goods = [
  ['g-sx-nangnang', '葡萄花鸟纹银香囊·典藏复刻', '何家村窖藏形制·内置陀螺仪', 3980],
  ['g-yunque-blindbox', '云阙萌龙·投龙祈愿盲盒', '六常规＋隐藏款·附祈愿故事卡', 69],
  ['g-city-blindbox', '西安城市限定盲盒', '大雁塔城墙钟楼兵马俑·华山隐藏', 89],
  ['g-tongguan', '长安通关文牒·集章护照', '串联全城打卡的篆刻集章', 69],
  ['g-yushou', '城市限定御守套装', '石青石绿朱砂·金线绣萌龙', 79],
  ['g-shihe', '长安食盒·城市限定美食礼盒', '萌龙绿豆糕龙鳞酥柿子饼', 199],
];
const goodsGrid = goods
  .map(
    ([id, name, desc, price], i) => `<div class="grid-item" style="animation-delay:${i * 60}ms">
    <div class="grid-cover"><img class="grid-cover-img" src="../miniprogram/assets/goods/${id}.jpg">
      <div class="cover-scrim"></div><span class="cover-badge">预售</span></div>
    <div class="grid-info"><span class="grid-name">${name}</span><span class="grid-desc">${desc}</span>
      <div class="grid-foot"><span class="grid-price"><span class="grid-price-symbol">¥</span>${price}</span></div></div></div>`
  )
  .join('');
const mallBody = `<div class="page-wrap mall">
  <div class="mall-head"><span class="mall-title">云阙商城</span><span class="mall-sub">文物灵感 · AIGC 再现，盛唐好物集</span></div>
  <div class="cat-bar">${catBar}</div>
  <div class="goods-grid">${goodsGrid}</div></div>`;

await shot('tour-check', conv(read('pages/tour/tour.wxss')), tourBody);
await shot('mine-check', conv(read('pages/mine/mine.wxss')), mineBody);
await shot('mall-check', conv(read('pages/mall/mall.wxss')), mallBody);
console.log('all done');
