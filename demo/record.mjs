import pw from '/opt/vm/preinstall/npm-global/lib/node_modules/playwright/index.js';
import fs from 'fs';
const { chromium } = pw;

const OUT = 'demo/raw';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({
  viewport: { width: 414, height: 896 },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: 414, height: 896 } },
});
const page = await context.newPage();
const sleep = (ms) => page.waitForTimeout(ms);
const T = { dlg: 1200, choice: 1300, ar: 4000, src: 4000, scale: 2900, next: 1100 };

await page.goto('http://localhost:8090/demo/prototype/?t=' + Date.now());
await sleep(3000); // 首页开场停留

/* ===== 链路一：云游集鳞，走完七剧场 ===== */
await page.click('#btn-enter');
await sleep(1400);

async function proceedScene() {
  // 对话
  while ((await page.locator('#sc-actions button').count()) === 0) {
    if (await page.locator('#sc-choices .choice').count()) {
      await page.click('#sc-choices .choice >> nth=0');
      await sleep(T.choice);
      await page.click('.dbubble', { force: true });
      await sleep(T.dlg);
    } else if (await page.locator('.dbubble').count()) {
      await page.click('.dbubble', { force: true });
      await sleep(T.dlg);
    } else await sleep(400);
  }
  // 动作区：可能 ar/src/scale（ar、src 处理后回到 scale）
  let guard = 0;
  while (guard++ < 6) {
    if (await page.locator('#sa-ar').count()) {
      await page.click('#sa-ar'); await sleep(T.ar);
      await page.click('#ar-close'); await sleep(900);
    } else if (await page.locator('#sa-src').count()) {
      await page.click('#sa-src'); await sleep(T.src);
      await page.click('#src-close'); await sleep(900);
    } else if (await page.locator('#sa-scale').count()) {
      await page.click('#sa-scale'); await sleep(T.scale);
      if (await page.locator('#sa-next').count()) {
        await page.click('#sa-next'); await sleep(T.next);
        return 'next';
      }
      return 'wish';
    } else await sleep(500);
  }
  return 'guard';
}

for (let i = 0; i < 7; i++) {
  const r = await proceedScene();
  console.log('剧场', i + 1, '->', r);
  if (r === 'wish') break;
}

/* 终章：祈愿卡 */
await sleep(2500);
await page.click('#wish-save'); await sleep(2000);
await page.click('#wish-share'); await sleep(2600);

/* ===== 链路二：现场 AR（以含元殿为例） ===== */
await page.evaluate(() => { window.APP.S.si = 1; window.APP.openArCam(); });
await sleep(2200);
await page.click('#cam-scan');
await sleep(4500); // marker 识别 + 叠加停留
await page.click('#cam-lbs').catch(() => {}); // 兜底演示（若可点）
await sleep(3000);

/* ===== 链路三：商城 -> 详情AR -> 加购 -> 意向单提交/查询 ===== */
await page.evaluate(() => window.APP.openDetail('g-sx-nangnang'));
await sleep(2200);
await page.click('#det-ar'); await sleep(4200);
await page.click('#det-ar-close'); await sleep(800);
await page.click('#det-cart'); await sleep(1800);
await page.evaluate(() => window.APP.openIntention());
await sleep(1800);
await page.fill('#f-name', '陈同学'); await sleep(700);
await page.fill('#f-phone', '13800138000'); await sleep(700);
await page.click('#int-submit'); await sleep(2200);
await page.click('#int-query'); await sleep(2600);
await page.click('#int-back-mall'); await sleep(2200);

const video = page.video();
await context.close();
await browser.close();
console.log('VIDEO:', video.path());
