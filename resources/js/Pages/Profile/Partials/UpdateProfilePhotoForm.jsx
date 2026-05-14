import { useRef, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { Upload, Link, Trash2, CheckCircle, AlertCircle, ImageIcon, Loader2 } from 'lucide-react';
import Modal from '@/Components/Modal';

const PROVIDERS = [
    { value: '',           label: 'Custom / Lainnya' },
    { value: 'cloudinary', label: 'Cloudinary' },
    { value: 'imgur',      label: 'Imgur' },
    { value: 'supabase',   label: 'Supabase Storage' },
    { value: 'aws-s3',     label: 'AWS S3' },
];

export default function UpdateProfilePhotoForm({ className = '' }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [tab, setTab]               = useState('upload');  // 'upload' | 'url'
    const [preview, setPreview]       = useState(null);
    const [selectedFile, setFile]     = useState(null);
    const [apiUrl, setApiUrl]         = useState('');
    const [provider, setProvider]     = useState('');
    const [progress, setProgress]     = useState(0);
    const [loading, setLoading]       = useState(false);
    const [toast, setToast]           = useState(null);      // {type: 'success'|'error', msg}
    const [isDragging, setDragging]   = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const fileInput = useRef(null);

    // ── helpers ─────────────────────────────────────────────────────────────

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('error', 'File harus berupa gambar (jpg, png, webp).');
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            showToast('error', 'Ukuran file maksimal 3 MB.');
            return;
        }
        setFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const onFileChange  = (e) => handleFile(e.target.files[0]);
    const onDrop        = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
    const onDragOver    = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave   = ()  => setDragging(false);
    const cancelFile    = ()  => { setFile(null); setPreview(null); if (fileInput.current) fileInput.current.value = ''; };

    // ── API calls ────────────────────────────────────────────────────────────

    const uploadFile = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setProgress(0);
        try {
            const form = new FormData();
            form.append('avatar', selectedFile);

            const res = await axios.post('/profile/avatar', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
            });

            cancelFile();
            showToast('success', res.data.message);
            router.reload({ only: ['auth'] });
        } catch (err) {
            const msg = err.response?.data?.message ?? err.response?.data?.errors?.avatar?.[0] ?? 'Upload gagal.';
            showToast('error', msg);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const saveUrl = async () => {
        if (!apiUrl.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post('/profile/avatar', { api_url: apiUrl.trim(), api_provider: provider || null });
            setApiUrl('');
            setProvider('');
            showToast('success', res.data.message);
            router.reload({ only: ['auth'] });
        } catch (err) {
            const msg = err.response?.data?.message ?? err.response?.data?.errors?.api_url?.[0] ?? 'Gagal menyimpan URL.';
            showToast('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const requestRemovePhoto = () => {
        setConfirmRemove(true);
    };

    const removePhoto = async () => {
        setConfirmRemove(false);
        setLoading(true);
        try {
            const res = await axios.delete('/profile/avatar');
            showToast('success', res.data.message);
            router.reload({ only: ['auth'] });
        } catch {
            showToast('error', 'Gagal menghapus foto.');
        } finally {
            setLoading(false);
        }
    };

    // ── render ───────────────────────────────────────────────────────────────

    const currentAvatar = user.avatar_url;

    return (
        <section className={className}>
            {/* Header */}
            <header className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Foto Profil
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Upload file dari perangkat atau masukkan URL dari API gambar eksternal.
                    </p>
                </div>

                {/* Current avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 overflow-hidden ring-2 ring-emerald-400/40 flex items-center justify-center">
                        {currentAvatar ? (
                            <img src={currentAvatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-xl">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {currentAvatar && (
                        <button
                            onClick={requestRemovePhoto}
                            disabled={loading}
                            title="Hapus foto"
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-2.5 h-2.5" />
                        </button>
                    )}
                </div>
            </header>

            {/* Toast */}
            {toast && (
                <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                    ${toast.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {toast.type === 'success'
                        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {toast.msg}
                </div>
            )}

            <div className="mt-6">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg w-fit mb-5">
                    {[
                        { key: 'upload', icon: Upload,  label: 'Upload File' },
                        { key: 'url',    icon: Link,    label: 'URL Eksternal' },
                    ].map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${tab === key
                                    ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Upload File ── */}
                {tab === 'upload' && (
                    <div className="space-y-4">
                        {/* Drag & drop zone */}
                        {!selectedFile ? (
                            <div
                                onClick={() => fileInput.current?.click()}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                className={`relative flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                    ${isDragging
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                                    }`}
                            >
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Seret foto ke sini, atau <span className="text-emerald-600 dark:text-emerald-400">klik untuk memilih</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Maks 3 MB</p>
                                </div>
                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={onFileChange}
                                />
                            </div>
                        ) : (
                            /* Preview */
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <img src={preview} alt="preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                    {progress > 0 && progress < 100 && (
                                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button onClick={cancelFile} disabled={loading}
                                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={uploadFile}
                            disabled={!selectedFile || loading}
                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {loading ? 'Mengupload...' : 'Upload Foto'}
                        </button>
                    </div>
                )}

                {/* ── Tab: URL Eksternal ── */}
                {tab === 'url' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                URL Gambar
                            </label>
                            <input
                                type="url"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder="https://res.cloudinary.com/demo/image/upload/sample.jpg"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-200 placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Penyedia API
                                <span className="ml-1 text-xs text-gray-400 font-normal">(opsional)</span>
                            </label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-200"
                            >
                                {PROVIDERS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* URL preview */}
                        {apiUrl.trim() && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <img
                                    src={apiUrl}
                                    alt="preview"
                                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{apiUrl}</p>
                            </div>
                        )}

                        <button
                            onClick={saveUrl}
                            disabled={!apiUrl.trim() || loading}
                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                            {loading ? 'Menyimpan...' : 'Simpan URL'}
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm Delete Photo Modal */}
            <Modal show={confirmRemove} onClose={() => setConfirmRemove(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hapus Foto Profil?</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Tindakan ini tidak dapat dibatalkan. Foto profil Anda akan kembali menjadi inisial nama.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setConfirmRemove(false)}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={removePhoto}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-500/30"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
