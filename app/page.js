'use client'


import styles from './page.module.css'
import { useState } from 'react'
import * as Math from 'mathjs'


function generateDateOptions (curDate) {
  /*
  * Generates the date options for the date field
  * @param {Date} curDate - The current date
  * @return {Array} - An array of two strings representing the date options
  */
  const oneDay = new Date();
  const twoDays = new Date();
  const threeDays = new Date();

  oneDay.setDate(curDate.getDate() + 1);
  twoDays.setDate(curDate.getDate() + 2);
  threeDays.setDate(curDate.getDate() + 3);

  const dayOfWeek = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  }

  const monthOfYear = {
    0: 'January',
    1: 'Febuary',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  }

  const oneDayDay = dayOfWeek[oneDay.getDay()];
  const twoDaysDay = dayOfWeek[twoDays.getDay()];
  const threeDaysDay = dayOfWeek[threeDays.getDay()];

  const oneDayMonth = monthOfYear[oneDay.getMonth()];
  const twoDaysMonth = monthOfYear[twoDays.getMonth()];
  const threeDaysMonth = monthOfYear[threeDays.getMonth()];

  const oneDayDate = oneDay.getDate();
  const twoDaysDate = twoDays.getDate();
  const threeDaysDate = threeDays.getDate();

  const oneDayYear = oneDay.getFullYear();
  const twoDaysYear = twoDays.getFullYear();
  const threeDaysYear = threeDays.getFullYear();

  const oneDayString = `${oneDayDay}, ${oneDayMonth} ${oneDayDate}, ${oneDayYear}`;
  const twoDaysString = `${twoDaysDay}, ${twoDaysMonth} ${twoDaysDate}, ${twoDaysYear}`;
  const threeDaysString = `${threeDaysDay}, ${threeDaysMonth} ${threeDaysDate}, ${threeDaysYear}`;

  return [oneDayString, twoDaysString, threeDaysString];
}


function generateTimeOptions () {
  // Generate a list of time options in 30 minute intervals from 8:00 AM to 10:00 PM
  const timeOptions = [];
  
  var time = 8;

  while (time <= 22) {
    const hour = Math.floor(time);
    const minute = (time - hour) * 60;

    const ampm = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour > 12 ? hour - 12 : hour;

    const hourString = hour12 < 10 ? `0${hour12}` : `${hour12}`;
    const minuteString = minute < 10 ? `0${minute}` : `${minute}`;
    

    const timeString = `${hourString}:${minuteString} ${ampm}`;
    timeOptions.push(timeString);

    time += 0.5;
  }

  return timeOptions;
}


export default function Home() {
  /*
  * The main page component
  * @return {JSX} - The main page component
  */
  const curDate = new Date();
  const [oneDayString, twoDaysString, threeDaysString] = generateDateOptions(curDate);

  const timeOptions = generateTimeOptions();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    date: threeDaysString,
    startTimeIdxString: 22,
    endTimeIdxString: timeOptions.length - 1
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  }



  const handleSubmit = async (e) => {
    e.preventDefault();

    // let loginCheckResponse = await fetch('/api/checkLogin', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(formData)
    // });
    // if (loginCheckResponse.status == 200) {
    //   console.log('Login authorized');
    // } else if (loginCheckResponse.status == 400) {
    //   console.log('Incorrect username or password');
    //   return;
    // }
    // let reservationResponse = await fetch('/api/puppeteer', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(formData)
    // });
    // if (reservationResponse.status == 200) {
    //   console.log('Puppeteer script ran successfully');
    // } else if (reservationResponse.status == 400) {
    //   console.log('Puppeteer script failed to run');
    //   return;
    // }
  }


  return (
    <>
    <form onSubmit={ handleSubmit }>
      <div className={styles['login-field']}>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" placeholder="Username" onChange={ handleChange } required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="Password" onChange={ handleChange } required/>
      </div>
 
      <div className={ styles['date-field'] }>
        <label htmlFor="date">Date</label>
        <select id="date" defaultValue={ threeDaysString } onChange={ handleChange } required >
          <option value={ threeDaysString }>{ threeDaysString }</option>
          <option value={ twoDaysString }>{ twoDaysString }</option>
          <option value={ oneDayString }>{ oneDayString }</option>
        </select>
      </div>

      <div className={ styles['time-field'] }>
        <label htmlFor="startTimeIdxString">Start Time</label>
        <select id="startTimeIdxString" defaultValue={ 22 } onChange={ handleChange } required >
          { timeOptions.map((time, idx) => <option value={ idx } key={ idx }>{ time }</option>) }
        </select>
        <label htmlFor="endTimeIdxString">End Time</label>
        <select id="endTimeIdxString" defaultValue={ timeOptions.length - 1 } onChange={ handleChange } required >
          { timeOptions.map((time, idx) => <option value={ idx } key={ idx }>{ time }</option>) }
        </select>
      </div>

      <button type="submit">Submit</button>
    </form>
    </>
  )
}
