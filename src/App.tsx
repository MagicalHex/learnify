// src/App.tsx
import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'
import NavExplorer from './NavExplorer'


function App() {
const [count, setCount] = useState(0)


return (
<>
<div className="w-full min-h-screen">
  <div id="root" className="max-w-screen-xl mx-auto"> {/* or keep your existing #root styles */}
    {/* Your entire app goes here */}
    <NavExplorer />
  </div>
</div>
</>
)
}


export default App