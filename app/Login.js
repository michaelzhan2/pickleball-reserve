'use client'

import styles from './page.module.css'



export default function Login() {
  return (
    <div className={styles['login-field']}>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" placeholder="Username" />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" placeholder="Password" />
    </div>
  )
}