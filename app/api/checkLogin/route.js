const puppeteer = require('puppeteer');


async function checkPage(page) {
  for (let count = 0; count < 10; count++) {
    const goodPage = await page.evaluate(() => {
      const title = document.querySelector('title');
      return title !== '&lt;?VSI-PageTitle?&gt;'
    });
    if (goodPage) {
      break;
    } else {
      page.reload();
      page.waitForTimeout(2000);
    }
  }
}


export async function POST(request) {
  const body = await request.json();
  const { username, password, date, startTimeIdx, endTimeIdx } = body;

  const browser = await puppeteer.launch({
    headless: 'new'
  });

  var responseBody;
  var responseStatus;

  try {
    const page = await browser.newPage();
  
    await page.goto('https://info.uptexas.org/webtrac/wbwsc/webtrac.wsc/splash.html');
    await page.waitForNetworkIdle();
    await checkPage(page);
    
    const myAccount = await page.waitForSelector('#menu_myaccount');
    const login = await myAccount.waitForSelector('a');
    await login.evaluate((el) => el.click());
    await page.waitForNavigation();
    await checkPage(page);

    const usernameField = await page.waitForSelector('#weblogin_username');
    const passwordField = await page.waitForSelector('#weblogin_password');
  
    await usernameField.type(username);
    await passwordField.type(password);

    const submit = await page.waitForSelector('#weblogin_buttonlogin');
    await submit.evaluate((el) => el.click());
    await page.waitForNetworkIdle();
    await checkPage(page);
    
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