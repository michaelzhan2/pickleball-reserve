'use client'

import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './page.module.css'
import { useState, useEffect } from 'react'
import * as Math from 'mathjs'
import { Container, Row, Col, Button, Form, Spinner, Card } from 'react-bootstrap'

// Form option generate functions
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
  for (var i = 3; i <= 9; i++) {
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


// Cron pattern generation function
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
  
  return `15 0 6 ${reserveDate.getDate()} ${reserveDate.getMonth()} *`;
}


async function checkLogin (formData) {
  let loginCheckResponse = await fetch('/api/checkLogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  if (loginCheckResponse.status == 200) {
    return true;
  } else if (loginCheckResponse.status == 400) {
    alert('Invalid username or password');
  } else if (loginCheckResponse.status == 500) {
    alert('Internal server error');
  } 
  return false;
}


function formatCurrentJob (name, start, end, allTimes) {
  return `${name} from ${allTimes[start]} to ${allTimes[end]}`
}


function convertCurrentJobs (data) {
  const jobNames = Object.keys(data);
  const jobStarts = jobNames.map(jobName => parseInt(data[jobName].startIdx));
  const jobEnds = jobNames.map(jobName => parseInt(data[jobName].endIdx));
  const newJobs = jobNames.map((jobName, idx) => formatCurrentJob(jobName, jobStarts[idx], jobEnds[idx], timeOptions));
  return newJobs;
}

const dates = generateDateOptions(new Date());
const timeOptions = generateTimeOptions();

export default function Home() {
  /*
  * The main page component
  * @return {JSX} - The main page component
  */
  const [currentJobs, setCurrentJobs] = useState([]);
  const [currentJobNames, setCurrentJobNames] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    date: dates[0],
    startTimeIdxString: 23,
    endTimeIdxString: timeOptions.length - 1
  });
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  // Data routes
  async function getData () {
    setLoading(true);
    const response = await fetch('/api/schedule', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setCurrentJobs(convertCurrentJobs(data));
    setCurrentJobNames(Object.keys(data));
    setLoading(false);
  }

  async function addData (formData, cronPattern) {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ formData: formData, pattern: cronPattern })
    });
    const data = await response.json();
    setCurrentJobs(convertCurrentJobs(data));
    setCurrentJobNames(Object.keys(data));
  }

  async function removeData (job) {
    const response = await fetch('/api/schedule', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ job: job })
    });
    const data = await response.json();
    setCurrentJobs(convertCurrentJobs(data));
    setCurrentJobNames(Object.keys(data));
  }


  // Event handlers
  function handleFormChange (e) {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  }

  async function handleFormSubmit (e) {
    setLoading(true);
    e.preventDefault();
    if (currentJobs.includes(formData.date)) {
      alert('You already have a reservation for this date');
      return;
    }
    const loginCheckResult = await checkLogin(formData);
    if (!loginCheckResult) {
      setLoading(false);
      return;
    }

    const cronPattern = dateToCron(formData.date);
    await addData(formData, cronPattern);
    setLoading(false);
  }

  function handlePassword (e) {
    e.preventDefault();
    if (authPassword === process.env.NEXT_PUBLIC_PASSWORDAUTH) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  }

  // Load data on startup
  useEffect(() => {
    getData();
  }, []);


  return (
    <>
      { !authenticated && (
        <Container className='d-flex flex-column justify-content-center align-items-center vh-100'>
          <Form onSubmit={ handlePassword }>
            <Form.Group controlId='authPassword' className='mb-3'>
              <Form.Label>Enter password:</Form.Label>
              <Form.Control type='password' placeholder='Password' name='password' onChange={ (e) => setAuthPassword(e.target.value) }/>
              <Form.Text muted>
                Please enter the password to access the reservation page
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">Submit</Button>
          </Form>
        </Container>
      )}
      { authenticated && (
        <>
          { loading && (
            <>
              <Container fluid style={{zIndex: 9999}} className='d-flex flex-column justify-content-center align-items-center vh-100 bg-black opacity-50 position-absolute top-0 start-0'>
                <Spinner animation="border" variant='light' />
              </Container>
            </>
          )}
          
          <Container fluid className={`d-flex flex-column text-center justify-content-end mt-4 ${styles['header']}`}>
            <h1 className='text-center' style={{maxWidth: '100%', overflow: 'visible'}}>Schedule a Reservation</h1>
          </Container>



          <Container fluid className='d-flex flex-column justify-content-start'>
            <hr className='d-md-none' />
            <Row className='d-flex justify-content-center'>
              <Col sm={12} md={4} lg={3} className={`d-flex align-items-center justify-content-center mb-3 ${styles['thin-border']}`}>
                <Form onSubmit={ handleFormSubmit } className='my-3'>
                  <Form.Group controlId="username" className='mb-3'>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Username" onChange={ handleFormChange } required />
                  </Form.Group>

                  <Form.Group controlId="password" className='mb-3'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={ handleFormChange } required />
                  </Form.Group>

                  <Form.Group controlId="date" className='mb-3'>
                    <Form.Label>Date</Form.Label>
                    <Form.Select defaultValue={ dates[0] } onChange={ handleFormChange } required >
                      { dates.map((date, idx) => <option value={ date } key={ idx }>{ date }</option>) }
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="startTimeIdxString" className='mb-3'>
                    <Form.Label>Start Time</Form.Label>
                    <Form.Select defaultValue={ 23 } onChange={ handleFormChange } required >
                      { timeOptions.map((time, idx) => <option value={ idx } key={ idx }>{ time }</option>) }
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="endTimeIdxString" className='mb-3'>
                    <Form.Label>End Time</Form.Label>
                    <Form.Select defaultValue={ timeOptions.length - 1 } onChange={ handleFormChange } required >
                      { timeOptions.map((time, idx) => <option value={ idx } key={ idx }>{ time }</option>) }
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" type="submit">Submit</Button>
                </Form>
              </Col>
              <hr className='d-md-none' />
              <Col sm={12} md={6} lg={5} className={`position-relative d-flex flex-column align-items-center mb-3 mx-3 ${styles['thin-border']}`}>
                <h2>Current Jobs</h2>
                <Container className='position-relative d-flex flex-column align-items-center my-3'>
                  { currentJobs.length === 0 && (
                    <h3 style={{color: 'lightgray', width: '100%', height: '100%'}} className='position-absolute top-50 start-50 translate-middle text-center'>No current jobs</h3>
                  )}
                  
                  { currentJobs.map((job, i) => (
                    <Container key={ i } className='d-flex justify-content-between mx-0'>
                      <Col xs={8} className='text-start'>
                        <span>{ job }</span>
                      </Col>
                      <Col xs={3} className='text-end'>
                        <Button variant='danger' onClick={ () => removeData(currentJobNames[i]) }>Remove</Button>
                      </Col>
                    </Container>
                  ))}
                </Container>
              </Col>
            </Row>
          </Container>
        </>
      )}
    </>
  )
}
