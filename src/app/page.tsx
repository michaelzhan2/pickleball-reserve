'use client'


import { generateDateOptions, generateTimeOptions } from '@/utils/dateTime'


const dateOptions = generateDateOptions();
const timeOptions = generateTimeOptions();


export default function Home() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log((e.target as HTMLFormElement).date.value)
    console.log((e.target as HTMLFormElement).startTime.value)
  }

  return (
    <div className="m-auto w-80">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="username">Username</label>
        <input type="text" name="username" placeholder="Username" className="border border-black" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" placeholder="Password" className="border border-black" />
        <label htmlFor="date">Date</label>
        <select name="date" className="border border-black">
          {dateOptions.map((dateOption, idx) => (
            <option key={idx} value={idx}>{dateOption}</option>
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
  )
}