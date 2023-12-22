import CryptoJS from "crypto-js";
import { LoginInfo } from "@/types/api";
import puppeteer from "puppeteer";


export async function POST(request: Request) {
  let responseBody: string = 'OK';
  let responseStatus: number = 200;

  const body: LoginInfo = await request.json();
  const { username, encryptedPassword } = body;
  const password = CryptoJS.AES.decrypt(encryptedPassword, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString(CryptoJS.enc.Utf8);
  console.log(username, password)

  const browser = await puppeteer.launch({
    // headless: 'new',
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://secure.rec1.com/TX/up-tx/catalog');
    await page.waitForSelector('#rec1-public-navigation-bar > div.col-xs-5 > div > div > a').then((el) => el?.evaluate((e) => e.click()));
    await page.waitForSelector('#login-username', {hidden: true, visible: true}).then((el) => el?.type(username));
    await page.waitForSelector('#login-password', {hidden: true, visible: true}).then((el) => el?.type(password));
    await page.waitForSelector('#rec1-public-navigation-bar > div.col-xs-5 > div > div > ul > li:nth-child(1) > form > div:nth-child(4) > div > button', {hidden: true, visible: true}).then((el) => el?.evaluate((e) => e.click()));

    page.on('dialog', async dialog => {
      responseBody = dialog.message();
      responseStatus = 403;
      await dialog.dismiss();
    })

    await page.waitForNetworkIdle();
  } catch (e: any) {
    responseBody = e.message;
    console.log(e.message)
    responseStatus = 500;
  } finally {
    await browser.close();
  }

  return new Response(responseBody, { status: responseStatus });
}