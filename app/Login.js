'use client'


export default function Login({ updateUsername, updatePassword }) {
  const handleUpdateUsername = (e) => {
    updateUsername(e.target.value)
  };

  const handleUpdatePassword = (e) => {
    updatePassword(e.target.value)
  };

  return (
    <div>
      <input type="test" placeholder="username" onChange={handleUpdateUsername}/>
      <input type="password" placeholder="password" onChange={handleUpdatePassword} />
    </div>
  )
}