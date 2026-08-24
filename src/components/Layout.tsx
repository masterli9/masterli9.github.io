import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }){
  return (
    <div className="relative min-h-screen bg-ink font-sans text-soft-white selection:bg-signal-pink selection:text-ink">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}
