// Снимает скриншоты ключевых экранов приложения для документации.
// Запуск: NODE_PATH="$(npm root -g)" node scripts/screenshots.cjs
const { chromium } = require('playwright');

const BASE = 'http://localhost:4200';
const OUT = 'docs/images';

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForSelector('input[formControlName=email]');
  await page.fill('input[formControlName=email]', email);
  await page.fill('input[formControlName=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForURL(/\/(patient|doctor)/, { timeout: 15000 });
  await page.waitForTimeout(1800);
}

(async () => {
  const browser = await chromium.launch();

  // 1. Экран входа
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/01-login.png` });
    console.log('✓ 01-login');
    await ctx.close();
  }

  // 2. Кабинет пациента
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await login(page, 'ivanova@mail.com');
    await page.screenshot({ path: `${OUT}/02-patient-dashboard.png`, fullPage: true });
    console.log('✓ 02-patient-dashboard');
    await ctx.close();
  }

  // 3-5. Кабинет врача (Петров): заявки, график, уведомления
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await login(page, 'petrov@hospital.com');
    await page.screenshot({ path: `${OUT}/03-doctor-requests.png`, fullPage: true });
    console.log('✓ 03-doctor-requests');

    await page.click('button:has-text("График")');
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/04-doctor-schedule.png`, fullPage: true });
    console.log('✓ 04-doctor-schedule');

    await page.click('.bell-btn');
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/05-notifications.png` });
    console.log('✓ 05-notifications');
    await ctx.close();
  }

  // 6. Карта пациента глазами врача (Коваленко — у его пациента есть история)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await login(page, 'kovalenko@hospital.com');
    await page.click('button:has-text("Пациенты")');
    await page.waitForTimeout(900);
    await page.click('.patient-card:has-text("Смирнов")');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/06-patient-card.png` });
    console.log('✓ 06-patient-card');
    await ctx.close();
  }

  await browser.close();
  console.log('Готово');
})();
