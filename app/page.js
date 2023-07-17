'use client'


import Image from 'next/image'
import styles from './page.module.css'
import { useState } from 'react'


function generateDateOptions (curDate) {
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


export default function Home() {
  const curDate = new Date();
  const [twoDaysString, threeDaysString] = generateDateOptions(curDate);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    date: threeDaysString
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

      <button type="submit">Submit</button>
    </form>
  )
}
