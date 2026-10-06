import { MotionConfig } from 'framer-motion'
import Home from './pages/home_impl'
import CursorFollower from './components/CursorFollower'
import CookieBanner from './components/CookieBanner'

function App() {
  return (
    <MotionConfig reducedMotion="user"><div className="min-h-screen bg-ink text-soft-white relative">
      <CursorFollower />
      <Home />
      <CookieBanner />
    </div></MotionConfig>
  )
}

export default App
