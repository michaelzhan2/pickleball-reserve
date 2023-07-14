const puppeteer = require('puppeteer');
const fs = require('fs');


export async function GET() {
  // TODO: take user input for user and pass
  // TODO: take user input for data
  // TODO: take user input for time
  // TODO: take user input for court preference order

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: './user_data',
    args: [
      '--enable-save-password-bubble'
    ]
  });

  try {
    const page = await browser.newPage();
  
    await page.goto('https://info.uptexas.org/webtrac/wbwsc/webtrac.wsc/splash.html');
    
    const myAccount = await page.waitForSelector('#menu_myaccount');
    const login = await myAccount.waitForSelector('a');
    await login.evaluate((el) => el.click());
    await page.waitForNetworkIdle();
  
  
  
    // const user = 'ming.zhan';
    // const pass = '########';
  
    // const username = await page.waitForSelector('#weblogin_username');
    // const password = await page.waitForSelector('#weblogin_password');
  
    // await username.type(user);
    // await password.type(pass);
  
    const submit = await page.waitForSelector('#weblogin_buttonlogin');
    await submit.evaluate((el) => el.click());
    await page.waitForNavigation();

    if (await page.$eval('body', el => el.getAttribute('data-view') === 'websessionalert')) {
      (await page.waitForSelector('#websessionalert_buttoncontinue')).evaluate((el) => el.click());
      await page.waitForNavigation();
    }

    // navigate to court selection
    const courts = await page.waitForSelector('#favorites > div:nth-child(2) > a:nth-child(3)')
    await courts.evaluate((el) => el.click());
    await page.waitForNavigation();



    // choose date (&date=07%2F16%2F2023 sample query)
    // TODO: make this dynamic
    let currentUrl = await page.url();
    await page.goto(currentUrl + '&date=07%2F15%2F2023');
    await page.waitForNetworkIdle();


    // williams court 1: #crwebsearch_nextgenresultsgroup > div.rect.group__inner > div:nth-child(12)
    const williams1 = await page.waitForSelector('#crwebsearch_nextgenresultsgroup > div.rect.group__inner > div:nth-child(12)');


    // time block: //*[@id="crwebsearch_output_table"]/tbody/tr[2]/td/a[2]/text()
    const timeblock = await williams1.waitForSelector('::-p-text( 2:30 pm -  3:00 pm)')
    await timeblock.evaluate((el) => el.click());
    
    // add to cart: #multiselectlist > div > div > div > button.button.primary.multiselectlist__addbutton
    const addtocart = await page.waitForSelector('#multiselectlist > div > div > div > button.button.primary.multiselectlist__addbutton');
    await addtocart.evaluate((el) => el.click());
    await page.waitForNavigation();

    const finishbutton = await page.waitForSelector('#courtmemberselection_buttononeclicktofinish');
    await finishbutton.evaluate((el) => el.click());
    await page.waitForNetworkIdle();

    // screenshot
    await page.screenshot({ path: 'screenshot.png' });

    // const logout = await page.waitForSelector('#menu_myaccount > ul > li > div > ul > li:nth-child(4) > ul > li:nth-child(4) > a');
    // await logout.evaluate((el) => el.click());
    // await page.waitForNetworkIdle();
  }
  catch (e) {
    console.log(e);
  }
  finally {
    await browser.close();
  }
  return new Response('Screenshot successful', { status: 200 });
}