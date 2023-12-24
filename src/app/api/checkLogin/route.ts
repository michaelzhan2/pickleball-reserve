import CryptoJS from "crypto-js";
import { LoginInfo } from "@/types/api";
import { delay } from "@/utils/delay";
import puppeteer from "puppeteer";


const valid: string[][] = [];


export async function POST(request: Request) {
  /******************************************
   * Check login credentials
  *******************************************/
  let responseBody: string = 'OK';
  let responseStatus: number = 200;

  // decrypt password
  const body: LoginInfo = await request.json();
  const { username, encryptedPassword } = body;
  const password = CryptoJS.AES.decrypt(encryptedPassword, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString(CryptoJS.enc.Utf8);
  if (valid.includes([username, encryptedPassword])) {
    return new Response(responseBody, { status: responseStatus });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    // try login
    const page = await browser.newPage();
    await page.goto('https://secure.rec1.com/TX/up-tx/catalog');
    await page.waitForSelector('#rec1-public-navigation-bar > div.col-xs-5 > div > div > a').then((el) => el?.evaluate((e) => e.click()));
    await page.waitForSelector('#login-username', {hidden: true, visible: true}).then((el) => el?.type(username));
    await page.waitForSelector('#login-password', {hidden: true, visible: true}).then((el) => el?.type(password));
    await page.waitForSelector('#rec1-public-navigation-bar > div.col-xs-5 > div > div > ul > li:nth-child(1) > form > div:nth-child(4) > div > button', {hidden: true, visible: true}).then((el) => el?.evaluate((e) => e.click()));

    // check for failed login
    let loginFailed = false;
    page.on('dialog', async dialog => {
      responseBody = dialog.message();
      responseStatus = 403;
      console.log(dialog.message());
      await dialog.dismiss();
    })

    await delay(1000);
    if (loginFailed) {
      throw new Error(responseBody);
    }

    // logout
    await page.goto('https://secure.rec1.com/TX/up-tx/account/logout');
    valid.push([username, encryptedPassword]);
  } catch (e: any) {
    if (responseStatus === 200) {
      responseBody = e.message;
      console.log(e.message)
      responseStatus = 500;
    }
  } finally {
    await browser.close();
  }

  return new Response(responseBody, { status: responseStatus });
}