import { useState } from 'react'

import './App.css'
import WeatherDashboard  from './pages/dashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <WeatherDashboard/>
    </>
  )
}

export default App
