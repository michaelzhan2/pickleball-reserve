'use client'


import Image from 'next/image'
import styles from './page.module.css'
import Button from 'app/Button'
import Login from 'app/Login'
import { useState } from 'react'


export default function Home() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  return (
    <div>
      <Login updateUsername={setUser} updatePassword={setPass} />
      <Button username={user} password={pass} />
    </div>
  )
}
