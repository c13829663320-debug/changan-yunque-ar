// AR 取景页视觉核验（未识别扫描状态，模拟相机暗背景）
import fs from 'fs';
import { chromium } from 'playwright';

const MP = '/home/user/.doubao/agent_mode/workspace/changan-yunque-ar/miniprogram';
const OUT = '/home/user/.doubao/agent_mode/workspace/changan-yunque-ar/demo';
const conv = (css) =>
  css
    .replace(/page\s*\{/g, 'body {')
    .replace(/(\d*\.?\d+)rpx/g, (_m, n) => `${parseFloat(n) / 2}px`)
    .replace(/env\(safe-area-inset-(top|bottom)\)/g, '0px');
const read = (p) => fs.readFileSync(`${MP}/${p}`, 'utf8');

const css =
  conv(read('styles/tokens.wxss')) +
  '\n' + conv(read('styles/common.wxss')) +
  '\n' + conv(read('package-tour/pages/ar-camera/ar-camera.wxss'));

const body = `<div class="ar-cam">
  <div class="cam cam-fake"></div>
  <div class="cam-top">
    <div class="top-row"><span class="cam-kicker">现场 AR</span><span class="cam-title">宣政殿</span></div>
    <span class="cam-tip">对准点位解说牌 / 识别图，或进入触发半径</span>
  </div>
  <div class="reticle">
    <div class="reticle-corner tl"></div><div class="reticle-corner tr"></div>
    <div class="reticle-corner bl"></div><div class="reticle-corner br"></div>
    <div class="scan-line"></div>
    <div class="reticle-hint"><div class="reticle-pulse"></div><span>正在识别解说牌 / 识别图</span></div>
  </div>
  <div class="cam-bottom">
    <div class="loc-row">
      <div class="loc-chip"><span class="loc-glyph">◉</span><span class="loc-text">距点位 35米</span></div>
      <div class="loc-chip"><span class="loc-glyph">✥</span><span class="loc-text">方位 西北</span></div>
    </div>
    <div class="btn-primary detect-btn">识别图中复原</div>
    <span class="vk-status">VKSession 就绪 · 未识别到图中目标</span>
  </div>
</div>`;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AR取景核验</title>
<style>${css}
body{margin:0;} div,span{box-sizing:border-box;}
.cam-fake{background:
  radial-gradient(120% 90% at 50% 18%, rgba(150,120,80,0.28), transparent 60%),
  radial-gradient(100% 100% at 50% 110%, rgba(40,32,24,0.9), #171310 60%), #1c1712;}
span{display:block;} .top-row span,.loc-chip span,.reticle-hint span{display:inline;}
</style></head><body>${body}</body></html>`;
fs.writeFileSync(`${OUT}/ar-check.html`, html);

const browser = await chromium.launch({
  executablePath: '/opt/vm/preinstall/ms-playwright/chromium-1169/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.goto(`file://${OUT}/ar-check.html`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/ar-check.png` });
await browser.close();
console.log('done: ar-check.png');
