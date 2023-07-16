'use client'

import styles from './page.module.css'



export default function Login({ updateUsername, updatePassword }) {
  const handleUpdateUsername = (e) => {
    updateUsername(e.target.value)
  };

  const handleUpdatePassword = (e) => {
    updatePassword(e.target.value)
  };

  return (
    <div className={styles['login-field']}>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" placeholder="Username" onChange={handleUpdateUsername}/>
      <label htmlFor="password">Password</label>
      <input id="password" type="password" placeholder="Password" onChange={handleUpdatePassword} />
    </div>
  )
}