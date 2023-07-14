const puppeteer = require('puppeteer');


export async function GET() {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();

  await page.goto('https://www.google.com');
  await page.screenshot({ path: 'google.png' });

  await browser.close();
  return new Response('Screenshot successful', { status: 200 });
}