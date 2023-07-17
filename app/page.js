'use client'


import Image from 'next/image'
import styles from './page.module.css'
import Button from 'app/Button'
import Login from 'app/Login'
import DatePick from 'app/DatePick'
import { useState } from 'react'


function handleSubmit (e) {
  
  console.log('form submitted')
}


export default function Home() {
  

  return (
    <form onSubmit={ handleSubmit }>
      <Login />
      <DatePick />
      <Button />
    </form>
  )
}
