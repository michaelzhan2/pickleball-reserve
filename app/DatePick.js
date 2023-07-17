'use client'

import styles from './page.module.css'


export default function DatePick() {
  const curDate = new Date();
  const twoDays = new Date();
  const threeDays = new Date();

  twoDays.setDate(curDate.getDate() + 2);
  threeDays.setDate(curDate.getDate() + 3);

  const dayOfWeek = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thurday',
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


  return (
    <div className={ styles['date-field'] }>
      <label htmlFor="date">Date</label>
      <select id="date" defaultValue={0}>
        <option value="threeDays">{ threeDaysString }</option>
        <option value="twoDays">{ twoDaysString }</option>
      </select>
    </div>
  )
}