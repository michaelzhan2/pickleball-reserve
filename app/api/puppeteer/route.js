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


function dateToQuery(date) {
  const monthToNum = {
    'January': '01',
    'Febuary': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12'
  }

  const dateList = date.split(' ');
  const month = monthToNum[dateList[1]];
  const day = dateList[2].slice(0, -1);
  const year = dateList[3];

  return `${month}%2F${day}%2F${year}`;
}

function generateTimeBlocks () {
  // Generate a list of time blocks in 30 minute intervals from 8:00 AM to 10:00 PM, mimicking the format of the webtrac site
  const timeOptions = [];
  
  var time = 8;

  while (time <= 21.5) {
    const hour = Math.floor(time);
    const minute = (time - hour) * 60;

    const ampm = hour < 12 ? 'am' : 'pm';
    const hour12 = hour > 12 ? hour - 12 : hour;

    const hourString = hour12 < 10 ? ` ${hour12}` : `${hour12}`;
    const minuteString = minute < 10 ? `0${minute}` : `${minute}`;
    

    const timeString = `${hourString}:${minuteString} ${ampm}`;
    timeOptions.push(timeString);

    time += 0.5;
  }

  const timeBlocks = [];
  for (var i = 0; i < timeOptions.length - 1; i++) {
    const timeBlock = `${timeOptions[i]} - ${timeOptions[i + 1]}`;
    timeBlocks.push(timeBlock);
  }

  return timeBlocks;
}


export async function POST(request) {
  const body = await request.json();
  const { username, password, date, startTimeIdxString, endTimeIdxString } = body;
  const startTimeIdx = parseInt(startTimeIdxString);
  const endTimeIdx = parseInt(endTimeIdxString);

  const courtOrder = [14, 12, 15, 17, 13, 16];
  const timeBlocks = generateTimeBlocks();

  var responseBody;
  var responseStatus;

  const browser = await puppeteer.launch({
    headless: 'new'
  });

  try {
    // go to page
    const page = await browser.newPage();
    await page.goto('https://info.uptexas.org/webtrac/wbwsc/webtrac.wsc/splash.html');
    await page.waitForNetworkIdle();
    await checkPage(page);
    
    // log in
    const myAccount = await page.waitForSelector('#menu_myaccount');
    const login = await myAccount.waitForSelector('a');
    await login.evaluate((el) => el.click());
    await page.waitForNetworkIdle();
    await checkPage(page);
    
    // enter username and password
    const usernameField = await page.waitForSelector('#weblogin_username');
    const passwordField = await page.waitForSelector('#weblogin_password');
    await usernameField.type(username);
    await passwordField.type(password);
    const submit = await page.waitForSelector('#weblogin_buttonlogin');
    await submit.evaluate((el) => el.click());
    await page.waitForNavigation();
    await checkPage(page);

    // handle session alert
    if (await page.$eval('body', el => el.getAttribute('data-view') === 'websessionalert')) {
      (await page.waitForSelector('#websessionalert_buttoncontinue')).evaluate((el) => el.click());
      await page.waitForNavigation();
      await checkPage(page);
    }

    // navigate to court selection
    const courts = await page.waitForSelector('#favorites > div:nth-child(2) > a:nth-child(3)')
    await courts.evaluate((el) => el.click());
    await page.waitForNavigation();
    await checkPage(page);


    // query date
    const currentUrl = page.url();
    await page.goto(currentUrl + '&date=' + dateToQuery(date));
    await page.waitForNetworkIdle();
    await checkPage(page);

    // try to select courts at each time block
    var success = false;
    for (var window = 3; window > 0; window--) {
      for (var timeIdx = startTimeIdx; timeIdx <= endTimeIdx - window; timeIdx++) {
        for (const courtNum of courtOrder) {
          const courtSelector = `#crwebsearch_nextgenresultsgroup > div.rect.group__inner > div:nth-child(${courtNum})`;
          const court = await page.waitForSelector(courtSelector);

          // check if the time block is available
          var validTimes = true;
          for (var i = timeIdx; i < timeIdx + window; i++) {
            const timeBlockExists = await page.evaluate((courtSelector, timeBlock) => {
              const court = document.querySelector(courtSelector);
              const courtTimeOptions = court.querySelectorAll('tbody > tr:nth-child(2) a');
              blockFound = false;
              for (const courtTimeOption of courtTimeOptions) {
                if (courtTimeOption.textContent === timeBlock) {
                  blockFound = true;
                  break;
                }
              }
              return blockFound;
            }, courtSelector, timeBlocks[i]);
            if (!timeBlockExists) {
              validTimes = false;
              break;
            }
          }
          if (!validTimes) {
            continue;
          }
          // select the time block
          for (var i = timeIdx; i < timeIdx + window; i++) {
            const time = await court.waitForSelector(`::-p-text(${timeBlocks[i]})`);
            await time.evaluate((el) => el.click());
            await page.waitForNetworkIdle();
          }

          // add to cart
          const addtocart = await page.waitForSelector('#multiselectlist > div > div > div > button.button.primary.multiselectlist__addbutton');
          await addtocart.evaluate((el) => el.click());
          await page.waitForNetworkIdle();
          await checkPage(page);

          // finish checkout
          const finishbutton = await page.waitForSelector('#courtmemberselection_buttononeclicktofinish');
          await finishbutton.evaluate((el) => el.click());
          await page.waitForNetworkIdle();
          await checkPage(page);

          success = true;
          break;

        }
        if (success) {
          break;
        }
      }
      if (success) {
        break;
      }
    }
    const logout = await page.waitForSelector('#menu_myaccount > ul > li > div > ul > li:nth-child(4) > ul > li:nth-child(4) > a');
    await logout.evaluate((el) => el.click());
    await page.waitForNetworkIdle();
    await checkPage(page);

    if (success) {
      responseBody = 'Reservation successful';
      responseStatus = 200;
    } else {
      responseBody = 'Reservation unsuccessful';
      responseStatus = 400;
    }
  }
  catch (e) {
    console.log(e);
    responseBody = 'Internal server error';
    responseStatus = 500;
  }
  finally {
    await browser.close();
    return new Response(responseBody, {status: responseStatus});
  }
}