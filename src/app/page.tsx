'use client'


import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';
import { generateDateOptions, timeOptions, idToDescription } from '@/utils/dateTime'
import { PuppeteerInfo, LoginInfo } from '@/types/api'

import Loading from '@/components/loading';

const dateOptions: { date: number, month: number, year: number, description: string }[] = generateDateOptions();


export default function Home() {
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [orderString, setOrderString] = useState<string>('');
  
  async function loadIds() {
    const res: Response = await fetch('/api/schedule');
    if (!res.ok) {
      alert('Failed to load jobs');
      return;
    }
    const data: string[] = await res.json();
    setIds(data);
  }

  async function loadOrder() {
    const res: Response = await fetch('/api/courtOrder');
    if (!res.ok) {
      alert('Failed to load court order');
      return;
    }
    const data: string = await res.text();
    setOrderString(data);
  }

  useEffect(() => {
    loadIds();
    loadOrder();
  }, [])

  const handleOrderChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setOrderString((e.target as HTMLInputElement).value);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    setLoading(true);
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

    const orderUpdateRes:  Response = await fetch('/api/courtOrder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({order: orderString})
    })
    if (!orderUpdateRes.ok) {
      alert(`Failed to update court order with error code ${orderUpdateRes.status}`);
      setLoading(false);
      return;
    }
    
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
    const loginCheckData = await loginCheckRes.text();
    if (!loginCheckRes.ok) {
      alert(`[login] Login failed.\n${loginCheckData}`)
      setLoading(false);
      return;
    } else {
      console.log(`[login] Successful login for ${username}`);
    }
    
    // const puppeteerInfo: PuppeteerInfo = {
    //   username: username,
    //   encryptedPassword: encryptedPassword,
    //   date: date,
    //   month: month,
    //   year: year,
    //   startTime: startTime,
    //   endTime: endTime,
    //   courtOrder: courtOrder
    // }

    // const scheduleRes: Response = await fetch('/api/schedule', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(puppeteerInfo),
    //   cache: 'no-cache'
    // })
    // if (scheduleRes.status === 403) {
    //   alert(`Job already scheduled for ${dateOptions[dateIdx].description}`)
    //   setLoading(false);
    //   return;
    // } else if (!scheduleRes.ok) {
    //   alert(`Scheduling failed with error code ${scheduleRes.status}`);
    //   setLoading(false);
    //   return;
    // }

    // await loadIds();
    setLoading(false);
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
      alert(`Delete on job ${id} failed with error code ${deleteRes.status}`);
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
      <Loading loading={loading} />
      <div>
        <h1 className='text-3xl font-bold text-center mt-12 mb-8'>Court Scheduler</h1>
      </div>
      {!authenticated ? (
        <>
          <div className='w-screen flex justify-center items-center text-lg mt-36'>
            <form onSubmit={handleAuth} className='flex flex-col justify-center items-start'>
              <label htmlFor="authPassword" className='font-bold mb-1'>Enter password:</label>
              <input type="password" name="authPassword" placeholder="Password" className='border border-black shadow-md rounded-md px-3 py-2 mb-3' />
              <button type="submit" className='bg-green-600 shadow-md rounded-md px-3 py-2 text-white transition-transform hover:-translate-y-1'>Submit</button>
            </form>
          </div>
        </>
      ) : (
        <div className='w-screen flex justify-center items-center text-lg mb-3'>
          <div className='w-full md:w-5/6 flex flex-wrap justify-around'>
            <div className='w-5/6 md:w-1/4'>
              <form onSubmit={handleSubmit} className="flex flex-col">
                <label htmlFor="username" className='mb-1'>Username</label>
                <input type="text" name="username" id="username" autoComplete="username" placeholder="Username" className="border border-black shadow-md rounded-md px-3 py-2 mb-3" />
                <label htmlFor="password" className='mb-1'>Password</label>
                <input type="password" name="password" id="password" autoComplete='current-password' placeholder="Password" className="border border-black shadow-md rounded-md px-3 py-2 mb-3" />
                <label htmlFor="date" className='mb-1'>Date</label>
                <select name="date" className="border border-black shadow-md rounded-md px-3 py-2 mb-3">
                  {dateOptions.map((dateOption, idx) => (
                    <option key={idx} value={idx}>{dateOption.description}</option>
                  ))}
                </select>
                <label htmlFor="startTime" className='mb-1'>Start Time</label>
                <select name="startTime" defaultValue={23} className="border border-black shadow-md rounded-md px-3 py-2 mb-3">
                  {timeOptions.map((timeOption, idx) => (
                    <option key={idx} value={idx}>{timeOption}</option>
                  ))}
                </select>
                <label htmlFor="endTime" className='mb-1'>End Time</label>
                <select name="endTime" defaultValue={27} className="border border-black shadow-md rounded-md px-3 py-2 mb-3">
                  {timeOptions.map((timeOption, idx) => (
                    <option key={idx} value={idx}>{timeOption}</option>
                  ))}
                </select>
                <label htmlFor='courtOrder' className='mb-1'>Court Order</label>
                <input type='text' name='courtOrder' defaultValue={orderString} onChange={handleOrderChange} placeholder='Comma-separated order (e.g. 1,2,3)' className='border border-black shadow-md rounded-md px-3 py-2 mb-3'/>
                <button type="submit" className="w-2/3 m-auto bg-green-600 shadow-md rounded-md px-3 py-2 text-white transition-transform hover:-translate-y-1 mt-4">Submit</button>
              </form>
            </div>

            <hr className='block md:hidden h-px border border-gray-400 my-3 w-5/6'></hr>

            <div className='w-5/6 md:w-1/2'>
              <div className='text-center font-bold text-2xl mb-3'>
                Current jobs
              </div>
              <div>
                {ids.map((id, idx) => (
                  <div key={idx} className='flex flex-wrap justify-center md:justify-between items-center'>
                    <div className='mb-3'>
                      {idToDescription(id)}
                    </div>
                    <button type="button" onClick={deleteJob} name={id} className='bg-red-600 shadow-md rounded-md px-3 py-2 text-white transition-transform hover:-translate-y-1'>Cancel</button>
                    {idx !== ids.length - 1 && <hr className='w-full h-px border border-gray-400 my-3'></hr>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}