'use client'


export default function Button() {
  async function handleClick() {
    const res = await fetch('/api/puppeteer', { method: 'GET' })
    const text = await res.text()
    console.log(text)
    console.log('button clicked')
  }
  return (
    <div>
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}