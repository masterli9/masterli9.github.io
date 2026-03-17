export default function BlobBackground(){
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-20 blur-3xl transform rotate-12"></div>
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400 opacity-10 blur-3xl transform -rotate-6"></div>
    </div>
  )
}
