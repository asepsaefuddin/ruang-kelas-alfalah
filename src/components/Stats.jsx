import { useEffect, useRef } from 'react'

function useCountUp(target, duration = 2000) {
  const ref = useRef(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let start = 0
    const step = Math.max(1, Math.floor(target / (duration / 16)))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        start = target
        clearInterval(timer)
      }
      element.textContent = start.toLocaleString()
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return ref
}

export default function Stats() {
  const usersRef = useCountUp(15420)
  const schoolsRef = useCountUp(342)
  const questionsRef = useCountUp(89650)
  const examsRef = useCountUp(23780)

  return (
    <section id="stats" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Statistik Platform</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Angka yang menunjukkan kepercayaan dan pencapaian platform kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div ref={usersRef} className="text-5xl font-bold text-blue-500 mb-2">0</div>
            <div className="text-xl text-gray-300">Pengguna Aktif</div>
          </div>
          <div className="text-center">
            <div ref={schoolsRef} className="text-5xl font-bold text-green-500 mb-2">0</div>
            <div className="text-xl text-gray-300">Sekolah Terdaftar</div>
          </div>
          <div className="text-center">
            <div ref={questionsRef} className="text-5xl font-bold text-purple-500 mb-2">0</div>
            <div className="text-xl text-gray-300">Soal Dibuat</div>
          </div>
          <div className="text-center">
            <div ref={examsRef} className="text-5xl font-bold text-orange-500 mb-2">0</div>
            <div className="text-xl text-gray-300">Ujian Selesai</div>
          </div>
        </div>
      </div>
    </section>
  )
}

