export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dilengkapi teknologi untuk mendukung proses pembelajaran yang optimal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="feature-card bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi User</h3>
            <p className="text-gray-600">Akses simultan untuk guru, siswa, dan admin dengan manajemen pengguna aman.</p>
          </div>

          <div className="feature-card bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Membuat Soal</h3>
            <p className="text-gray-600">Pembuat soal intuitif: pilihan ganda, isian, dan esai.</p>
          </div>

          <div className="feature-card bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Mengerjakan Soal</h3>
            <p className="text-gray-600">UI ramah siswa dengan autosave dan timer.</p>
          </div>

          <div className="feature-card bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Agen Cerdas</h3>
            <p className="text-gray-600">Cek jawaban esai otomatis dengan umpan balik.</p>
          </div>

          <div className="feature-card bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Laporan Penilaian</h3>
            <p className="text-gray-600">Pelaporan komprehensif performa siswa dan progres.</p>
          </div>

          <div className="feature-card bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Statistik Aplikasi</h3>
            <p className="text-gray-600">Analitik penggunaan real-time dan performa sistem.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

