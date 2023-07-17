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
  const twoDays = new Date();
  const threeDays = new Date();

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

  const twoDaysDay = dayOfWeek[twoDays.getDay()];
  const threeDaysDay = dayOfWeek[threeDays.getDay()];

  const twoDaysMonth = monthOfYear[twoDays.getMonth()];
  const threeDaysMonth = monthOfYear[threeDays.getMonth()];

  const twoDaysDate = twoDays.getDate();
  const threeDaysDate = threeDays.getDate();

  const twoDaysString = `${twoDaysDay}, ${twoDaysMonth} ${twoDaysDate}`;
  const threeDaysString = `${threeDaysDay}, ${threeDaysMonth} ${threeDaysDate}`;

  return [twoDaysString, threeDaysString];
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
  const [twoDaysString, threeDaysString] = generateDateOptions(curDate);

  const timeOptions = generateTimeOptions();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    date: threeDaysString,
    startTime: timeOptions[22],
    endTime: timeOptions[timeOptions.length - 1]
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  }


  return (
    <form onSubmit={ handleSubmit }>
      <div className={styles['login-field']}>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" placeholder="Username" onChange={ handleChange } />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="Password" onChange={ handleChange }/>
      </div>

      <div className={ styles['date-field'] }>
        <label htmlFor="date">Date</label>
        <select id="date" defaultValue={ threeDaysString } onChange={ handleChange }>
          <option value={ threeDaysString }>{ threeDaysString }</option>
          <option value={ twoDaysString }>{ twoDaysString }</option>
        </select>
      </div>

      <div className={ styles['time-field'] }>
        <label htmlFor="startTime">Start Time</label>
        <select id="startTime" defaultValue={ timeOptions[22] } onChange={ handleChange }>
          { timeOptions.map((time) => <option value={ time }>{ time }</option>) }
        </select>
        <label htmlFor="endTime">End Time</label>
        <select id="endTime" defaultValue={ timeOptions[timeOptions.length - 1] } onChange={ handleChange }>
          { timeOptions.map((time) => <option value={ time }>{ time }</option>) }
        </select>
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
