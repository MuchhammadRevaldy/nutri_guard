import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Scan, Upload, Camera, X, AlertTriangle, CheckCircle, Edit2, FlipHorizontal } from 'lucide-react';
import Modal from '@/Components/Modal';
import FadeUp from '@/Components/FadeUp';

// ── CSS keyframes untuk animasi scan ─────────────────────────────────────────
const SCAN_CSS = `
  @keyframes scan-beam {
    0%   { top: 0%;    opacity: 1; }
    90%  { top: 96%;   opacity: 1; }
    100% { top: 96%;   opacity: 0; }
  }
  @keyframes corner-glow {
    0%,100% { opacity: 0.6; box-shadow: 0 0 6px #10b981; }
    50%      { opacity: 1;   box-shadow: 0 0 14px #10b981, 0 0 24px #10b981; }
  }
  @keyframes particle-rise {
    0%   { transform: translateY(0)  scale(1);   opacity: 0.9; }
    100% { transform: translateY(-60px) scale(0); opacity: 0;   }
  }
  @keyframes eq-bar {
    0%,100% { transform: scaleY(0.25); }
    50%     { transform: scaleY(1);    }
  }
  @keyframes scan-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scan-fade-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.9); opacity: 0.7; }
    100% { transform: scale(1.6); opacity: 0;   }
  }
`;

// Partikel kecil yang melayang di sekitar scanner
const PARTICLES = [
  { left: '20%', top: '30%', delay: '0s',    size: 4 },
  { left: '75%', top: '25%', delay: '0.4s',  size: 3 },
  { left: '50%', top: '70%', delay: '0.8s',  size: 5 },
  { left: '15%', top: '60%', delay: '1.2s',  size: 3 },
  { left: '80%', top: '65%', delay: '0.6s',  size: 4 },
  { left: '35%', top: '15%', delay: '1.5s',  size: 3 },
];

// Status messages yang bergantian
const SCAN_STATUSES = [
    'Mengidentifikasi makanan...',
    'Menganalisis kandungan nutrisi...',
    'Menghitung kalori & makro...',
    'Memproses data protein...',
    'Menyiapkan hasil analisis...',
];

