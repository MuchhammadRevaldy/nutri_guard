import { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function NutriScan({ auth, analysis, error }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        image: null,
    });

    // Local state for UI preview before upload
    const [preview, setPreview] = useState(analysis ? analysis.image_url : null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [showError, setShowError] = useState(false);

    // Auto-show error if passed from backend
    useEffect(() => {
        if (error) {
            setShowError(true);
        }
    }, [error]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Create a local result state that can be populated from props
    const result = analysis || null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsCameraOpen(false);
            alert("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            // Set canvas dimensions to match video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            canvasRef.current.toBlob((blob) => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                setData('image', file);
                setPreview(URL.createObjectURL(file));
                stopCamera();
            }, 'image/jpeg');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('nutriscan.analyze'), {
            onSuccess: () => {
                // The page will reload with 'analysis' prop
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">NutriScan AI</h2>}
        >
            <Head title="NutriScan AI" />

            <div className="py-12 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Header Text */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">NutriScan AI</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Upload a photo to get an instant nutritional analysis for your family.</p>
                    </div>

                    {/* Camera Modal / Overlay */}
                    {isCameraOpen && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
                            <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                                    <button
                                        onClick={stopCamera}
                                        className="px-6 py-3 bg-red-500/80 hover:bg-red-600/80 text-white rounded-full font-bold backdrop-blur-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        className="px-8 py-3 bg-white hover:bg-gray-200 text-black rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                                    >
                                        Capture
                                    </button>
                                </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                    )}

                    {/* Upload Section */}
                    {!result ? (
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center transition-all hover:border-emerald-500 dark:hover:border-emerald-500 group relative">

                                {preview ? (
                                    <div className="space-y-6">
                                        <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden shadow-lg border-4 border-emerald-500 relative">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            {processing && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => { setPreview(null); setData('image', null); }}
                                                className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium"
                                                disabled={processing}
                                            >
                                                Change Photo
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 disabled:opacity-50"
                                                disabled={processing}
                                            >
                                                {processing ? 'Analyzing...' : 'Analyze Food'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className="space-y-6 cursor-pointer"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400 transform group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Drag & drop your food image here</h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-6">or use your camera to capture instantly</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                            <label className="px-8 py-3 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full font-bold cursor-pointer transition-colors">
                                                <span>Choose File</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                            <span className="text-gray-400 font-medium">- OR -</span>
                                            <button
                                                type="button"
                                                onClick={startCamera}
                                                className="px-8 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white rounded-full font-bold shadow-lg transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                </svg>
                                                Open Camera
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    ) : (
                        /* Result Card */
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row animate-fade-in-up">
                            {/* Image Side */}
                            <div className="md:w-1/2 relative bg-gray-100 dark:bg-gray-900">
                                <img src={result.image_url || preview} alt={result.food_name} className="w-full h-full object-cover min-h-[400px]" />
                                <button
                                    onClick={() => window.location.reload()} // Simple reset
                                    className="absolute top-4 left-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Info Side */}
                            <div className="md:w-1/2 p-8 md:p-12 space-y-8">
                                <div>
                                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{result.food_name}</h2>

                                    {/* Confidence Bar */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                                        </div>
                                        <span className="text-emerald-500 font-bold text-sm">{result.confidence}% Confident</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {result.tags.map((tag, idx) => (
                                            <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold ${['Rice', 'Vegetables'].includes(tag) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                                tag === 'Egg' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Nutritional Breakdown</h3>

                                    {/* Portion Control */}
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Portion:</span>
                                        <select className="bg-transparent border-none text-gray-900 dark:text-white font-bold focus:ring-0 cursor-pointer">
                                            <option>{result.portion}</option>
                                            <option>1 cup (158g)</option>
                                            <option>0.5 cup (79g)</option>
                                        </select>
                                    </div>

                                    {/* Macros List */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="text-gray-600 dark:text-gray-400">Calories</span>
                                            <span className="font-black text-gray-900 dark:text-white">{result.nutrition.calories} kcal</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Protein</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{result.nutrition.protein} g</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Carbohydrates</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{result.nutrition.carbs} g</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Fat</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{result.nutrition.fat} g</span>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-gray-500">Sodium</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{result.nutrition.sodium} mg</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-gray-500">Sugar</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{result.nutrition.sugar} g</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            router.post(route('nutriscan.log'), {
                                                food_name: result.food_name,
                                                calories: result.nutrition.calories,
                                                protein: result.nutrition.protein,
                                                carbs: result.nutrition.carbs,
                                                fat: result.nutrition.fat,
                                                image_url: result.image_url,
                                                portion: result.portion || '1 serving'
                                            });
                                        }}
                                        disabled={processing}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02]"
                                    >
                                        Save to Daily Log
                                    </button>

                                    <button
                                        onClick={() => window.location.href = route('nutriscan.index')}
                                        className="w-full py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-colors"
                                    >
                                        Analyze Another Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Modal */}
            <Modal show={showError} onClose={() => setShowError(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Something went wrong.'}</p>
                    <button
                        onClick={() => setShowError(false)}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
