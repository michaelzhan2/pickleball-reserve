import { cookies } from "next/headers";
import crypto from "crypto";
import puppeteer from "puppeteer";
import { TimeoutError } from "puppeteer";
import { delay } from "@/utils/delay";

async function createLoginCookie(hash: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: hash,
    value: "login",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  });
}

async function checkLoginCookie(hash: string): Promise<boolean> {
  const cookieStore = await cookies();
  const loginCookie = cookieStore.get(hash);
  return loginCookie !== undefined;
}

async function tryLogin(username: string, password: string): Promise<boolean> {
  const browser = await puppeteer.launch({
    headless: false,
  });

  try {
    // input login credentials and click submit
    let element;
    const page = await browser.newPage();
    await page.goto("https://secure.rec1.com/TX/up-tx/catalog");
    element = await page.waitForSelector("a.rec1-login-trigger");
    await element?.click();
    element = await page.waitForSelector("#login-username");
    await element?.type(username);
    element = await page.waitForSelector("#login-password");
    await element?.type(password);
    element = await page.waitForSelector(
      "#rec1-public-navigation-bar > div.col-xs-5 > div > div > ul > li:nth-child(1) > form > div:nth-child(4) > div > button"
    );
    await element?.click();

    // check for failed login
    let loginSuccess = true;
    page.on("dialog", async () => {
      loginSuccess = false;
    });

    await delay(1000);

    return loginSuccess;
  } catch (e) {
    if (e instanceof TimeoutError) {
      console.error(`Failed to login for ${username} with error ${e.message}`);
    } else {
      console.error(`Failed to login for ${username} with error ${e}`);
    }
    return false;
  } finally {
    await browser.close();
  }
}

export async function POST(request: Request): Promise<Response> {
  const body: { username: string; password: string } = await request.json();
  const { username, password } = body;

  const hash = crypto
    .createHash("md5")
    .update(`${username}:${password}`)
    .digest("hex");
  if (!(await checkLoginCookie(hash))) {
    if (!(await tryLogin(username, password))) {
      return new Response("Invalid login credentials", { status: 403 });
    }
  }
  await createLoginCookie(hash);
  return new Response("OK", { status: 200 });
}
