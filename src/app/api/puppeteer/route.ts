import CryptoJS from "crypto-js";
import puppeteer, { ElementHandle } from "puppeteer";
import { PuppeteerInfo } from "@/types/api";
import { timeOptions } from "@/utils/dateTime";
import { delay } from "@/utils/delay";


export async function POST(request: Request) {
  let responseBody: string = 'OK';
  let responseStatus: number = 200;

  const body: PuppeteerInfo = await request.json();
  const { username, encryptedPassword, date, month, year, startTime, endTime, courtOrder } = body;
  const password = CryptoJS.AES.decrypt(encryptedPassword, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString(CryptoJS.enc.Utf8);

  const browser = await puppeteer.launch({
    headless: true,
    //DEBUG
    // headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    // login
    const page = await browser.newPage();
    await page.goto('https://secure.rec1.com/TX/up-tx/catalog');
    await page.waitForSelector('#rec1-public-navigation-bar > div.col-xs-5 > div > div > a').then((el) => el?.evaluate((e) => e.click()));
    await page.waitForSelector('#login-username', {hidden: true, visible: true}).then((el) => el?.type(username));
    await page.waitForSelector('#login-password', {hidden: true, visible: true}).then((el) => el?.type(password));
    await page.waitForSelector('#rec1-public-navigation-bar > div.col-xs-5 > div > div > ul > li:nth-child(1) > form > div:nth-child(4) > div > button', {hidden: true, visible: true}).then((el) => el?.evaluate((e) => e.click()));

    // break early on failed login
    let loginFailed = false;
    page.on('dialog', async dialog => {
      responseBody = dialog.message();
      responseStatus = 403;
      await dialog.dismiss();
      loginFailed = true;
    })
    await delay(1000); // wait for any dialogs to show
    if (loginFailed) {
      throw new Error(responseBody);
    }

    // navigate to court select pages
    await page.waitForSelector('#rec1-public-wrapper > div.ui-page > div.rec1-catalog.rec1-catalog-container.clearfix > div.rec1-catalog-items > div.rec1-catalog-heading > div > div > div:nth-child(4)').then((el) => el?.evaluate((e) => e.click()));
    await page.waitForSelector('#\\33 9046 > div.rec1-catalog-group-name.pull-left').then((el) => el?.evaluate((e) => e.click()));
    await delay(2000);
    
    // ========== main loop: for each court, try to find reservation ==============
    let court, startTimeDropdown, startTimeOptions, endTimeDropdownButton, endTimeDropdown, endTimeOptions, startTimeString, endTimeString;
    let done = false;
    let dateCells, dateCell, dateCellText;
    let dateFound = false;
    let startSelected;
    let children;

    // select date DEBUG might be fix
    await page.waitForSelector('button.btn.interactive-grid-date-next').then((el) => el?.evaluate((e) => e.click()));
    await delay(500);
    await page.waitForSelector('button.btn.interactive-grid-date-next').then((el) => el?.evaluate((e) => e.click()));
  
    for (let window = 3; window > 0; window--) {
      for (let c = 0; c < courtOrder.length; c++) {
        court = courtOrder[c];
        console.log(`[puppeteer] Trying court ${court}`);


        //DEBUG try
        await delay(500);
        await page.waitForSelector(`table.interactive-grid-table > tr:nth-child(${court + 2}) > td:nth-child(2)`).then((el) => el?.evaluate((e) => e.click()));
        // // select court DEBUG
        // await page.waitForSelector(`#rec1-public-wrapper > div.ui-page > div.rec1-catalog.rec1-catalog-container.clearfix > div.rec1-catalog-items > div.rec1-catalog-items-inner.clearfix > div.rec1-catalog-group.selected.collapsible > div.rec1-catalog-group-maps > div.facility-grid > div.interactive-grid-container > div.interactive-grid-inner > table > tr:nth-child(${court + 2}) > td:nth-child(2) > div`).then((el) => el?.evaluate((e) => e.click()));
        
        // DEBUG
        // // select month, year, date
        // await delay(1000);
        // await page.select('[id^=rec1-catalog-reservation-date-] > div > div > div > select.ui-datepicker-month', `${month}`);
        // await page.select('[id^=rec1-catalog-reservation-date-] > div > div > div > select.ui-datepicker-year', `${year}`);

        // await delay(200);
        // const dateTable = await page.waitForSelector('[id^=rec1-catalog-reservation-date-] > div > table > tbody');
        // const dateRows = await dateTable?.$$('tr');

        // if (!dateRows) throw new Error('Calendar date selection failed');

        // dateFound = false;
        // for (let i = 0; i < dateRows.length; i++) {
        //   dateCells = await dateRows[i].$$('td');
        //   for (let j = 0; j < dateCells.length; j++) {
        //     dateCell = dateCells[j];
        //     dateCellText = await dateCell.evaluate((e) => e.textContent);
        //     if (dateCellText === `${date}`) {
        //       dateFound = true;
        //       await dateCell.evaluate((e) => e.click());
        //       break;
        //     }
        //   }
        //   if (dateFound) break;
        // }

        await delay(500);
        startTimeDropdown = await page.waitForSelector('select.rec1-catalog-reservation-hours-from');
        // startTimeDropdown = await page.waitForSelector('[id^=popover] > div.popover-content > div > div.ui-col-7.ui-offset-lg > form > div.reservation-hours > div > select.ui-selectmenu.rec1-catalog-reservation-hours-from.notranslate');
        if (!startTimeDropdown) throw new Error('Start time dropdown not found');

        startTimeOptions = await page.evaluate(select => {
          const options = (select as HTMLSelectElement).querySelectorAll('option');
          return Array.from(options).map(option => [option.textContent, option.value]);
        }, startTimeDropdown);

        if (!startTimeOptions) continue;

        for (let i = startTime; i <= endTime - window; i++) {
          startTimeString = timeOptions[i];
          startSelected = false;
          for (let j = 0; j < startTimeOptions.length; j++) {
            if (startTimeOptions[j][0] === startTimeString) {
              await startTimeDropdown.select((startTimeOptions as string[][])[j][1]);
              console.log(`[puppeteer] Selected start ${startTimeOptions[j][0]}`)
              startSelected = true;
              break;
            }
          }
          if (!startSelected) continue;

          await delay(500);
          // endTimeDropdownButton = await page.waitForSelector('[id^=popover] > div.popover-content > div > div.ui-col-7.ui-offset-lg > form > div.reservation-hours > div > div:nth-child(4)')
          // await endTimeDropdownButton?.click();
          // endTimeDropdown = await page.waitForSelector('body > div.selectmenu-items.notranslate.open > div.selectmenu-spacer-foreground');
          endTimeDropdown = await page.waitForSelector('select.rec1-catalog-reservation-hours-to');
          if (!endTimeDropdown) throw new Error('End time dropdown not found');
  
          endTimeOptions = await page.evaluate(select => {
            const options = (select as HTMLSelectElement).querySelectorAll('option');
            return Array.from(options).map(option => [option.textContent, option.value]);
          }, endTimeDropdown);
  
          endTimeString = timeOptions[`${i + window}`];
          for (let j = 0; j < endTimeOptions.length; j++) {
            if (endTimeOptions[j][0] === endTimeString) {
              await endTimeDropdown.select((endTimeOptions as string[][])[j][1]);
              // children = await endTimeDropdown?.$$('div');
              // if (!children) continue;
              // await children[j].evaluate((e) => e.click());
  
              // await endTimeDropdown?.waitForSelector('div')
              console.log(`[puppeteer] Selected end ${endTimeOptions[j][0]}`)
              done = true;
              break;
            }
          }
          if (done) {
            break;
          } else {
            console.log(`[puppeteer] End time ${endTimeString} not found`)
          }
        }
        if (done) break;
        
        // close the court window and choose another
        await page.waitForSelector('button.closeDetails').then((el) => el?.evaluate((e) => e.click()));
      }
      if (done) break;
    }
    // =========== end main loop ===================
//
    // add to cart and checkout
    await delay(1000);
    await page.waitForSelector('button[data-action=addToCart]').then((el) => el?.evaluate((e) => e.click()));
    await delay(1000);
    await page.waitForSelector('a.btn.cart-checkout-button').then((el) => el?.evaluate((e) => e.click()));
    await delay(1000);
    await page.waitForSelector('button[type=submit].checkout-continue-button').then((el) => el?.evaluate((e) => e.click()));
    await delay(1000);
    await page.waitForSelector('button[type=submit].checkout-continue-button').then((el) => el?.evaluate((e) => e.click()));
    await delay(5000);

    console.log('[puppeteer] Reservation successful')
  } catch (e: any) {
    responseBody = e.message;
    console.log(`[puppeteer] Error: ${responseBody}`)
    responseStatus = 500;
  } finally {
    await browser.close();
  }

  return new Response(responseBody, { status: responseStatus });
}