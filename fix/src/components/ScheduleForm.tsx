"use client"

import { dateOptions, timeOptions } from "@/utils/dateTime";
import { JSX } from "react";

export default function ScheduleForm(): JSX.Element {
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const username = target.username.value;
    const password = target.password.value;

    const response = await fetch("/api/checkLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      alert("Failed to login");
      return;
    }

    // TODO: submit to scheduling
  }

  return (
    <form onSubmit={onSubmit}>
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
      <button type="submit">Submit</button>
    </form>
  )
}