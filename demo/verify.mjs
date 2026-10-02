import pw from '/opt/vm/preinstall/npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERR:' + e.message));

const BASE = 'http://localhost:8090/demo/prototype/';
await page.goto(BASE);
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/v-home.png' });

const tapDialog = async () => page.click('.dbubble', { force: true });

// ===== 链路一：完整走完丹凤门剧场（真实点击） =====
await page.click('#btn-enter');
await page.waitForTimeout(700);
await tapDialog(); await page.waitForTimeout(450);       // step1
await tapDialog(); await page.waitForTimeout(450);       // step2 choice
await page.click('.choice >> nth=0'); await page.waitForTimeout(450);
await tapDialog(); await page.waitForTimeout(450);       // step3 ar
await page.click('#sa-ar'); await page.waitForTimeout(900);
await page.screenshot({ path: '/tmp/v-ar.png' });
await page.click('#ar-close'); await page.waitForTimeout(600); // -> src
await page.click('#sa-src'); await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/v-src.png' });
await page.click('#src-close'); await page.waitForTimeout(500); // -> scale
await page.click('#sa-scale'); await page.waitForTimeout(2400);  // 集鳞
await page.screenshot({ path: '/tmp/v-scale.png' });
await page.click('#sa-next'); await page.waitForTimeout(700);    // 含元殿
console.log('丹凤门剧场走完，当前:', await page.textContent('#sc-name'));

// 快速确认其余六剧场可渲染且能集齐（用钩子直接结算每剧场）
for (let i = 1; i < 7; i++) {
  await page.evaluate((i) => { window.APP.gotoScene(i); }, i);
  await page.waitForTimeout(250);
  const name = await page.textContent('#sc-name');
  if (!name) errors.push('剧场' + i + '未渲染');
}
console.log('其余剧场渲染检查完成');

// ===== 链路二：AR 相机 =====
await page.evaluate(() => window.APP.openArCam());
await page.waitForTimeout(800);
await page.click('#cam-scan');
await page.waitForTimeout(1800);
await page.screenshot({ path: '/tmp/v-cam.png' });
const arOn = await page.isVisible('#cam-arobj');
console.log('现场AR marker叠加:', arOn);

// ===== 链路三：商城 -> 详情AR -> 加购 -> 意向单提交 =====
await page.evaluate(() => window.APP.openDetail('g-sx-nangnang'));
await page.waitForTimeout(700);
await page.click('#det-ar'); await page.waitForTimeout(900);
await page.screenshot({ path: '/tmp/v-detar.png' });
await page.click('#det-ar-close');
await page.click('#det-cart'); await page.waitForTimeout(400);
await page.evaluate(() => window.APP.openIntention());
await page.fill('#f-name', '陈同学');
await page.fill('#f-phone', '13800138000');
await page.click('#int-submit');
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/v-intdone.png' });
const intOk = await page.isVisible('#int-success');
console.log('商城意向闭环:', intOk);

// 祈愿卡（七鳞已在前面丹凤门+钩子？钩子只渲染未结算；这里直接结算后看卡）
await page.evaluate(() => {
  const want = ['启程鳞','朝会鳞','廊下鳞','召对鳞','池苑鳞','盛宴鳞','归愿鳞'];
  window.APP.S.scales = want;
  window.APP.renderWish();
});
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/v-wish.png' });

console.log('\\n=== 控制台错误 ===');
console.log(errors.length ? errors.join('\\n') : '无错误');
await browser.close();
