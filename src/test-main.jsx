import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>React is Working!</h1>
      <p>If you see this, React is running correctly.</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TestApp />
  </StrictMode>
)