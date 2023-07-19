'use client'


import styles from './page.module.css'
import { useState, useEffect } from 'react'
import * as Math from 'mathjs'
import { startCron } from './utils/cron.js'


function generateDateOptions (curDate) {
  /*
  * Generates the date options for the date field
  * @param {Date} curDate - The current date
  * @return {Array} - An array of two strings representing the date options
  */
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

  const dayStrings = [];
  for (var i = 1; i <= 7; i++) {
    const day = new Date();
    day.setDate(curDate.getDate() + i);
    const dayString = `${dayOfWeek[day.getDay()]}, ${monthOfYear[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`;
    dayStrings.push(dayString);
  }
  return dayStrings;
}

function generateTimeOptions () {
  // Generate a list of time options in 30 minute intervals from 8:00 AM to 10:00 PM
  const timeOptions = [];
  
  var time = 8;

  while (time <= 21.5) {
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

function dateToCron(date) {
  const monthToNum = {
    'January': 0,
    'Febuary': 1,
    'March': 2,
    'April': 3,
    'May': 4,
    'June': 5,
    'July': 6,
    'August': 7,
    'September': 8,
    'October': 9,
    'November': 10,
    'December': 11
  }

  const dateList = date.split(' ');
  const month = monthToNum[dateList[1]];
  const day = parseInt(dateList[2].slice(0, -1));
  const year = parseInt(dateList[3]);

  // With month and day, create a variable that shows the day that came 2 days before
  const targetDate = new Date();
  targetDate.setMonth(month);
  targetDate.setDate(day);
  targetDate.setFullYear(year);
  
  const reserveDate = new Date();
  reserveDate.setDate(targetDate.getDate() - 2);

  const reserveMonth = reserveDate.getMonth();
  const reserveDay = reserveDate.getDate();
  
  return `0 0 6 ${reserveDay} ${reserveMonth} *`;
}


async function checkLogin (formData) {
  let loginCheckResponse = await fetch('/api/checkLogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  if (loginCheckResponse.status == 400) {
    alert('Invalid username or password');
  } else if (loginCheckResponse.status == 500) {
    alert('Internal server error');
  }
}


export default function Home() {
  /*
  * The main page component
  * @return {JSX} - The main page component
  */
  const dates = generateDateOptions(new Date());
  const timeOptions = generateTimeOptions();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    date: dates[2],
    startTimeIdxString: 22,
    endTimeIdxString: timeOptions.length - 1
  });
  const [cronJob, setCronJob] = useState(null);
  const [currentQueued, setCurrentQueued] = useState([]);
  useEffect(() => {
    fetch('/api/getData')
      .then((response) => response.json())
      .then((data) => setCurrentQueued(Object.keys(data)));
  });

  const activeJobs = {};

  // event handlers
  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (currentQueued.includes(formData.date)) {
      alert('You already have a reservation for this date');
      return;
    }
    await checkLogin(formData);
  
    const cronPattern = dateToCron(formData.date);
    console.log(cronPattern)
    const job = await startCron(formData, cronPattern);
    activeJobs[formData.date] = job;
  }


  return (
    <>
      <form onSubmit={ handleFormSubmit }>
        <div className={styles['login-field']}>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" placeholder="Username" onChange={ handleFormChange } required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Password" onChange={ handleFormChange } required/>
        </div>

        <div className={ styles['date-field'] }>
          <label htmlFor="date">Date</label>
          <select id="date" defaultValue={ dates[2] } onChange={ handleFormChange } required >
            { dates.map((date, idx) => <option value={ date } key={ idx }>{ date }</option>) }
          </select>
        </div>

        <div className={ styles['time-field'] }>
          <label htmlFor="startTimeIdxString">Start Time</label>
          <select id="startTimeIdxString" defaultValue={ 23 } onChange={ handleFormChange } required >
            { timeOptions.map((time, idx) => <option value={ idx } key={ idx }>{ time }</option>) }
          </select>
          <label htmlFor="endTimeIdxString">End Time</label>
          <select id="endTimeIdxString" defaultValue={ timeOptions.length - 1 } onChange={ handleFormChange } required >
            { timeOptions.map((time, idx) => <option value={ idx } key={ idx }>{ time }</option>) }
          </select>
        </div>

        <button type="submit">Submit</button>
      </form>
      <div className={ styles['current-jobs'] }>
        <h2>Current Jobs</h2>
        { currentQueued.map((job, idx) => (
            <div key={ idx }>
              <p>{ job }</p>
              { activeJobs[job] && <button type="button" onClick={ () => activeJobs[job].stop() }>Stop</button> }
            </div>
          )
        )}
      </div>
    </>
  )
}
