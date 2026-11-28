import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const site = await serve(resolve('dist'));
const browser = await chromium.launch();
for (const backend of ['memory', 'browser']) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
  page.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await page.goto(site.url + 'ide/index.html?backend=' + backend);
  await page.waitForFunction(() => document.documentElement.classList.contains('ready'));
  await page.waitForTimeout(300);
  require('node:fs').writeFileSync(process.argv[2] + '/git-' + backend + '.html', await page.evaluate(() => document.querySelector('[data-panel="git"]').outerHTML.replace(/></g, '>\n<')));
}
await browser.close(); await site.close();
