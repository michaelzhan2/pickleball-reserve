'use client'


export default function Button({ username, password }) {
  function handleClick() {
    console.log({ username, password });
  }
  // async function handleClick() {
  //   const res = await fetch('/api/puppeteer', { method: 'GET' })
  //   const text = await res.text()
  //   console.log(text)
  //   console.log('button clicked')
  // }
  return (
    <div>
      <button type="button" onClick={handleClick}>
        Click me
      </button>
    </div>
  )
}