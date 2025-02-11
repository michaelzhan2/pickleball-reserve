"use client"

import { dateOptions, timeOptions } from "@/utils/dateTime";
import { JSX } from "react";

export default function ScheduleForm(): JSX.Element {
  return (
    <form>
      <label htmlFor="username">Username</label>
      <input type="text" id="username" name="username" />
      <label htmlFor="password">Password</label>
      <input type="password" id="password" name="password" />
      <label htmlFor="date">Date</label>
      <select id="date" name="date">
        {dateOptions.map((date, idx) => (
          <option key={idx} value={idx}>
            {date.description}
          </option>
        ))}
      </select>
      <label htmlFor="startTime">Start Time</label>
      <select id="startTime" name="startTime">
        {timeOptions.map((time, idx) => (
          <option key={idx} value={idx}>
            {time}
          </option>
        ))}
      </select>
      <label htmlFor="endTime">End Time</label>
      <select id="endTime" name="endTime">
        {timeOptions.map((time, idx) => (
          <option key={idx} value={idx}>
            {time}
          </option>
        ))}
      </select>
      <label htmlFor="order">Court Order</label>
      <input type="text" id="order" name="order" defaultValue="1,2,3,4,5,6" />
    </form>
  )
}