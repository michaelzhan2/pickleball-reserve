'use client'


import CryptoJS from 'crypto-js';
import { generateDateOptions, generateTimeOptions } from '@/utils/dateTime'
import { PuppeteerInfo, LoginInfo } from '@/types/api'


const dateOptions = generateDateOptions();
const timeOptions = generateTimeOptions();


export default function Home() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log((e.target as HTMLFormElement).date.value)
    console.log((e.target as HTMLFormElement).startTime.value)
  }

  const handleTest = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let username: string = process.env.NEXT_PUBLIC_USERNAME || '';
    let password: string = process.env.NEXT_PUBLIC_PASSWORD || '';
    let date = dateOptions[0].date;
    let month = dateOptions[0].month;
    let year = dateOptions[0].year;
    let startTime = timeOptions[23];
    let endTime = timeOptions[27];
    let encryptedPassword: string = CryptoJS.AES.encrypt(password, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString();
    const puppeteerInfo: PuppeteerInfo = {
      username: username,
      encryptedPassword: encryptedPassword,
      date: date,
      month: month,
      year: year,
      startTime: startTime,
      endTime: endTime
    }

    const loginInfo: LoginInfo = {
      username: username,
      encryptedPassword: encryptedPassword
    }


    fetch('/api/puppeteer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(puppeteerInfo)
    })

    const loginCheck = await fetch('/api/checkLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginInfo)
    })
    
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
        <button type="button" onClick={handleTest} className='border border-black bg-blue-200'>Test</button>
      </div>
      <div>
        <div>
          Current jobs
        </div>
        <div>

        </div>
      </div>
    </>
  )
}