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
<NavExplorer />
</>
)
}


export default App