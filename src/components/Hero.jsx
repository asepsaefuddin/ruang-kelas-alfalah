import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isCancelled = false
    const createParticle = () => {
      if (isCancelled) return
      const particle = document.createElement('div')
      particle.className = 'particle'
      const size = Math.random() * 6 + 2
      particle.style.width = size + 'px'
      particle.style.height = size + 'px'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.top = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 6 + 's'
      particle.style.animationDuration = (Math.random() * 4 + 4) + 's'
      container.appendChild(particle)
      setTimeout(() => particle.remove(), 8000)
    }

    const interval = setInterval(createParticle, 300)
    return () => {
      isCancelled = true
      clearInterval(interval)
      if (container) container.innerHTML = ''
    }
  }, [])

  return (
    <section id="home" className="hero-bg min-h-screen flex items-center justify-center relative">
      <div ref={containerRef} className="absolute inset-0"></div>
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          <span className="text-blue-500">Ruang</span> Kelas
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Platform pembelajaran digital yang modern, interaktif, dan efektif
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block">
            Mulai Sekarang
          </Link>
          <a href="#features" className="inline-block">
            <button className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Pelajari Lebih Lanjut
            </button>
          </a>
        </div>
      </div>
    </section>
  )
}

