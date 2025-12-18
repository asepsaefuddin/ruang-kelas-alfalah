import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { examService } from '../services/examService';

const Ujian = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [examData, setExamData] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [showShortcutHelp, setShowShortcutHelp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    // Security Guards States
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [examBlocked, setExamBlocked] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();
    const { kode } = useParams(); // Mengambil kode dari URL
    const { token, user } = useAuth();

    // Calculate current question data
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];

    // Debug tracking untuk currentQ setiap kali berubah
    useEffect(() => {
        if (currentQ) {
            console.log('🔄 Current question changed:', {
                index: currentQuestion,
                nomor: currentQ.nomor,
                type: currentQ.type,
                hasGambarProperty: currentQ.hasOwnProperty('gambar'),
                gambarValue: currentQ.gambar,
                soalPreview: currentQ.soal.substring(0, 50) + '...',
                allProperties: Object.keys(currentQ)
            });
        }
    }, [currentQuestion, currentQ]);

    // Load exam data on component mount
    useEffect(() => {
        console.log('🚀 [Ujian] Component mounted, kode:', kode);
        console.log('🚀 [Ujian] User:', user);
        console.log('🚀 [Ujian] Token present:', !!token);
        
        // Jika tidak ada kode di URL, kembali ke halaman input kode
        if (!kode) {
            console.log('❌ [Ujian] No kode in URL, redirecting...');
            navigate('/kode-siswa');
            return;
        }
        
        loadExamData();
    }, [kode]);

    // Security Guard: Check if user already submitted this exam
    const loadExamData = async () => {
        console.log('📡 [Ujian] Starting loadExamData...');
        setLoading(true);
        setError('');
        setAlreadySubmitted(false);
        setExamBlocked(false);

        try {
            console.log('🔍 Loading exam data for code:', kode);
            const response = await examService.getUjianByKode(kode, token);
            
            console.log('✅ [Ujian] Exam data loaded:', response.data);
            console.log('✅ [Ujian] Full response:', response);
            
            // 🛡️ SECURITY GUARD 1: Check if user already submitted this exam
            if (response.data.hasOwnProperty('sudah_submit') && response.data.sudah_submit) {
                console.log('🚫 User already submitted this exam');
                setAlreadySubmitted(true);
                setSubmissionResult(response.data.hasil_ujian);
                setExamBlocked(true);
                setBlockReason('already_submitted');
                setShowResults(true);
                return;
            }

            // Rely on server response (`sudah_submit`) to indicate prior submission; no client-side local marks used.

            // 🛡️ SECURITY GUARD 2: Check if exam is still active/available
            if (response.data.hasOwnProperty('status') && response.data.status === 'inactive') {
                console.log('🚫 Exam is no longer active');
                setExamBlocked(true);
                setBlockReason('exam_inactive');
                setError('Ujian ini sudah tidak aktif atau telah berakhir');
                return;
            }

            // 🛡️ SECURITY GUARD 3: Check if user has permission to take this exam
            if (response.data.hasOwnProperty('has_permission') && !response.data.has_permission) {
                console.log('🚫 User does not have permission for this exam');
                setExamBlocked(true);
                setBlockReason('no_permission');
                setError('Anda tidak memiliki izin untuk mengikuti ujian ini');
                return;
            }

            // 🛡️ SECURITY GUARD 4: Check exam time window
            if (response.data.waktu_mulai && response.data.waktu_selesai) {
                const now = new Date();
                const startTime = new Date(response.data.waktu_mulai);
                const endTime = new Date(response.data.waktu_selesai);
                
                if (now < startTime) {
                    console.log('🚫 Exam has not started yet');
                    setExamBlocked(true);
                    setBlockReason('not_started');
                    setError(`Ujian belum dimulai. Mulai pada: ${startTime.toLocaleString()}`);
                    return;
                }
                
                if (now > endTime) {
                    console.log('🚫 Exam time has ended');
                    setExamBlocked(true);
                    setBlockReason('time_ended');
                    setError(`Waktu ujian telah berakhir pada: ${endTime.toLocaleString()}`);
                    return;
                }
            }

            // All security checks passed - proceed with exam
            setExamData(response.data);

            // DEBUG: tampilkan response mentah agar bisa cek apakah server mengirim field yang diharapkan
            console.log('🔬 Raw soal from server:', response.data.soal);

            // Normalisasi format soal dari server ke format yang dipakai komponen
            const serverSoal = response.data.soal || [];
            console.log('🔬 Raw server soal before normalization:', serverSoal.map(q => ({ 
                nomor: q.nomor, 
                type: q.type, 
                gambar: q.gambar,
                gambarExists: !!q.gambar,
                gambarTrimmed: q.gambar ? q.gambar.trim() : null
            })));
            
            const normalizedSoal = serverSoal.map((q, idx) => {
                // Filter gambar dengan validasi sangat ketat - HANYA ambil dari server yang benar-benar ada
                const hasValidImage = q.hasOwnProperty('gambar') && 
                                    q.gambar && 
                                    typeof q.gambar === 'string' &&
                                    q.gambar.trim() !== '' && 
                                    q.gambar !== 'null' && 
                                    q.gambar !== 'undefined';
                
                const normalizedQuestion = {
                    nomor: q.nomor ?? q.number ?? (idx + 1),
                    type: (q.type || q.tipe || '').toString().toLowerCase().includes('pilihan') || q.options || q.choices ? 'pilihan ganda' : (q.type || q.tipe || 'essay'),
                    soal: q.soal || q.question || q.text || '',
                    list_jawaban: q.list_jawaban || q.options || q.choices || [],
                    // KUNCI: Hanya set gambar jika server benar-benar mengirimkan field gambar dengan value valid
                    ...(hasValidImage ? { gambar: q.gambar } : {}),
                    // keep original payload for debugging if needed
                    __raw: q
                };
                
                console.log(`🔍 Question ${normalizedQuestion.nomor} normalized:`, {
                    type: normalizedQuestion.type,
                    hasServerGambar: q.hasOwnProperty('gambar'),
                    serverGambarValue: q.gambar,
                    hasValidImage: hasValidImage,
                    finalHasGambar: normalizedQuestion.hasOwnProperty('gambar'),
                    finalGambarValue: normalizedQuestion.gambar
                });
                
                return normalizedQuestion;
            });

            setQuestions(normalizedSoal);

            // Initialize answers object (use nomor-based mapping untuk backend)
            const initialAnswers = {};
            normalizedSoal.forEach((question, index) => {
                // Gunakan nomor soal sebagai key (backend expects nomor-based)
                initialAnswers[question.nomor] = '';
            });
            
            console.log('🔧 Initialized answers object:', initialAnswers);
            console.log('📋 Questions mapped:', normalizedSoal.map(q => ({ nomor: q.nomor, type: q.type, soal: q.soal.substring(0, 50) + '...' })));
            
            setAnswers(initialAnswers);
            
        } catch (error) {
            console.error('❌ [Ujian] Error loading exam data:', error);
            console.error('❌ [Ujian] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            setError('Waduh, gagal memuat data ujian. Coba muat ulang halaman atau periksa koneksi internet Anda.');
            setExamBlocked(true);
            setBlockReason('load_error');
        } finally {
            console.log('🏁 [Ujian] loadExamData finished, setting loading to false');
            setLoading(false);
        }
    };

    // Helper function to set a cookie
    const setCookie = (name, value, days) => {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    };

        // No client-side local marks: server answerResult history is authoritative

    // 🛡️ SECURITY GUARD 5: Prevent multiple submissions
    const finishExam = async () => {
        // Double check if already submitted
        if (alreadySubmitted || examBlocked) {
            alert('Ujian sudah pernah dikumpulkan sebelumnya!');
            return;
        }

        if (!window.confirm('Apakah Anda yakin ingin mengumpulkan ujian? Pastikan semua jawaban sudah benar. ANDA TIDAK DAPAT MENGERJAKAN UJIAN INI LAGI SETELAH DIKUMPULKAN!')) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            console.log('📤 Submitting answers for exam:', kode);
            
            // Debug current state
            console.log('🔍 Pre-submit debug:', {
                totalQuestions: questions.length,
                answersObject: answers,
                answersCount: Object.keys(answers).filter(key => answers[key] !== '').length,
                questionMapping: questions.map((q, idx) => ({
                    index: idx,
                    nomor: q.nomor,
                    type: q.type,
                    answered: answers[q.nomor] !== '',
                    answer: answers[q.nomor]
                }))
            });
            
            // Format answers for API
            const submissionData = {
                jawaban: answers,
                user_id: user.userId || user.id || user._id, // Try different user ID fields
            };

            console.log('📋 Submitting data:', submissionData);
            console.log('👤 User object:', user);
            console.log('📝 Current answers:', answers);

            const response = await examService.submitUjian(kode, submissionData, token);
            
            console.log('✅ Exam submitted successfully:', response.data);
            
            // Submission recorded server-side; no client-side localStorage/cookie needed

            setResult(response.data);
            setAlreadySubmitted(true);
            setExamBlocked(true);
            setBlockReason('just_submitted');
            setShowResults(true);
            
        } catch (error) {
            console.error('❌ Error submitting exam:', error);
            setError('Gagal mengumpulkan ujian. Mohon periksa koneksi internet Anda dan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    // 🛡️ SECURITY GUARD 6: Prevent page refresh/back button after submission
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (alreadySubmitted || examBlocked) {
                return; // Allow navigation if already submitted
            }
            
            const message = 'Anda akan keluar dari ujian. Apakah Anda yakin? Jawaban yang belum disimpan akan hilang.';
            e.returnValue = message;
            return message;
        };

        const handlePopState = (e) => {
            if (alreadySubmitted || examBlocked) {
                return; // Allow navigation if already submitted
            }
            
            if (!window.confirm('Anda akan keluar dari ujian. Apakah Anda yakin? Jawaban yang belum disimpan akan hilang.')) {
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        
        // Push initial state to prevent accidental back navigation
        window.history.pushState(null, '', window.location.pathname);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [alreadySubmitted, examBlocked]);

    // Keyboard shortcut handler with security check
    const handleKeyPress = useCallback((event) => {
        // 🛡️ Block keyboard shortcuts if exam is blocked
        if (examBlocked || alreadySubmitted) {
            return;
        }

        // Check if user is typing in textarea or input
        if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
            return;
        }

        const key = event.key;
        
        // Number keys 1-9, 0 for question 10
        if (key >= '1' && key <= '9') {
            const questionIndex = parseInt(key) - 1;
            if (questionIndex < questions.length) {
                setCurrentQuestion(questionIndex);
            }
        } else if (key === '0' && questions.length >= 10) {
            setCurrentQuestion(9); // Question 10
        }
        
        // Arrow keys for navigation
        else if (key === 'ArrowLeft' && currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (key === 'ArrowRight' && currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
        
        // Enter to finish exam if on last question
        else if (key === 'Enter' && currentQuestion === questions.length - 1) {
            finishExam();
        }
        
        // H key to toggle help
        else if (key === 'h' || key === 'H') {
            setShowShortcutHelp(!showShortcutHelp);
        }
        
        // Escape to go back to student page
        else if (key === 'Escape') {
            if (window.confirm('Apakah Anda yakin ingin keluar dari ujian?')) {
                navigate('/student');
            }
        }
    }, [currentQuestion, questions.length, showShortcutHelp, navigate, examBlocked, alreadySubmitted]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    // Navigation functions with security checks
    const selectOption = (index) => {
        if (examBlocked || alreadySubmitted) return;
        
        const currentQ = questions[currentQuestion];
        if (!currentQ) {
            console.error('❌ Current question is undefined!');
            return;
        }
        
        const nomorSoal = currentQ.nomor; // Gunakan nomor soal sebagai key
        
        console.log('🎯 Selecting option:', {
            questionIndex: currentQuestion,
            optionIndex: index,
            nomorSoal: nomorSoal,
            questionType: currentQ.type,
            hasGambar: currentQ.hasOwnProperty('gambar'),
            gambarValue: currentQ.gambar,
            currentQKeys: Object.keys(currentQ),
            selectedAnswer: currentQ.list_jawaban[index]
        });
        
        setAnswers({
            ...answers,
            [nomorSoal]: currentQ.list_jawaban[index]
        });
    };

    const saveEssayAnswer = (value) => {
        if (examBlocked || alreadySubmitted) return;
        
        const currentQ = questions[currentQuestion];
        const nomorSoal = currentQ.nomor; // Gunakan nomor soal sebagai key
        
        setAnswers({
            ...answers,
            [nomorSoal]: value
        });
    };

    const goToQuestion = (index) => {
        if (examBlocked || alreadySubmitted) return;
        setCurrentQuestion(index);
    };

    const nextQuestion = () => {
        if (examBlocked || alreadySubmitted) return;
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (examBlocked || alreadySubmitted) return;
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const backToStudent = () => {
        navigate('/student');
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Memuat soal ujian...</p>
                    <p className="text-gray-500 text-sm mt-2">Memverifikasi akses dan status ujian...</p>
                </div>
            </div>
        );
    }

    // 🛡️ BLOCKED STATE - Show when exam is blocked
    if (examBlocked && !showResults) {
        return (
            <div className="bg-gradient-to-br from-red-50 to-orange-100 min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">
                            {blockReason === 'already_submitted' ? '✅' : 
                             blockReason === 'exam_inactive' ? '⏰' :
                             blockReason === 'no_permission' ? '🚫' :
                             blockReason === 'not_started' ? '⏳' :
                             blockReason === 'time_ended' ? '⏰' : '⚠️'}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {blockReason === 'already_submitted' ? 'Ujian Sudah Dikerjakan' :
                             blockReason === 'exam_inactive' ? 'Ujian Tidak Aktif' :
                             blockReason === 'no_permission' ? 'Akses Ditolak' :
                             blockReason === 'not_started' ? 'Ujian Belum Dimulai' :
                             blockReason === 'time_ended' ? 'Waktu Ujian Berakhir' : 'Akses Ditolak'}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {blockReason === 'already_submitted' ? 
                                'Anda sudah pernah mengerjakan ujian ini sebelumnya. Setiap siswa hanya dapat mengerjakan ujian dengan kode yang sama satu kali.' :
                                error || 'Anda tidak dapat mengakses ujian ini saat ini.'}
                        </p>
                        <button
                            onClick={backToStudent}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !examData) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/kode-siswa')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Kembali ke Input Kode
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!loading && questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Soal</h2>
                    <p className="text-gray-600 mb-4">Ujian ini belum memiliki soal yang tersedia atau terjadi kesalahan saat memuat data.</p>
                    <button
                        onClick={() => navigate('/kode-siswa')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    // Debug render state
    console.log('🎭 [Ujian] Render state:', {
        loading,
        error,
        questionsLength: questions.length,
        examBlocked,
        alreadySubmitted,
        showResults,
        blockReason,
        examData: !!examData
    });

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header with Security Status */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        🎯 {examData?.judul || 'Ujian Online'}
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Kode: {kode} | Siswa: {user?.namaLengkap || user?.username}
                    </p>
                    
                    {/* Security Indicator */}
                    <div className="mt-2 flex justify-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🔒 Sesi Aman - Ujian Hanya Dapat Dikerjakan Sekali
                        </span>
                    </div>
                    
                    <div className="mt-4 bg-white rounded-full p-1 shadow-lg">
                        <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Soal <span>{currentQuestion + 1}</span> dari {questions.length}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Security Warning */}
                {!alreadySubmitted && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <div className="text-yellow-400 mr-3 mt-1">⚠️</div>
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-800">Peringatan Keamanan</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    • Ujian ini hanya dapat dikerjakan <strong>SATU KALI</strong> per siswa<br/>
                                    • Setelah dikumpulkan, Anda tidak dapat mengerjakan lagi<br/>
                                    • Jangan refresh halaman atau tutup browser saat mengerjakan<br/>
                                    • Pastikan koneksi internet stabil
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shortcut Info */}
                <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">
                            💡 <strong>Shortcut:</strong> Angka 1-{Math.min(questions.length, 10)} (pindah soal), 
                            ← → (navigasi), Enter (selesai), H (bantuan), Esc (keluar)
                        </p>
                        <button 
                            onClick={() => setShowShortcutHelp(!showShortcutHelp)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            disabled={examBlocked || alreadySubmitted}
                        >
                            {showShortcutHelp ? 'Tutup' : 'Bantuan'}
                        </button>
                    </div>
                    
                    {showShortcutHelp && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-sm text-blue-800 mb-2">Panduan Shortcut Keyboard:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                                <div><kbd className="bg-blue-200 px-1 rounded">1-9</kbd> Pindah ke soal 1-9</div>
                                <div><kbd className="bg-blue-200 px-1 rounded">0</kbd> Pindah ke soal 10</div>
                                <div><kbd className="bg-blue-200 px-1 rounded">←</kbd> Soal sebelumnya</div>
                                <div><kbd className="bg-blue-200 px-1 rounded">→</kbd> Soal selanjutnya</div>
                                <div><kbd className="bg-blue-200 px-1 rounded">Enter</kbd> Selesai ujian</div>
                                <div><kbd className="bg-blue-200 px-1 rounded">H</kbd> Toggle bantuan</div>
                                <div><kbd className="bg-blue-200 px-1 rounded">Esc</kbd> Keluar ujian</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Question Container */}
                <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 transition-all duration-300 hover:shadow-2xl ${
                    examBlocked || alreadySubmitted ? 'opacity-50 pointer-events-none' : ''
                }`}>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {(currentQ.type === 'pilihan ganda' || currentQ.type === 'pilihan ganda + image') ? '📝 Pilihan Ganda' : '✍️ Essay'}
                            </span>
                            <span className="text-gray-500 text-sm">Soal {currentQuestion + 1}</span>
                        </div>
                        
                        {/* Question Image - validasi ketat untuk mencegah gambar dari soal lain */}
                        {currentQ && currentQ.hasOwnProperty('gambar') && currentQ.gambar && currentQ.gambar.trim() !== '' && (
                            <div className="mb-4 text-center">
                                <img
                                    src={currentQ.gambar}
                                    alt="Gambar soal"
                                    className="max-w-full h-auto rounded-lg border border-gray-200 mx-auto"
                                    style={{ maxHeight: '300px' }}
                                    onError={(e) => {
                                        // Sembunyikan gambar jika gagal dimuat
                                        e.target.style.display = 'none';
                                        console.log('🚫 Image failed to load for question:', currentQ.nomor);
                                    }}
                                    onLoad={() => {
                                        console.log('✅ Image loaded successfully for question:', currentQ.nomor, 'URL:', currentQ.gambar);
                                    }}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Debug: Q{currentQ.nomor} - {currentQ.type} - Has Image: {currentQ.hasOwnProperty('gambar') ? 'Yes' : 'No'}
                                </div>
                            </div>
                        )}
                        
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                            {currentQ.soal}
                        </h2>
                    </div>

                    {/* Answer Options */}
                    {(currentQ.type === 'pilihan ganda' || currentQ.type === 'pilihan ganda + image') ? (
                        <div className="space-y-3">
                            {currentQ.list_jawaban?.map((option, index) => {
                                const nomorSoal = currentQ.nomor;
                                const isSelected = answers[nomorSoal] === option;
                                
                                console.log('🎯 Option render debug:', {
                                    questionIndex: currentQuestion,
                                    nomorSoal,
                                    option,
                                    currentAnswer: answers[nomorSoal],
                                    isSelected
                                });
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectOption(index)}
                                        disabled={examBlocked || alreadySubmitted}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-102 ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500' 
                                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                        } ${examBlocked || alreadySubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    >
                                        <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            <textarea 
                                placeholder="Tulis jawaban Anda di sini..."
                                className="w-full h-32 md:h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none transition-all duration-200"
                                value={answers[questions[currentQuestion]?.nomor] || ''}
                                onChange={(e) => saveEssayAnswer(e.target.value)}
                                disabled={examBlocked || alreadySubmitted}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                💡 Tip: Jelaskan jawaban Anda dengan detail | Karakter: {(answers[questions[currentQuestion]?.nomor] || '').length}
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    {/* Left: Keluar */}
                    <div>
                        <button 
                            onClick={backToStudent}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                        >
                            Keluar
                        </button>
                    </div>

                    {/* Center: small Prev, paginated numbers, small Next */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={prevQuestion}
                            disabled={currentQuestion === 0 || examBlocked || alreadySubmitted}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Soal sebelumnya"
                        >
                            ←
                        </button>

                        <div className="flex space-x-1">
                            {(() => {
                                const maxVisible = 10;
                                const total = questions.length;
                                if (total === 0) return null;

                                let start = 0;
                                if (total > maxVisible) {
                                    // center window around currentQuestion
                                    const half = Math.floor(maxVisible / 2);
                                    start = currentQuestion - half;
                                    if (start < 0) start = 0;
                                    if (start + maxVisible > total) start = total - maxVisible;
                                }
                                const end = Math.min(total, start + maxVisible);
                                const items = [];
                                for (let i = start; i < end; i++) {
                                    const nomor = questions[i]?.nomor;
                                    const isAnswered = answers.hasOwnProperty(nomor) && answers[nomor] !== '';
                                    items.push(
                                        <div
                                            key={i}
                                            onClick={() => goToQuestion(i)}
                                            className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center text-xs font-semibold ${
                                                examBlocked || alreadySubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                            } ${
                                                i === currentQuestion
                                                    ? 'bg-purple-500 text-white'
                                                    : isAnswered
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                            }`}
                                            title={`Soal ${i + 1}${isAnswered ? ' (Sudah dijawab)' : ''}`}
                                        >
                                            {i + 1}
                                        </div>
                                    );
                                }
                                // show leading/trailing indicators if hidden
                                if (start > 0) {
                                    items.unshift(
                                        <div key="start-ellipsis" className="w-8 h-8 flex items-center justify-center text-xs text-gray-600">..</div>
                                    );
                                }
                                if (end < total) {
                                    items.push(
                                        <div key="end-ellipsis" className="w-8 h-8 flex items-center justify-center text-xs text-gray-600">..</div>
                                    );
                                }

                                return items;
                            })()}
                        </div>

                        <button
                            onClick={nextQuestion}
                            disabled={currentQuestion === questions.length - 1 || examBlocked || alreadySubmitted}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Soal berikutnya"
                        >
                            →
                        </button>
                    </div>

                    {/* Right: main action (Next / Finish) */}
                    <div>
                        <button 
                            onClick={currentQuestion === questions.length - 1 ? finishExam : nextQuestion}
                            disabled={submitting || examBlocked || alreadySubmitted}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                    Mengirim...
                                </span>
                            ) : (
                                currentQuestion === questions.length - 1 ? 'Selesai 🎯' : 'Selanjutnya →'
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Modal with Security Notice */}
                {showResults && (result || submissionResult) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    {alreadySubmitted && blockReason === 'already_submitted' ? 'Hasil Ujian Anda' : 'Ujian Selesai!'}
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {alreadySubmitted && blockReason === 'already_submitted' ? 
                                        'Anda sudah pernah mengerjakan ujian ini sebelumnya.' : 
                                        'Terima kasih telah mengikuti ujian ini.'}
                                </p>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <div className="text-blue-500 mr-3">🔒</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-800">Keamanan Ujian</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Ujian ini telah diselesaikan dan tidak dapat dikerjakan lagi. 
                                            Sistem telah mencatat submission Anda secara permanen.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Score Display */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {(result?.nilai || submissionResult?.nilai) || 0}
                                    </div>
                                    <div className="text-lg text-gray-700 mb-4">
                                        dari 100 poin
                                    </div>
                                    <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                                        ((result?.nilai || submissionResult?.nilai) || 0) >= ((result?.minimalNilai || submissionResult?.minimalNilai) || 70) ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {((result?.nilai || submissionResult?.nilai) || 0) >= ((result?.minimalNilai || submissionResult?.minimalNilai) || 70) ? '✅ LULUS' : '❌ TIDAK LULUS'}
                                    </div>
                                </div>
                            </div>

                            {/* AI Feedback */}
                            {(result?.keterangan?.saran || submissionResult?.keterangan?.saran) && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white text-sm font-bold">✨</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">AI Feedback dari Gemini</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {result?.keterangan?.saran || submissionResult?.keterangan?.saran}
                                    </p>
                                    {questions.some(q => q.type === 'essay') && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                            <p className="text-sm text-blue-700">
                                                💡 <strong>Catatan:</strong> Penilaian soal essay dilakukan otomatis oleh AI Gemini 
                                                berdasarkan kesesuaian jawaban dengan kunci jawaban yang telah ditentukan.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Exam Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Ujian:</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Kode Ujian:</span>
                                        <span className="font-medium ml-2">{kode}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Judul:</span>
                                        <span className="font-medium ml-2">{examData?.judul}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Soal:</span>
                                        <span className="font-medium ml-2">{questions.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium ml-2 text-green-600">✅ Sudah Dikumpulkan</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button 
                                    onClick={backToStudent}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                >
                                    Kembali ke Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ujian;