// ── Scanning Overlay — rendered via Portal to document.body ──────────────────
// Menggunakan Portal agar tidak terpengaruh overflow/transform parent manapun.
// Visual blocking sudah cukup — tidak perlu intercept events.
function ScanningOverlay() {
    const [statusIdx, setStatusIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setStatusIdx(i => (i + 1) % SCAN_STATUSES.length), 1800);
        return () => clearInterval(t);
    }, []);

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
                background: 'rgba(3, 7, 18, 0.97)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: SCAN_CSS }} />

            <div className="flex flex-col items-center gap-8 px-6 select-none">

                {/* ── Scanner box ── */}
                <div className="relative w-56 h-56">

                    {/* Pulse ring behind scanner */}
                    <div className="absolute inset-0 rounded-xl border border-emerald-500/30"
                        style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
                    <div className="absolute inset-0 rounded-xl border border-emerald-500/20"
                        style={{ animation: 'pulse-ring 2s ease-out 1s infinite' }} />

                    {/* Scanner frame */}
                    <div className="absolute inset-0 rounded-xl border border-emerald-500/20 bg-emerald-500/3 overflow-hidden">

                        {/* Scan beam — horizontal line sweeping top to bottom */}
                        <div
                            className="absolute left-0 right-0 h-px"
                            style={{
                                background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)',
                                boxShadow: '0 0 8px 2px rgba(16,185,129,0.6)',
                                animation: 'scan-beam 2.2s ease-in-out infinite',
                            }}
                        />

                        {/* Scan beam glow layer */}
                        <div
                            className="absolute left-0 right-0 h-8 opacity-20"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(16,185,129,0.4), transparent)',
                                animation: 'scan-beam 2.2s ease-in-out infinite',
                                transform: 'translateY(-32px)',
                            }}
                        />

                        {/* Floating particles inside scanner */}
                        {PARTICLES.map((p, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full bg-emerald-400"
                                style={{
                                    left: p.left, top: p.top,
                                    width: p.size, height: p.size,
                                    animation: `particle-rise 1.6s ease-out ${p.delay} infinite`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Corner markers — L-shaped brackets */}
                    {[
                        { top: 0,    left: 0,    rotate: 0   },
                        { top: 0,    right: 0,   rotate: 90  },
                        { bottom: 0, right: 0,   rotate: 180 },
                        { bottom: 0, left: 0,    rotate: 270 },
                    ].map((pos, ci) => (
                        <div key={ci}
                            className="absolute w-6 h-6"
                            style={{
                                ...pos,
                                animation: `corner-glow 1.8s ease-in-out ${ci * 0.2}s infinite`,
                            }}>
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 rounded-full" />
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-emerald-400 rounded-full" />
                        </div>
                    ))}

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Scan className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* ── Status text ── */}
                <div className="text-center space-y-2 min-h-[48px]">
                    <p
                        key={statusIdx}
                        className="text-emerald-400 font-semibold text-sm"
                        style={{ animation: 'scan-fade-in 0.4s ease-out both' }}
                    >
                        {SCAN_STATUSES[statusIdx]}
                    </p>
                    <p className="text-gray-500 text-xs">
                        Jangan tutup atau navigasi ke halaman lain
                    </p>
                </div>

                {/* ── Equalizer waveform ── */}
                <div className="flex items-end gap-1 h-8">
                    {[0.6, 1, 0.7, 1, 0.5, 0.8, 1, 0.6, 0.9, 0.7, 1, 0.5, 0.8, 1, 0.6].map((h, i) => (
                        <div
                            key={i}
                            className="w-1.5 rounded-full bg-emerald-500"
                            style={{
                                height: `${h * 28}px`,
                                transformOrigin: 'bottom',
                                animation: `eq-bar ${0.6 + (i % 4) * 0.15}s ease-in-out ${i * 0.05}s infinite`,
                                opacity: 0.6 + (i % 3) * 0.15,
                            }}
                        />
                    ))}
                </div>

                {/* Progress dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            style={{ animation: `eq-bar 0.9s ease-in-out ${i * 0.3}s infinite` }} />
                    ))}
                </div>
            </div>
        </div>,
        document.body   // ← Portal: render langsung ke body, bebas dari parent CSS
    );
}

const MEAL_OPTIONS = [
    { value: 'breakfast', label: 'Sarapan' },
    { value: 'lunch',     label: 'Makan Siang' },
    { value: 'dinner',    label: 'Makan Malam' },
    { value: 'snack',     label: 'Snack' },
];

export default function NutriScan({ auth, analysis, error, scansUsed, scansRemaining, maxScans }) {
    const [preview,      setPreview]      = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode,   setFacingMode]   = useState('environment');
    const [isDragging,   setIsDragging]   = useState(false);
    const [isEditing,    setIsEditing]    = useState(false);
    const [editData,     setEditData]     = useState(null);
    const [alertMsg,     setAlertMsg]     = useState(null);
    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInput = useRef(null);

    const { data, setData, post, processing } = useForm({ image: null });

    // State lokal untuk overlay — TIDAK bergantung pada useForm.processing
    // karena pada same-page redirect Inertia, processing bisa tidak reset ke false
    const [isScanning, setIsScanning] = useState(false);
    const logForm = useForm({
        food_name: '',
        calories:  0,
        protein:   0,
        carbs:     0,
        fat:       0,
        fiber:     0,
        sodium:    0,
        sugar:     0,
        image_url: '',
        portion:   '1 porsi',
        meal_type: 'lunch',
    });

    // Sync data analisis ke form setiap kali analysis berubah.
    // useForm Inertia tidak re-inisialisasi saat props berubah (komponen tidak remount
    // karena redirect kembali ke halaman yang sama).
    useEffect(() => {
        if (!analysis) return;
        logForm.setData({
            food_name: analysis.food_name              ?? '',
            calories:  analysis.nutrition?.calories    ?? 0,
            protein:   analysis.nutrition?.protein     ?? 0,
            carbs:     analysis.nutrition?.carbs       ?? 0,
            fat:       analysis.nutrition?.fat         ?? 0,
            fiber:     analysis.nutrition?.fiber       ?? 0,
            sodium:    analysis.nutrition?.sodium      ?? 0,
            sugar:     analysis.nutrition?.sugar       ?? 0,
            image_url: analysis.image_url              ?? '',
            portion:   '1 porsi',
            meal_type: 'lunch',
        });
    }, [analysis]);

    function openCamera() {
        setIsCameraOpen(true);
        navigator.mediaDevices.getUserMedia({ video: { facingMode } })
            .then(s => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; });
    }
    function closeCamera() {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setIsCameraOpen(false);
    }
    function capture() {
        const canvas = canvasRef.current;
        const video  = videoRef.current;
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            setData('image', file);
            setPreview(canvas.toDataURL('image/jpeg'));
            closeCamera();
        }, 'image/jpeg');
    }
    function handleFile(file) {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setAlertMsg('Ukuran file maksimal 5 MB'); return; }
        setData('image', file);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(file);
    }
    function handleDrop(e) { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }
    function handleAnalyze(e) {
        e.preventDefault();
        setIsScanning(true);
        post(route('nutriscan.analyze'), {
            onFinish: () => setIsScanning(false),  // selalu tutup overlay (sukses & error)
        });
    }
    function handleLog(e) {
        e.preventDefault();
        if (isEditing && editData) Object.entries(editData).forEach(([k, v]) => logForm.setData(k, v));
        logForm.post(route('nutriscan.log'));
    }

    const scanPct = maxScans > 0 ? ((maxScans - scansRemaining) / maxScans) * 100 : 0;

    return (
        <AuthenticatedLayout user={auth.user} header="NutriScan">
            <Head title="NutriScan" />
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">

                {/* Quota bar */}
                <FadeUp delay={0}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Scan className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Kuota Scan Hari Ini</span>
                        </div>
                        <span className={`text-sm font-bold ${scansRemaining === 0 ? 'text-red-500' : scansRemaining <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {scansRemaining} tersisa
                        </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${scansRemaining <= 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${scanPct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{scansUsed} dari {maxScans} scan digunakan hari ini</p>
                </div>
                </FadeUp>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Camera */}
                {isCameraOpen && (
                    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-2xl" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex items-center gap-4 mt-6">
                            <button onClick={closeCamera} className="p-3 bg-white/20 text-white rounded-full"><X className="w-5 h-5" /></button>
                            <button onClick={capture} className="w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center">
                                <div className="w-10 h-10 bg-emerald-500 rounded-full" />
                            </button>
                            <button onClick={() => { closeCamera(); setFacingMode(f => f === 'environment' ? 'user' : 'environment'); setTimeout(openCamera, 200); }}
                                className="p-3 bg-white/20 text-white rounded-full"><FlipHorizontal className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}

                {/* Result */}
                {/* Result */}
                {analysis && !isEditing ? (
                    <FadeUp delay={100}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-bold text-lg">{analysis.food_name}</span>
                            </div>
                            <div className="text-emerald-100 text-sm">Kepercayaan: {Math.round(analysis.confidence ?? 0)}%</div>
                            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, Math.round(analysis.confidence ?? 0))}%` }} />
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {analysis.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {analysis.tags.map((t, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">{t}</span>
                                    ))}
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Kalori',  value: logForm.data.calories, unit: 'kkal', cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
                                    { label: 'Protein', value: logForm.data.protein,  unit: 'g',    cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
                                    { label: 'Karbo',   value: logForm.data.carbs,    unit: 'g',    cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
                                    { label: 'Lemak',   value: logForm.data.fat,      unit: 'g',    cls: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' },
                                ].map(n => (
                                    <div key={n.label} className={`p-3 rounded-xl ${n.cls}`}>
                                        <div className="text-xs font-medium opacity-70">{n.label}</div>
                                        <div className="text-xl font-extrabold">{Math.round(n.value)}<span className="text-xs font-normal ml-0.5">{n.unit}</span></div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Waktu Makan</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {MEAL_OPTIONS.map(o => (
                                        <button key={o.value} type="button" onClick={() => logForm.setData('meal_type', o.value)}
                                            className={`py-2 text-xs font-semibold rounded-xl border transition-all ${logForm.data.meal_type === o.value ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300'}`}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setIsEditing(true); setEditData({ food_name: logForm.data.food_name, calories: logForm.data.calories, protein: logForm.data.protein, carbs: logForm.data.carbs, fat: logForm.data.fat }); }}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={handleLog} disabled={logForm.processing}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60 hover:from-emerald-400 hover:to-emerald-500 transition-all">
                                    {logForm.processing ? 'Menyimpan...' : 'Simpan ke Jurnal'}
                                </button>
                            </div>
                        </div>
                    </div>
                    </FadeUp>
                ) : analysis && isEditing ? (
                    <FadeUp delay={0}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Edit Data Nutrisi</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                        {[
                            { key: 'food_name', label: 'Nama Makanan', type: 'text' },
                            { key: 'calories',  label: 'Kalori (kkal)', type: 'number' },
                            { key: 'protein',   label: 'Protein (g)',   type: 'number' },
                            { key: 'carbs',     label: 'Karbo (g)',     type: 'number' },
                            { key: 'fat',       label: 'Lemak (g)',     type: 'number' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{f.label}</label>
                                <input type={f.type} value={editData?.[f.key] ?? ''}
                                    onChange={e => setEditData(d => ({ ...d, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        ))}
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">Batal</button>
                            <button onClick={handleLog} disabled={logForm.processing}
                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                                {logForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                    </FadeUp>
                ) : (
                    <FadeUp delay={0}>
                    {/* Inject scan keyframes hanya saat dibutuhkan */}
                    {isScanning && <style dangerouslySetInnerHTML={{ __html: SCAN_CSS }} />}

                    {/* cursor-wait + pointer-events-none pada form saat scanning
                        (tidak menyentuh Inertia — XHR tetap berjalan normal) */}
                    <form onSubmit={handleAnalyze}
                        style={{ cursor: isScanning ? 'wait' : 'auto' }}>
                        <div onDragOver={e => { e.preventDefault(); if (!isScanning) setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={e => { if (!isScanning) handleDrop(e); }}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
                            {preview ? (
                                <div className="relative inline-block">
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-xl mx-auto" />

                                    {/* Tombol hapus — disembunyikan saat scanning */}
                                    {!isScanning && (
                                        <button type="button" onClick={() => { setPreview(null); setData('image', null); }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}

                                    {/* ── Scan animation overlay di atas gambar ── */}
                                    {isScanning && (
                                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                                            {/* Semi-transparent dark layer */}
                                            <div className="absolute inset-0 bg-gray-950/65 rounded-xl" />

                                            {/* Scan beam — garis hijau menyapu dari atas ke bawah */}
                                            <div
                                                className="absolute left-0 right-0 h-px"
                                                style={{
                                                    background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)',
                                                    boxShadow: '0 0 8px 3px rgba(16,185,129,0.55)',
                                                    animation: 'scan-beam 2s ease-in-out infinite',
                                                }}
                                            />
                                            {/* Glow layer di bawah beam */}
                                            <div
                                                className="absolute left-0 right-0 h-10 opacity-15"
                                                style={{
                                                    background: 'linear-gradient(to bottom, rgba(16,185,129,0.5), transparent)',
                                                    animation: 'scan-beam 2s ease-in-out infinite',
                                                    marginTop: '-40px',
                                                }}
                                            />

                                            {/* Corner markers — 4 sudut */}
                                            {[
                                                { top: 8, left: 8 },
                                                { top: 8, right: 8, rotateY: true },
                                                { bottom: 8, left: 8, rotateX: true },
                                                { bottom: 8, right: 8, rotateX: true, rotateY: true },
                                            ].map((pos, ci) => (
                                                <div key={ci}
                                                    className="absolute w-5 h-5"
                                                    style={{
                                                        top: pos.top, left: pos.left,
                                                        bottom: pos.bottom, right: pos.right,
                                                        transform: `scaleX(${pos.rotateY ? -1 : 1}) scaleY(${pos.rotateX ? -1 : 1})`,
                                                        animation: `corner-glow 1.6s ease-in-out ${ci * 0.2}s infinite`,
                                                    }}>
                                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 rounded-full" />
                                                    <div className="absolute top-0 left-0 w-0.5 h-full bg-emerald-400 rounded-full" />
                                                </div>
                                            ))}

                                            {/* Status bar di bawah */}
                                            <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gray-950/80 flex items-center justify-between gap-3">
                                                <span className="text-emerald-400 text-xs font-semibold truncate">
                                                    {SCAN_STATUSES[0]}
                                                </span>
                                                {/* Mini EQ bars */}
                                                <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
                                                    {[0.6, 1, 0.7, 1, 0.5, 0.8, 1].map((h, i) => (
                                                        <div key={i}
                                                            className="w-1 rounded-sm bg-emerald-500"
                                                            style={{
                                                                height: `${h * 14}px`,
                                                                transformOrigin: 'bottom',
                                                                animation: `eq-bar ${0.5 + (i % 3) * 0.2}s ease-in-out ${i * 0.08}s infinite`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
                                        <Upload className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Upload foto makanan</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag & drop atau klik pilih file</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG • Maks 5 MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <input ref={fileInput} type="file" accept="image/jpg,image/jpeg,image/png" className="hidden" onChange={e => handleFile(e.target.files[0])} />

                        {/* Buttons — semua disabled saat scanning */}
                        <div className={`flex gap-3 mt-4 ${isScanning ? 'pointer-events-none opacity-60' : ''}`}>
                            <button type="button" onClick={() => fileInput.current?.click()} disabled={isScanning}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:cursor-wait">
                                <Upload className="w-4 h-4" /> Pilih File
                            </button>
                            <button type="button" onClick={openCamera} disabled={scansRemaining === 0 || isScanning}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-wait">
                                <Camera className="w-4 h-4" /> Kamera
                            </button>
                            <button type="submit" disabled={!data.image || isScanning || processing || scansRemaining === 0}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 text-white font-semibold rounded-xl text-sm disabled:opacity-50 disabled:cursor-wait hover:bg-emerald-400/60 transition-all">
                                <Scan className="w-4 h-4" />
                                {isScanning ? 'Menganalisis...' : 'Analisis'}
                            </button>
                        </div>
                        {scansRemaining === 0 && (
                            <p className="text-xs text-red-500 mt-2 text-center">Kuota scan harian habis. Coba lagi besok pukul 00:00.</p>
                        )}
                    </form>
                    </FadeUp>
                )}
            </div>

            {/* Alert Modal */}
            <Modal show={!!alertMsg} onClose={() => setAlertMsg(null)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Peringatan</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{alertMsg}</p>
                    <button
                        onClick={() => setAlertMsg(null)}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>

            {/* Full-screen scanning overlay — SEMENTARA DINONAKTIFKAN untuk testing */}
            {/* {isScanning && <ScanningOverlay />} */}

        </AuthenticatedLayout>
    );
}
