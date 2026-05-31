import Home from './pages/home_impl'
import CursorFollower from './components/CursorFollower'
import CookieBanner from './components/CookieBanner'

function App() {

  return (
    <div className='bg-background-light dark:bg-background-dark min-h-screen'>
      <CursorFollower />
      <Home />
      <CookieBanner />
    </div>
  )
}

export default App
