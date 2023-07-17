const puppeteer = require('puppeteer');


export async function POST(request) {
  const body = await request.json();
  const { username, password, date, startTime, endTime } = body;

  const browser = await puppeteer.launch({
    headless: false,
    // userDataDir: './user_data',
    args: [
      '--enable-save-password-bubble'
    ]
  });

  var responseBody;
  var responseStatus;

  try {
    const page = await browser.newPage();
  
    await page.goto('https://info.uptexas.org/webtrac/wbwsc/webtrac.wsc/splash.html');
    
    const myAccount = await page.waitForSelector('#menu_myaccount');
    const login = await myAccount.waitForSelector('a');
    await login.evaluate((el) => el.click());
    await page.waitForNetworkIdle();

    const usernameField = await page.waitForSelector('#weblogin_username');
    const passwordField = await page.waitForSelector('#weblogin_password');
  
    await usernameField.type(username);
    await passwordField.type(password);

    const submit = await page.waitForSelector('#weblogin_buttonlogin');
    await submit.evaluate((el) => el.click());
    await page.waitForNetworkIdle();
    

    const errorMessageExists = await page.evaluate(() => {
      const errorMessage = document.querySelector('.message.error');
      return errorMessage !== null;
    });
    if (errorMessageExists) {
      responseStatus = 400;
      responseBody = 'Invalid username or password';
    } else {
      responseStatus = 200;
      responseBody = 'Success';
    }
  } catch (e) {
    console.log(e);
    responseStatus = 500;
    responseBody = 'Internal Server Error';
  } finally {
    await browser.close();
    return new Response(responseBody, { status: responseStatus });
  }
}