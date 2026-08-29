import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(500);
const overflow = await page.evaluate(() => {
  const doc = document.documentElement;
  return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
});
await page.screenshot({ path: "/workspace/screenshots/mobile.png", fullPage: false });
const menuBtn = page.locator('button[aria-label="메뉴 열기"]');
if (await menuBtn.count()) {
  await menuBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/workspace/screenshots/mobile-menu.png", fullPage: false });
}
console.log(JSON.stringify({ overflow, errors, hasOverflow: overflow.scrollWidth > overflow.clientWidth + 2 }, null, 2));
await browser.close();
