import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }){
  return (
    <div className="relative min-h-screen bg-background-dark font-sans selection:bg-brand-neonGreen selection:text-black">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}
