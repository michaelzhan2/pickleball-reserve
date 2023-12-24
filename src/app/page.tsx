'use client'


import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';
import { generateDateOptions, timeOptions, idToDescription } from '@/utils/dateTime'
import { PuppeteerInfo, LoginInfo } from '@/types/api'


const dateOptions: { date: number, month: number, year: number, description: string }[] = generateDateOptions();


export default function Home() {
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  
  async function loadIds() {
    const res: Response = await fetch('/api/schedule');
    const data: string[] = await res.json();
    setIds(data);
  }

  useEffect(() => {
    loadIds();
  }, [])


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    let username: string = (e.target as HTMLFormElement).username.value;
    let password: string = (e.target as HTMLFormElement).password.value;
    let dateIdx: number = parseFloat((e.target as HTMLFormElement).date.value);
    let date: number = dateOptions[dateIdx].date;
    let month: number = dateOptions[dateIdx].month;
    let year: number = dateOptions[dateIdx].year;
    let startTime: number = parseFloat((e.target as HTMLFormElement).startTime.value);
    let endTime: number = parseFloat((e.target as HTMLFormElement).endTime.value);
    let courtOrder: number[] = (e.target as HTMLFormElement).courtOrder.value.split(',').map((court: string) => parseFloat(court));
    let encryptedPassword: string = CryptoJS.AES.encrypt(password, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString();
    
    const loginInfo: LoginInfo = {
      username: username,
      encryptedPassword: encryptedPassword
    }

    const loginCheckRes: Response = await fetch('/api/checkLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginInfo)
    })
    if (!loginCheckRes.ok) {
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

    const scheduleRes: Response = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(puppeteerInfo),
      cache: 'no-cache'
    })
    if (scheduleRes.status === 403) {
      alert(`Job already scheduled for ${dateOptions[dateIdx].description}`)
      return;
    } else if (!scheduleRes.ok) {
      alert('Scheduling failed');
      return;
    }

    await loadIds();
  }

  const deleteJob = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    let id: string = (e.currentTarget as HTMLButtonElement).name;
    const deleteRes: Response = await fetch(`/api/schedule/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id })
    })
    if (!deleteRes.ok) {
      alert('Delete failed');
      return;
    }
    await loadIds();
  }

  function handleAuth(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if ((e.target as HTMLFormElement).authPassword.value === process.env.NEXT_PUBLIC_WEBSITE_PASSWORD) {
      setAuthenticated(true);
    }
  }


  return (
    <>
      {!authenticated ? (
        <>
          <div className='h-screen w-screen flex justify-center items-center text-lg'>
            <form onSubmit={handleAuth} className='flex flex-col justify-center items-start'>
              <label htmlFor="authPassword" className='font-bold mb-1'>Enter password:</label>
              <input type="password" name="authPassword" placeholder="Password" className='border border-black shadow-md rounded-md px-3 py-2 mb-3' />
              <button type="submit" className='bg-green-600 shadow-md rounded-md px-3 py-2 text-white transition-transform hover:-translate-y-1'>Submit</button>
            </form>
          </div>
        </>
      ) : (
        <div className='w-screen flex flex-wrap justify-center items-center'>
          <div>
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
              <label htmlFor='courtOrder'>Court Order</label>
              <input type='text' name='courtOrder' defaultValue={'6,4,3,1,5,2'} placeholder='Comma-separated order (e.g. 1,2,3)' className='border border-black'/>
              <button type="submit" className="border border-black bg-green-300">Submit</button>
            </form>
          </div>

          <hr className='block md:hidden h-px border border-gray-400 my-3 w-5/6'></hr>

          <div>
            <div>
              Current jobs
            </div>
            <div>
              {ids.map((id, idx) => (
                <div key={idx}>
                  {idToDescription(id)}
                  <button type="button" onClick={deleteJob} name={id} className='border border-black bg-red-200'>Cancel</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}