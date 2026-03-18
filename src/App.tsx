import Home from './pages/home_impl'
import CursorFollower from './components/CursorFollower'

function App() {

  return (
    <div className='bg-background-light dark:bg-background-dark min-h-screen'>
      <CursorFollower />
      <Home />
    </div>
  )
}

export default App
