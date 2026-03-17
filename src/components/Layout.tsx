import Header from './Header'
import Footer from './Footer'
import BlobBackground from './BlobBackground'

export default function Layout({ children }: { children: React.ReactNode }){
  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <BlobBackground />
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
