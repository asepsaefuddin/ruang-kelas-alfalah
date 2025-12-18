import React, { useRef, useState } from 'react'
import { soalService } from '../services/soalService'
import { Document, Packer, Paragraph, TextRun } from 'docx'

// Simple component to download a CSV template and upload soal file
export default function SoalImport({ token, onGenerated }) {
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [meta, setMeta] = useState({ kode: '', judul: '', durasi: 60, minimalNilai: 0 })

  function downloadTemplate() {
    // Define template headers and example row
    const headers = [
      'type', // e.g., multiple_choice, essay
      'question',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct_option',
      'points',
      'meta', // any json metadata
    ]

    const example = [
      'multiple_choice',
      'Apa warna langit pada siang hari?',
      'Merah',
      'Kuning',
      'Biru',
      'Hijau',
      'C',
      '1',
      '{"category":"umum"}',
    ]

    const csvRows = [headers.join(','), example.map(escapeCsv).join(',')]
    const csvContent = csvRows.join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_soal.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Generate a .docx template containing 40 multiple-choice and 5 essay questions
  async function downloadTemplateDocx() {
    const paragraphs = []
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: 'TEMPLATE SOAL (AUTO-GENERATED)', bold: true })] }))
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }))

    // Create 40 multiple-choice questions
    for (let i = 1; i <= 40; i++) {
      const id = i
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `[SOAL:${id}]`, bold: true })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Pertanyaan: Contoh soal pilihan ganda nomor ${i}.` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Tipe: pg` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `A: Pilihan A untuk soal ${i}` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `B: Pilihan B untuk soal ${i}` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `C: Pilihan C untuk soal ${i}` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `D: Pilihan D untuk soal ${i}` })] }))
      // mark correct option (use C as example)
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Jawaban: C` })] }))
      // Provide variables / variants fields optionally for user to edit later
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Variables:` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Variants: 1` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `[/SOAL]` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
    }

    // Create 5 essay questions
    for (let j = 1; j <= 5; j++) {
      const id = 40 + j
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `[SOAL:${id}]`, bold: true })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Pertanyaan: Contoh soal esai nomor ${j}. Jelaskan secara singkat.` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Tipe: essay` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Jawaban: Contoh jawaban esai untuk soal ${j}.` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Variants: 1` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: `[/SOAL]` })] }))
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
    }

    const doc = new Document({ sections: [{ children: paragraphs }] })

    const blob = await Packer.toBlob(doc, { creator: 'RuangKelas', description: 'Template Soal' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_soal.docx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function escapeCsv(value) {
    if (value === null || value === undefined) return ''
    const s = String(value)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    setMessage(null)
    setGeneratedQuestions([])
    setSelectedFile(file || null)
  }

  async function handleGenerate() {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Pilih file .docx terlebih dahulu' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // pass meta and request save=true so backend will create soal directly
      const res = await soalService.importSoals(token, selectedFile, meta, true)

      // Expect backend to return generated questions as `questions` or similar
      const questions = res.questions || res.data || res.generated || []
      setGeneratedQuestions(questions)

      // call optional callback to pass generated questions to parent (e.g. inject into form)
      try {
        if (typeof onGenerated === 'function') onGenerated(questions)
      } catch (e) {
        console.warn('onGenerated callback failed', e)
      }

      setMessage({ type: 'success', text: res.message || `Berhasil generate ${questions.length} soal` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal meng-generate soal' })
    } finally {
      setLoading(false)
      // clear input so same file can be selected again
      if (fileRef.current) fileRef.current.value = ''
      setSelectedFile(null)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Import Soal</h3>

      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={downloadTemplateDocx}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download Template Soal (.docx)
        </button>

        <label className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
          Pilih File (.docx)
          <input
            ref={fileRef}
            type="file"
            accept=".doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!selectedFile || loading}
          className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Generate Soal'}
        </button>
        {selectedFile && (
          <div className="ml-3 text-sm text-gray-700">Selected: {selectedFile.name}</div>
        )}
      </div>

      {/* <div className="mt-4 grid grid-cols-2 gap-3">
        <input
          className="p-2 border rounded"
          placeholder="Kode Ujian (optional)"
          value={meta.kode}
          onChange={e => setMeta(prev => ({ ...prev, kode: e.target.value }))}
        />
        <input
          className="p-2 border rounded"
          placeholder="Judul Ujian"
          value={meta.judul}
          onChange={e => setMeta(prev => ({ ...prev, judul: e.target.value }))}
        />
        <input
          className="p-2 border rounded"
          type="number"
          placeholder="Durasi (menit)"
          value={meta.durasi}
          onChange={e => setMeta(prev => ({ ...prev, durasi: Number(e.target.value) }))}
        />
        <input
          className="p-2 border rounded"
          type="number"
          placeholder="Minimal Nilai (KKM)"
          value={meta.minimalNilai}
          onChange={e => setMeta(prev => ({ ...prev, minimalNilai: Number(e.target.value) }))}
        />
      </div>

      {message && (
        <div className={`mt-3 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message.text}
        </div>
      )} */}

      {generatedQuestions && generatedQuestions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Hasil Generate ({generatedQuestions.length} soal)</h4>
          <div className="mt-2 space-y-3">
            {generatedQuestions.map((q, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="font-medium">{idx + 1}. {q.pertanyaan || q.soal || q.question}</div>
                {q.pilihan_a || q.option_a || q.choices ? (
                  <div className="mt-2">
                    <div>A. {q.pilihan_a || q.option_a || (q.choices && q.choices[0])}</div>
                    <div>B. {q.pilihan_b || q.option_b || (q.choices && q.choices[1])}</div>
                    <div>C. {q.pilihan_c || q.option_c || (q.choices && q.choices[2])}</div>
                    <div>D. {q.pilihan_d || q.option_d || (q.choices && q.choices[3])}</div>
                  </div>
                ) : null}
                {q.jawaban || q.correct_option || q.answer ? (
                  <div className="mt-2 text-sm text-green-700">Jawaban: {q.jawaban || q.correct_option || q.answer}</div>
                ) : null}
                {q.kunci_jawaban ? (
                  <div className="mt-2 text-sm text-green-700">Kunci Essay: {q.kunci_jawaban}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
