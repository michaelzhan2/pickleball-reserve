'use client'


import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';
import { generateDateOptions, timeOptions } from '@/utils/dateTime'
import { PuppeteerInfo, LoginInfo } from '@/types/api'


const dateOptions = generateDateOptions();




export default function Home() {
  const [ids, setIds] = useState<string[]>([]);
  
  async function loadIds() {
    const res = await fetch('/api/schedule');
    const data = await res.json();
    setIds(data);
  }

  useEffect(() => {
    loadIds();
  }, [])


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let username = (e.target as HTMLFormElement).username.value;
    let password = (e.target as HTMLFormElement).password.value;
    let dateIdx = (e.target as HTMLFormElement).date.value;
    let date = dateOptions[dateIdx].date;
    let month = dateOptions[dateIdx].month;
    let year = dateOptions[dateIdx].year;
    let startTime: number = parseFloat((e.target as HTMLFormElement).startTime.value);
    let endTime: number = parseFloat((e.target as HTMLFormElement).endTime.value);
    let courtOrder = [3, 4, 1, 6, 2, 5];
    let encryptedPassword: string = CryptoJS.AES.encrypt(password, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString();
    
    const loginInfo: LoginInfo = {
      username: username,
      encryptedPassword: encryptedPassword
    }

    const loginCheck = await fetch('/api/checkLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginInfo)
    })
    if (!loginCheck.ok) {
      alert('Login failed')
      return;
    } else {
      console.log(`Login successful for ${username}`)
    }
    
    const puppeteerInfo: PuppeteerInfo = {
      username: username,
      encryptedPassword: encryptedPassword,
      date: date,
      month: month,
      year: year,
      startTime: startTime,
      endTime: endTime,
      courtOrder: courtOrder
    }

    const scheduleRes = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(puppeteerInfo),
      cache: 'no-cache'
    })
    if (!scheduleRes.ok) {
      alert('Scheduling failed');
      return;
    }

    await loadIds();
  }

  return (
    <>
      <div className="m-auto w-80">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="username">Username</label>
          <input type="text" name="username" placeholder="Username" className="border border-black" />
          <label htmlFor="password">Password</label>
          <input type="password" name="password" placeholder="Password" className="border border-black" />
          <label htmlFor="date">Date</label>
          <select name="date" className="border border-black">
            {dateOptions.map((dateOption, idx) => (
              <option key={idx} value={idx}>{dateOption.description}</option>
            ))}
          </select>
          <label htmlFor="startTime">Start Time</label>
          <select name="startTime" defaultValue={23} className="border border-black">
            {timeOptions.map((timeOption, idx) => (
              <option key={idx} value={idx}>{timeOption}</option>
            ))}
          </select>
          <label htmlFor="endTime">End Time</label>
          <select name="endTime" defaultValue={27} className="border border-black">
            {timeOptions.map((timeOption, idx) => (
              <option key={idx} value={idx}>{timeOption}</option>
            ))}
          </select>
          <button type="submit" className="border border-black bg-green-300">Submit</button>
        </form>
      </div>
      <div>
        <button type="button" className='border border-black bg-blue-200'>Test</button>
      </div>
      <div>
        <div>
          Current jobs
        </div>
        <div>
          {ids.map((id, idx) => (
            <div key={idx}>
              {id}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}