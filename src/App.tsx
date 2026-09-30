import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, UploadCloud, FileImage, FileText, Settings, Shield,
  Zap, Sun, Moon, ArrowRight, Download, Image as ImageIcon,
  CheckCircle, FileUp, Sparkles, X, ChevronRight, SlidersHorizontal,
  Scissors, FileBadge, Lock, ArrowLeft, RefreshCw, Loader2, FolderArchive,
  AlertTriangle, Copy, Trash2, Maximize, FileCheck2, ArrowDownUp,
  Grid, MoveLeft, MoveRight, RotateCw, ImagePlus, FileOutput,
  MessageSquare, Bot, Send, Paperclip, User, Clock3, Menu, Star, LayoutDashboard,
  History, Workflow, Database, Keyboard, ShieldCheck, FilePlus2, MoreHorizontal,
  ScanText, Stamp, Hash, FilePenLine, ClipboardCheck, Check, Command, BookOpen,
  Camera, GitCompareArrows, FormInput, Type, Highlighter
} from 'lucide-react';

// PDF.js Dynamic Loader for Client-Side Rendering
let pdfJsPromise = null;
const loadPdfJs = () => {
  if (pdfJsPromise) return pdfJsPromise;
  pdfJsPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF engine."));
    document.head.appendChild(script);
  });
  return pdfJsPromise;
};

let pdfLibPromise = null;
const loadPdfLib = () => {
  if (pdfLibPromise) return pdfLibPromise;
  pdfLibPromise = new Promise((resolve, reject) => {
    if (window.PDFLib) { resolve(window.PDFLib); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Failed to load pdf-lib"));
    document.head.appendChild(script);
  });
  return pdfLibPromise;
};

let jsZipPromise = null;
const loadJSZip = () => {
  if (jsZipPromise) return jsZipPromise;
  jsZipPromise = new Promise((resolve, reject) => {
    if (window.JSZip) { resolve(window.JSZip); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = () => reject(new Error("Failed to load JSZip"));
    document.head.appendChild(script);
  });
  return jsZipPromise;
};

let jsPDFPromise = null;
const loadJsPDF = () => {
  if (jsPDFPromise) return jsPDFPromise;
  jsPDFPromise = new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(window.jspdf); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
  return jsPDFPromise;
};

const readStoredJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const rememberRecentFile = (file) => {
  if (!file) return;
  const next = [
    { name: file.name, size: file.size, type: file.type, modified: Date.now() },
    ...readStoredJson('docmate-recent-files', []).filter(item => item.name !== file.name)
  ].slice(0, 12);
  localStorage.setItem('docmate-recent-files', JSON.stringify(next));
};

const TOOLS = [
  { id: 'image-to-pdf', name: 'Image to PDF', category: 'PDF', icon: FileOutput, desc: 'Convert and organize images into PDF.', popular: true },
  { id: 'exact-compress', name: 'Exact Size Compressor', category: 'Student', icon: Settings, desc: 'Compress exactly to a target KB/MB.', popular: true },
  { id: 'image-converter', name: 'Image Converter', category: 'Image', icon: RefreshCw, desc: 'Convert between JPG, PNG, WEBP.', popular: true },
  { id: 'document-scanner', name: 'Document Scanner', category: 'Document', icon: Camera, desc: 'Scan multiple pages from your camera into one PDF.', popular: true },
  { id: 'passport-photo', name: 'Passport Photo Maker', category: 'Student', icon: FileBadge, desc: 'Create perfect official photos.', popular: true },
  { id: 'signature-maker', name: 'Signature Maker', category: 'Student', icon: FileImage, desc: 'Clean, crop, and format signatures.', popular: true },
  { id: 'remove-bg', name: 'Background Remover', category: 'Image', icon: Scissors, desc: 'Remove solid backgrounds from edge-connected areas.', popular: true },
  { id: 'ai-assistant', name: 'Local Document Assistant', category: 'AI Tools', icon: Sparkles, desc: 'Summarize and search PDFs privately in your browser.', popular: true },
  { id: 'pdf-to-images', name: 'PDF to Images', category: 'PDF', icon: ImagePlus, desc: 'Extract PDF pages as JPG/PNG.', popular: false },
  { id: 'merge-pdf', name: 'Merge PDF', category: 'PDF', icon: FileUp, desc: 'Combine multiple PDFs into one.', popular: true },
  { id: 'split-pdf', name: 'Split PDF', category: 'PDF', icon: Scissors, desc: 'Extract or split pages from a PDF.', popular: false },
  { id: 'pdf-organizer', name: 'PDF Page Organizer', category: 'PDF', icon: Grid, desc: 'Visually reorder, rotate, and delete pages.', popular: true },
  { id: 'submission-ready', name: 'Submission Ready', category: 'Student', icon: FileCheck2, desc: 'Validate files for applications.', popular: true },
  { id: 'pdf-watermark', name: 'PDF Watermark', category: 'PDF', icon: Stamp, desc: 'Stamp text across selected PDF pages locally.', popular: true },
  { id: 'pdf-page-numbers', name: 'Page Numbers', category: 'PDF', icon: Hash, desc: 'Add numbered footers to every PDF page.', popular: false },
  { id: 'image-ocr', name: 'Image OCR', category: 'Document', icon: ScanText, desc: 'Extract text from images in your browser.', popular: true },
  { id: 'pdf-compare', name: 'Compare PDFs', category: 'PDF', icon: GitCompareArrows, desc: 'Compare page counts and extracted text.', popular: false },
  { id: 'pdf-editor', name: 'PDF Text Editor', category: 'PDF', icon: FilePenLine, desc: 'Add text overlays to PDF pages locally.', popular: true },
  { id: 'document-scanner', name: 'Document Scanner', category: 'Document', icon: Camera, desc: 'Enhance an image and export a clean PDF.', popular: true },
];

const MAINTENANCE_MODE = false;

const CATEGORIES = ['All', 'Image', 'PDF', 'Student', 'Document', 'Privacy', 'AI Tools'];

const Button = ({ children, variant = 'primary', size = 'md', className = '', isLoading = false, disabled = false, onClick, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-white/10",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700",
    outline: "border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
  };
  const sizes = { sm: "text-sm px-3 py-1.5 gap-1.5", md: "text-sm px-4 py-2.5 gap-2", lg: "text-base px-6 py-3 gap-2.5" };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isLoading || disabled} onClick={onClick} {...props}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className = '', hover = false, onClick }) => (
  <div onClick={onClick} className={`bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-slate-700 cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'blue' }) => {
  const variants = {
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };
  return <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${variants[variant]}`}>{children}</span>;
};

const Dropzone = ({ onFileSelect, accept = "*", title = "Drop your file here", subtitle = "or click to browse", icon: Icon = UploadCloud, multiple = false, capture }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(rememberRecentFile);
      multiple ? onFileSelect(Array.from(e.dataTransfer.files)) : onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full p-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${isDragging ? 'border-cyan-400 bg-cyan-400/5' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50'}`}
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept={accept} capture={capture} multiple={multiple} onChange={(e) => { 
        if(e.target.files?.length) {
          Array.from(e.target.files).forEach(rememberRecentFile);
          multiple ? onFileSelect(Array.from(e.target.files)) : onFileSelect(e.target.files[0]);
        }
        e.target.value = null; // Reset
      }} />
      <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}><Icon className="w-8 h-8" /></div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 flex items-center gap-2"><Lock className="w-3 h-3"/> Processed securely in your browser</p>
    </div>
  );
};

const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-10">
    {steps.map((step, index) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center relative z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${index < currentStep ? 'bg-cyan-500 border-cyan-500 text-white' : index === currentStep ? 'bg-slate-800 border-cyan-400 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
            {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          <span className={`absolute top-10 text-xs font-medium whitespace-nowrap ${index <= currentStep ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
        </div>
        {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${index < currentStep ? 'bg-cyan-500/50' : 'bg-slate-800'}`} />}
      </React.Fragment>
    ))}
  </div>
);

const ErrorBox = ({ message }) => (
  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
    <p>{message}</p>
  </div>
);

const fileToDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = url;
});

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const triggerDownload = (url, filename) => {
  window.dispatchEvent(new CustomEvent('docmate-download', { detail: { status: 'preparing', filename, url } }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('docmate-download', { detail: { status: 'complete', filename, url } }));
  }, 450);
  if (url.startsWith('blob:')) {
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
};

const BackgroundRemover = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [tolerance, setTolerance] = useState(40);
  const canvasRef = useRef(null);

  const processBg = async () => {
    setIsProcessing(true); setError(null);
    try {
      const dataUrl = await fileToDataURL(file);
      const img = await loadImage(dataUrl);
      const canvas = canvasRef.current;
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Sample top-left pixel as background color
      const bgR = data[0], bgG = data[1], bgB = data[2];

      // Remove only background-connected pixels so similarly colored foreground details survive.
      const visited = new Uint8Array(canvas.width * canvas.height);
      const queue = [];
      for (let x = 0; x < canvas.width; x++) queue.push([x, 0], [x, canvas.height - 1]);
      for (let y = 1; y < canvas.height - 1; y++) queue.push([0, y], [canvas.width - 1, y]);
      while (queue.length) {
        const [x, y] = queue.pop();
        const position = y * canvas.width + x;
        if (visited[position]) continue;
        visited[position] = 1;
        const offset = position * 4;
        const distance = Math.hypot(data[offset] - bgR, data[offset + 1] - bgG, data[offset + 2] - bgB);
        if (distance > tolerance) continue;
        data[offset + 3] = 0;
        if (x > 0) queue.push([x - 1, y]);
        if (x < canvas.width - 1) queue.push([x + 1, y]);
        if (y > 0) queue.push([x, y - 1]);
        if (y < canvas.height - 1) queue.push([x, y + 1]);
      }
      ctx.putImageData(imgData, 0, 0);
      setResultUrl(canvas.toDataURL('image/png'));
    } catch(e) {
      setError("Failed to process image. Make sure it's a valid format.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (file) processBg();
  }, [file, tolerance]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-slate-800/50 border border-slate-700 text-slate-300 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
        <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div><strong>Privacy-First Local Processing:</strong> This tool uses a fast client-side color-keying algorithm ideal for solid backgrounds. Your image never leaves your device.</div>
      </div>
      
      {!file ? (
        <Dropzone onFileSelect={setFile} accept="image/jpeg, image/png, image/webp" title="Upload image to remove background" />
      ) : (
        <Card className="p-8">
           {error && <ErrorBox message={error} />}
           
           <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex-1">
                 <h3 className="text-sm text-slate-400 mb-3 font-medium uppercase tracking-wider text-center">Original</h3>
                 <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center h-80">
                   <img src={URL.createObjectURL(file)} className="max-w-full max-h-full object-contain rounded" alt="original" />
                 </div>
              </div>
              <div className="flex-1">
                 <h3 className="text-sm text-slate-400 mb-3 font-medium uppercase tracking-wider text-center">Result (Transparent PNG)</h3>
                 <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center h-80 relative">
                   {isProcessing && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur flex flex-col items-center justify-center z-10 rounded-xl"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-2"/> <span className="text-sm text-slate-300">Processing...</span></div>}
                   {resultUrl && (
                     <div className="w-full h-full rounded overflow-hidden flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgLz4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIiAvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2VlZSIgLz4KPC9zdmc+')]">
                       <img src={resultUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="result" />
                     </div>
                   )}
                 </div>
              </div>
           </div>
           
           <div className="max-w-md mx-auto mb-8">
             <label className="block text-sm text-slate-400 mb-2">Tolerance Level: {tolerance}</label>
             <input type="range" min="5" max="150" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full accent-cyan-500" />
             <p className="text-xs text-slate-500 mt-2 text-center">Adjust if too much or too little background is removed.</p>
           </div>
           
           <div className="flex gap-4 justify-center">
             <Button variant="outline" onClick={() => { setFile(null); setResultUrl(null); }}>Start Over</Button>
             <Button onClick={() => triggerDownload(resultUrl, `nobg_${file.name.split('.')[0]}.png`)} disabled={!resultUrl || isProcessing}>
               <Download className="w-4 h-4" /> Download PNG
             </Button>
           </div>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const ExactCompressor = () => {
  const [file, setFile] = useState(null);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState('KB');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);

  const processCompression = async () => {
    setIsProcessing(true); setError(null);
    try {
      const dataUrl = await fileToDataURL(file);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Always fill white to handle PNG to JPG transition safely
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const targetBytes = unit === 'MB' ? targetValue * 1024 * 1024 : targetValue * 1024;
      if (file.size <= targetBytes) throw new Error("File is already smaller than the target size.");

      let minQ = 0.01, maxQ = 1.0, bestQ = 0.01, bestUrl = null, bestSize = 0;

      // Iterative binary search for optimal JPEG quality
      for (let i = 0; i < 12; i++) {
        const midQ = (minQ + maxQ) / 2;
        const tempUrl = canvas.toDataURL('image/jpeg', midQ);
        const size = Math.round((tempUrl.length * 3) / 4); // base64 byte size estimation

        if (size <= targetBytes) {
          bestQ = midQ; bestUrl = tempUrl; bestSize = size;
          minQ = midQ; // Try higher quality
        } else {
          maxQ = midQ; // Lower size needed
        }
      }

      if (!bestUrl) throw new Error("Could not compress to this size. Try a larger target or smaller dimensions.");
      
      setResult({ url: bestUrl, size: bestSize, quality: Math.round(bestQ * 100) });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload', 'Target Size', 'Download']} />
      {step === 0 && <Dropzone onFileSelect={(f) => { setFile(f); setStep(1); }} accept="image/*" title="Drop image to compress exactly" />}
      
      {step === 1 && (
        <Card className="p-8">
          {error && <ErrorBox message={error} />}
          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-slate-950 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-800">
               <img src={URL.createObjectURL(file)} alt="preview" className="max-h-48 object-contain rounded mb-4" />
               <Badge variant="blue">Original: {formatBytes(file.size)}</Badge>
             </div>
             <div className="space-y-6 flex flex-col justify-center">
                <div>
                  <label className="block text-sm text-slate-300 mb-2 font-medium">Target Size (Maximum)</label>
                  <div className="flex gap-2">
                    <input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} 
                           className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-500" min="1" />
                    <select value={unit} onChange={e => setUnit(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-4 text-white focus:outline-none">
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                  {file.type === 'image/png' && (
                    <p className="text-xs text-amber-400 mt-3 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> PNGs will be converted to JPG to achieve exact compression limits.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)}>Cancel</Button>
                  <Button onClick={processCompression} isLoading={isProcessing} className="flex-1">Compress Now</Button>
                </div>
             </div>
          </div>
        </Card>
      )}

      {step === 2 && result && (
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-6">Compression Successful</h2>
          
          <div className="flex justify-center items-center gap-6 mb-8 text-sm flex-wrap">
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="text-slate-500 mb-1">Original</div><div className="text-lg text-white">{formatBytes(file.size)}</div></div>
             <ArrowRight className="text-slate-600 hidden md:block" />
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="text-slate-500 mb-1">Target</div><div className="text-lg text-white">{targetValue} {unit}</div></div>
             <ArrowRight className="text-slate-600 hidden md:block" />
             <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"><div className="text-slate-500 mb-1">Final Size</div><div className="text-lg text-cyan-400 font-bold">{formatBytes(result.size)}</div></div>
          </div>
          
          <div className="text-slate-400 text-sm mb-8">Achieved at {result.quality}% visual quality ({Math.round((1 - result.size/file.size)*100)}% reduction).</div>
          
          <div className="flex justify-center gap-4">
             <Button variant="outline" onClick={() => { setStep(0); setFile(null); }}>Compress Another</Button>
             <Button onClick={() => triggerDownload(result.url, `compressed_${file.name.replace(/\.[^/.]+$/, "")}.jpg`)}>
               <Download className="w-4 h-4" /> Download Image
             </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

const ImageConverter = () => {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);

  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    setFiles([...files, ...valid]);
    if (step === 0 && valid.length > 0) setStep(1);
  };

  const processConversion = async () => {
    setIsProcessing(true);
    const converted = [];
    for (let f of files) {
      try {
        const dataUrl = await fileToDataURL(f);
        const img = await loadImage(dataUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); // white bg for jpg
        }
        ctx.drawImage(img, 0, 0);
        const outUrl = canvas.toDataURL(targetFormat, 0.9);
        const size = Math.round((outUrl.length * 3) / 4);
        const ext = targetFormat.split('/')[1];
        converted.push({ 
          originalName: f.name, 
          originalSize: f.size, 
          originalFormat: f.type.split('/')[1],
          newName: `converted_${f.name.replace(/\.[^/.]+$/, "")}.${ext}`, 
          newSize: size,
          newFormat: ext,
          url: outUrl,
          status: 'Success'
        });
      } catch (e) {
        converted.push({ originalName: f.name, status: 'Failed' });
      }
    }
    setResults(converted);
    setIsProcessing(false);
    setStep(2);
  };

  const downloadAll = async () => {
    const successFiles = results.filter(r => r.status === 'Success');
    if (successFiles.length === 1) {
      triggerDownload(successFiles[0].url, successFiles[0].newName);
      return;
    }
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    successFiles.forEach(r => zip.file(r.newName, r.url.split(',')[1], {base64: true}));
    const content = await zip.generateAsync({type:"blob"});
    triggerDownload(URL.createObjectURL(content), "converted_images.zip");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload', 'Convert', 'Download']} />
      {step === 0 && <Dropzone onFileSelect={handleFiles} accept="image/*" multiple title="Drop images to convert formats" />}
      
      {step === 1 && (
        <Card className="p-6">
           <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
             <h3 className="text-lg font-semibold text-white">{files.length} Files Selected</h3>
             <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Convert all to:</span>
                <select value={targetFormat} onChange={e => setTargetFormat(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-cyan-500">
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/webp">WEBP</option>
                </select>
             </div>
           </div>
           
           <div className="max-h-80 overflow-y-auto mb-6 rounded-xl border border-slate-800 bg-slate-900/50">
             <table className="w-full text-left text-sm text-slate-400">
               <thead className="bg-slate-800 text-slate-300 sticky top-0">
                 <tr><th className="p-4 font-medium">Filename</th><th className="p-4 font-medium">Format</th><th className="p-4 font-medium">Size</th><th className="p-4 text-right">Action</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {files.map((f, i) => (
                   <tr key={i} className="hover:bg-slate-800/50">
                     <td className="p-4 truncate max-w-[200px] text-slate-300">{f.name}</td>
                     <td className="p-4 uppercase">{f.type.split('/')[1]}</td>
                     <td className="p-4">{formatBytes(f.size)}</td>
                     <td className="p-4 text-right">
                       <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4 inline"/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="flex gap-4">
             <Button variant="outline" className="flex-1" onClick={() => {setFiles([]); setStep(0);}}>Start Over</Button>
             <Button className="flex-1" onClick={processConversion} isLoading={isProcessing} disabled={files.length===0}>Convert Now</Button>
           </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
           <h2 className="text-xl font-bold text-white mb-6 text-center">Conversion Results</h2>
           <div className="max-h-80 overflow-y-auto mb-8 rounded-xl border border-slate-800 bg-slate-900/50">
             <table className="w-full text-left text-sm text-slate-400">
               <thead className="bg-slate-800 text-slate-300 sticky top-0">
                 <tr>
                   <th className="p-4 font-medium">File</th>
                   <th className="p-4 font-medium">Conversion</th>
                   <th className="p-4 font-medium">New Size</th>
                   <th className="p-4 font-medium">Status</th>
                   <th className="p-4 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {results.map((r, i) => (
                   <tr key={i} className="hover:bg-slate-800/50">
                     <td className="p-4 truncate max-w-[150px] text-slate-300" title={r.originalName}>{r.originalName}</td>
                     <td className="p-4"><span className="uppercase text-slate-500">{r.originalFormat}</span> &rarr; <span className="uppercase text-cyan-400">{r.newFormat}</span></td>
                     <td className="p-4">{r.status === 'Success' ? formatBytes(r.newSize) : '-'}</td>
                     <td className="p-4">
                       {r.status === 'Success' ? <Badge variant="emerald">Success</Badge> : <Badge variant="amber">Failed</Badge>}
                     </td>
                     <td className="p-4 text-right">
                        {r.status === 'Success' && (
                          <button onClick={() => triggerDownload(r.url, r.newName)} className="text-cyan-400 hover:text-cyan-300"><Download className="w-4 h-4 inline"/></button>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => { setStep(0); setFiles([]); setResults([]); }}>Convert More</Button>
              <Button onClick={downloadAll} disabled={results.filter(r=>r.status==='Success').length===0}>
                <Download className="w-4 h-4" /> Download {results.filter(r=>r.status==='Success').length > 1 ? 'All (ZIP)' : 'File'}
              </Button>
           </div>
        </Card>
      )}
    </div>
  );
};

const ImageToPdf = () => {
  const [images, setImages] = useState([]); // { file, url, rotation }
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({ format: 'a4', orientation: 'portrait', margin: 10 });

  const handleFiles = async (newFiles) => {
    const valid = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    const mapped = await Promise.all(valid.map(async (file) => ({
      file, url: await fileToDataURL(file), id: Math.random().toString(), rotation: 0
    })));
    setImages(prev => [...prev, ...mapped]);
    if (step === 0 && mapped.length > 0) setStep(1);
  };

  const removeImage = (id) => setImages(images.filter(img => img.id !== id));
  const rotateImage = (id) => setImages(images.map(img => img.id === id ? {...img, rotation: (img.rotation + 90) % 360} : img));
  const moveImage = (index, dir) => {
    if (index + dir < 0 || index + dir >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[index + dir]] = [newImages[index + dir], newImages[index]];
    setImages(newImages);
  };

  const generatePDF = async () => {
    if(images.length === 0) return;
    setIsProcessing(true);
    try {
      const { jsPDF } = await loadJsPDF();
      const doc = new jsPDF({ orientation: settings.orientation, format: settings.format, unit: 'mm' });
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();
        
        // Handle rotation via temporary canvas before adding to PDF
        const imgObj = await loadImage(images[i].url);
        let finalDataUrl = images[i].url;
        
        if (images[i].rotation !== 0) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (images[i].rotation === 90 || images[i].rotation === 270) {
            canvas.width = imgObj.height; canvas.height = imgObj.width;
          } else {
            canvas.width = imgObj.width; canvas.height = imgObj.height;
          }
          ctx.translate(canvas.width/2, canvas.height/2);
          ctx.rotate((images[i].rotation * Math.PI) / 180);
          ctx.drawImage(imgObj, -imgObj.width/2, -imgObj.height/2);
          finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        }

        const rotatedImgObj = await loadImage(finalDataUrl);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const m = parseInt(settings.margin);
        
        let availWidth = pageWidth - (m * 2);
        let availHeight = pageHeight - (m * 2);
        
        // Ensure image fits exactly without distortion (contain)
        const imgRatio = rotatedImgObj.width / rotatedImgObj.height;
        const pageRatio = availWidth / availHeight;
        let finalW, finalH;
        
        if (imgRatio > pageRatio) {
          finalW = availWidth; finalH = availWidth / imgRatio;
        } else {
          finalH = availHeight; finalW = availHeight * imgRatio;
        }
        
        const x = m + (availWidth - finalW) / 2;
        const y = m + (availHeight - finalH) / 2;
        
        doc.addImage(finalDataUrl, 'JPEG', x, y, finalW, finalH);
      }
      doc.save('DocMate_Document.pdf');
      setStep(2);
    } catch (e) {
      alert("Failed to generate PDF. Images might be too large.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload Images', 'Arrange & Config', 'Done']} />
      {step === 0 && <Dropzone onFileSelect={handleFiles} accept="image/*" multiple title="Drop images to bundle into a PDF" />}
      
      {step === 1 && (
        <div className="grid lg:grid-cols-4 gap-6">
           <Card className="lg:col-span-3 p-6 bg-slate-900/40">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-semibold text-white">Pages ({images.length})</h3>
               <label className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                  + Add More <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
               </label>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {images.map((img, i) => (
                 <div key={img.id} className="relative group bg-slate-950 rounded-xl border border-slate-800 p-2 flex flex-col">
                   <div className="flex justify-between items-center mb-2 px-1">
                     <span className="text-xs text-slate-500 font-medium">Page {i + 1}</span>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => moveImage(i, -1)} disabled={i===0} className="p-1 hover:text-cyan-400 disabled:opacity-30"><MoveLeft className="w-3 h-3"/></button>
                       <button onClick={() => moveImage(i, 1)} disabled={i===images.length-1} className="p-1 hover:text-cyan-400 disabled:opacity-30"><MoveRight className="w-3 h-3"/></button>
                     </div>
                   </div>
                   <div className="aspect-[3/4] bg-slate-900 rounded overflow-hidden flex items-center justify-center relative">
                     <img src={img.url} alt="thumb" style={{transform: `rotate(${img.rotation}deg)`}} className="max-w-full max-h-full object-contain transition-transform" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => rotateImage(img.id)} className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700"><RotateCw className="w-4 h-4"/></button>
                        <button onClick={() => removeImage(img.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"><Trash2 className="w-4 h-4"/></button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </Card>
           
           <Card className="p-6 h-fit space-y-6">
             <h3 className="font-semibold text-white border-b border-slate-800 pb-2">PDF Settings</h3>
             <div>
               <label className="text-sm text-slate-400 block mb-2">Page Size</label>
               <select value={settings.format} onChange={e => setSettings({...settings, format: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500">
                 <option value="a4">A4</option>
                 <option value="letter">US Letter</option>
               </select>
             </div>
             <div>
               <label className="text-sm text-slate-400 block mb-2">Orientation</label>
               <select value={settings.orientation} onChange={e => setSettings({...settings, orientation: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500">
                 <option value="portrait">Portrait</option>
                 <option value="landscape">Landscape</option>
               </select>
             </div>
             <div>
               <label className="text-sm text-slate-400 block mb-2">Margin</label>
               <select value={settings.margin} onChange={e => setSettings({...settings, margin: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500">
                 <option value={0}>No Margin</option>
                 <option value={10}>Small (10mm)</option>
                 <option value={20}>Medium (20mm)</option>
               </select>
             </div>
             <Button className="w-full mt-4" onClick={generatePDF} isLoading={isProcessing} disabled={images.length===0}>Generate PDF</Button>
           </Card>
        </div>
      )}

      {step === 2 && (
        <Card className="p-10 text-center max-w-lg mx-auto">
           <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-white mb-2">PDF Ready</h2>
           <p className="text-slate-400 mb-8">Your PDF contains {images.length} pages.</p>
           <Button variant="outline" onClick={() => { setStep(0); setImages([]); }}>Create Another</Button>
        </Card>
      )}
    </div>
  );
};

const PdfToImages = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { index, url, selected }
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('image/jpeg');

  const handlePdfUpload = async (f) => {
    if(f.type !== 'application/pdf') return setError("Please upload a valid PDF.");
    setFile(f); setStep(1); setIsProcessing(true); setError(null);
    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const loadedPages = [];
      
      // Render first few pages or all if small to prevent browser freeze.
      // For large PDFs, we render thumbnails scaled down.
      for(let i = 1; i <= pdf.numPages; i++) {
         const page = await pdf.getPage(i);
         const viewport = page.getViewport({ scale: 1.5 }); // Good quality for export/preview
         const canvas = document.createElement('canvas');
         canvas.width = viewport.width; canvas.height = viewport.height;
         await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
         loadedPages.push({ index: i, url: canvas.toDataURL(format, 0.9), selected: true, canvasRef: canvas });
      }
      setPages(loadedPages);
    } catch (e) {
      setError("Could not read PDF. It might be corrupted or password protected.");
      setStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePage = (index) => setPages(pages.map(p => p.index === index ? {...p, selected: !p.selected} : p));
  const toggleAll = (val) => setPages(pages.map(p => ({...p, selected: val})));

  const downloadSelected = async () => {
    const selected = pages.filter(p => p.selected);
    if(selected.length === 0) return;
    
    if(selected.length === 1) {
      // Direct download
      const ext = format === 'image/jpeg' ? 'jpg' : 'png';
      triggerDownload(selected[0].url, `Page_${selected[0].index}.${ext}`);
      return;
    }
    
    // ZIP Download
    setIsProcessing(true);
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    selected.forEach(p => {
       zip.file(`Page_${p.index}.${ext}`, p.url.split(',')[1], {base64: true});
    });
    const content = await zip.generateAsync({type:"blob"});
    triggerDownload(URL.createObjectURL(content), `${file.name.replace('.pdf','')}_images.zip`);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload PDF', 'Select Pages', 'Download']} />
      
      {step === 0 && <Dropzone onFileSelect={handlePdfUpload} accept="application/pdf" title="Drop PDF to extract pages as images" />}
      
      {step === 1 && (
        <Card className="p-6">
           {error && <ErrorBox message={error} />}
           {isProcessing && !pages.length && (
             <div className="py-20 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
               Rendering PDF pages...
             </div>
           )}
           
           {!isProcessing && pages.length > 0 && (
             <>
               <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <div>
                   <h3 className="font-semibold text-white">{file.name}</h3>
                   <div className="text-xs text-slate-400">{pages.length} Pages • {pages.filter(p=>p.selected).length} Selected</div>
                 </div>
                 <div className="flex items-center gap-3">
                   <Button variant="ghost" size="sm" onClick={() => toggleAll(true)}>Select All</Button>
                   <Button variant="ghost" size="sm" onClick={() => toggleAll(false)}>Deselect All</Button>
                   <select value={format} onChange={e => {setFormat(e.target.value); handlePdfUpload(file);}} className="bg-slate-800 text-white text-sm rounded px-2 py-1 outline-none border border-slate-700">
                     <option value="image/jpeg">Export as JPG</option>
                     <option value="image/png">Export as PNG</option>
                   </select>
                   <Button onClick={downloadSelected} isLoading={isProcessing} disabled={pages.filter(p=>p.selected).length===0}>
                     Download Selected
                   </Button>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-2">
                 {pages.map((p) => (
                   <div key={p.index} onClick={() => togglePage(p.index)} 
                        className={`relative cursor-pointer rounded-xl border-2 transition-all p-1 ${p.selected ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}>
                     <div className="aspect-[3/4] bg-white rounded overflow-hidden">
                       <img src={p.url} alt={`Page ${p.index}`} className="w-full h-full object-cover" />
                     </div>
                     <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded shadow backdrop-blur">
                       {p.index}
                     </div>
                     {p.selected && <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-0.5"><CheckCircle className="w-4 h-4"/></div>}
                   </div>
                 ))}
               </div>
             </>
           )}
        </Card>
      )}
    </div>
  );
};


const MergePdf = () => {
  const [files, setFiles] = useState([]); // { file, name, size, pageCount }
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (newFiles) => {
    const valid = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    if(valid.length === 0) return;
    setIsProcessing(true);
    const parsed = [];
    const { PDFDocument } = await loadPdfLib();
    for(const f of valid) {
       try {
         const ab = await f.arrayBuffer();
         const pdf = await PDFDocument.load(ab);
         parsed.push({ file: f, name: f.name, size: f.size, pageCount: pdf.getPageCount(), bytes: ab });
      } catch(e) { }
    }
    setFiles(prev => [...prev, ...parsed]);
    if (step === 0 && parsed.length > 0) setStep(1);
    setIsProcessing(false);
  };

  const moveFile = (index, dir) => {
    if (index + dir < 0 || index + dir >= files.length) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + dir]] = [newFiles[index + dir], newFiles[index]];
    setFiles(newFiles);
  };

  const processMerge = async () => {
    setIsProcessing(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const mergedPdf = await PDFDocument.create();
      for (const f of files) {
        const pdfDoc = await PDFDocument.load(f.bytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      triggerDownload(URL.createObjectURL(blob), 'Merged_Document.pdf');
      setStep(2);
    } catch (err) {
      alert("Failed to merge PDFs. A file might be corrupted or encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={step} steps={['Select PDFs', 'Order & Merge', 'Download']} />
      
      {step === 0 && <Dropzone onFileSelect={handleFiles} accept="application/pdf" multiple title="Drop PDFs to merge" />}
      
      {step === 1 && (
        <Card className="p-8">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-white">Order your PDFs ({files.length} files, {files.reduce((a,b)=>a+b.pageCount, 0)} total pages)</h3>
           </div>
           
           <div className="space-y-3 mb-8">
             {files.map((f, i) => (
               <div key={i} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="bg-slate-800 text-slate-400 w-8 h-8 flex items-center justify-center rounded-lg font-bold">{i + 1}</div>
                   <div>
                     <div className="text-slate-200 font-medium truncate max-w-xs md:max-w-md">{f.name}</div>
                     <div className="text-xs text-slate-500 flex gap-3">
                       <span>{formatBytes(f.size)}</span>
                       <span className="text-cyan-500/70">{f.pageCount} Pages</span>
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-1">
                   <button onClick={()=>moveFile(i,-1)} disabled={i===0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDownUp className="w-4 h-4 rotate-180"/></button>
                   <button onClick={()=>moveFile(i,1)} disabled={i===files.length-1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDownUp className="w-4 h-4"/></button>
                   <div className="w-px h-6 bg-slate-800 mx-1"></div>
                   <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4"/></button>
                 </div>
               </div>
             ))}
             <label className="block w-full text-center p-4 border border-dashed border-slate-700 rounded-xl text-slate-400 cursor-pointer hover:bg-slate-800 hover:text-white transition-colors">
                <input type="file" multiple accept="application/pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
                + Add More PDFs
             </label>
           </div>
           
           <div className="flex justify-end gap-4 border-t border-slate-800 pt-6">
             <Button variant="outline" onClick={() => { setStep(0); setFiles([]); }}>Cancel</Button>
             <Button onClick={processMerge} isLoading={isProcessing} disabled={files.length < 2}>Merge {files.length} PDFs</Button>
           </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-10 text-center max-w-md mx-auto">
           <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-white mb-6">Merge Successful</h2>
           <Button variant="outline" onClick={() => { setStep(0); setFiles([]); }}>Start New Merge</Button>
        </Card>
      )}
    </div>
  );
};

const SplitPdf = () => {
  const [file, setFile] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [step, setStep] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState('extract'); // extract, every, ranges
  const [rangeInput, setRangeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (f) => {
    if (f.type !== 'application/pdf') return;
    setFile(f);
    try {
      const arrayBuffer = await f.arrayBuffer();
      setPdfBytes(arrayBuffer);
      const { PDFDocument } = await loadPdfLib();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      setStep(1);
      setError(null);
    } catch (e) {
      setError("Could not read PDF. It might be password protected.");
    }
  };

  const processSplit = async () => {
    setIsProcessing(true); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const srcPdf = await PDFDocument.load(pdfBytes);
      const outputFiles = []; // { name, bytes }

      if (mode === 'every') {
        for(let i=0; i<pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(srcPdf, [i]);
          newPdf.addPage(page);
          outputFiles.push({ name: `Page_${i+1}.pdf`, bytes: await newPdf.save() });
        }
      } else {
        // Parse range input (e.g., "1-3, 5, 8")
        if (!rangeInput.trim()) throw new Error("Please enter a page range.");
        let pagesToExtract = new Set();
        const parts = rangeInput.split(',').map(s => s.trim());
        
        for (const p of parts) {
          if (p.includes('-')) {
            const [start, end] = p.split('-').map(Number);
            if (start && end && start <= end && start >=1 && end <= pageCount) {
              for (let i = start; i <= end; i++) pagesToExtract.add(i - 1);
            }
          } else {
            const num = Number(p);
            if (num && num >= 1 && num <= pageCount) pagesToExtract.add(num - 1);
          }
        }

        if (pagesToExtract.size === 0) throw new Error("Invalid range or out of bounds.");
        const indices = Array.from(pagesToExtract).sort((a,b)=>a-b);

        if (mode === 'extract') {
          // One PDF with these pages
          const newPdf = await PDFDocument.create();
          const copied = await newPdf.copyPages(srcPdf, indices);
          copied.forEach(p => newPdf.addPage(p));
          outputFiles.push({ name: `Extracted_${file.name}`, bytes: await newPdf.save() });
        } else if (mode === 'ranges') {
           // Treat each comma separated part as a separate file
           for (let idx = 0; idx < parts.length; idx++) {
              const p = parts[idx];
              let fileIndices = [];
              if (p.includes('-')) {
                const [start, end] = p.split('-').map(Number);
                for (let i = start; i <= end; i++) fileIndices.push(i - 1);
              } else {
                fileIndices.push(Number(p) - 1);
              }
              const newPdf = await PDFDocument.create();
              const copied = await newPdf.copyPages(srcPdf, fileIndices);
              copied.forEach(page => newPdf.addPage(page));
              outputFiles.push({ name: `Split_Part_${idx+1}.pdf`, bytes: await newPdf.save() });
           }
        }
      }

      // Download handling
      if (outputFiles.length === 1) {
        const blob = new Blob([outputFiles[0].bytes], { type: 'application/pdf' });
        triggerDownload(URL.createObjectURL(blob), outputFiles[0].name);
      } else {
        const JSZip = await loadJSZip();
        const zip = new JSZip();
        outputFiles.forEach(out => zip.file(out.name, out.bytes));
        const content = await zip.generateAsync({type:"blob"});
        triggerDownload(URL.createObjectURL(content), `Split_${file.name.replace('.pdf','')}.zip`);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload', 'Configure', 'Download']} />
      {step === 0 && <Dropzone onFileSelect={handleFile} accept="application/pdf" title="Drop PDF to split or extract" />}
      
      {step === 1 && (
        <Card className="p-8">
           {error && <ErrorBox message={error} />}
           <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-8 flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{file.name}</div>
                <div className="text-xs text-slate-500 mt-1">{formatBytes(file.size)}</div>
              </div>
              <Badge variant="blue">{pageCount} Pages</Badge>
           </div>
           
           <div className="grid md:grid-cols-3 gap-4 mb-8">
             <div onClick={()=>setMode('extract')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${mode==='extract'?'border-cyan-500 bg-cyan-500/10':'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
                <h4 className="font-semibold text-white mb-1">Extract Pages</h4>
                <p className="text-xs text-slate-400">Save specific pages into one new PDF.</p>
             </div>
             <div onClick={()=>setMode('ranges')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${mode==='ranges'?'border-cyan-500 bg-cyan-500/10':'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
                <h4 className="font-semibold text-white mb-1">Split by Ranges</h4>
                <p className="text-xs text-slate-400">Create multiple PDFs from ranges (e.g. 1-2, 3-4).</p>
             </div>
             <div onClick={()=>setMode('every')} className={`p-4 rounded-xl border cursor-pointer transition-colors ${mode==='every'?'border-cyan-500 bg-cyan-500/10':'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
                <h4 className="font-semibold text-white mb-1">Extract All</h4>
                <p className="text-xs text-slate-400">Save every page as a separate PDF in a ZIP.</p>
             </div>
           </div>

           {mode !== 'every' && (
             <div className="mb-8">
               <label className="block text-sm text-slate-300 mb-2 font-medium">Pages or Ranges</label>
               <input type="text" placeholder="e.g., 1, 3, 5-8" value={rangeInput} onChange={e => setRangeInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
               <p className="text-xs text-slate-500 mt-2">Separate with commas. Total pages available: {pageCount}.</p>
             </div>
           )}
           
           <div className="flex gap-4">
             <Button variant="ghost" onClick={() => setStep(0)}>Cancel</Button>
             <Button onClick={processSplit} isLoading={isProcessing} className="flex-1">Process & Download</Button>
           </div>
        </Card>
      )}
      
      {step === 2 && (
        <Card className="p-8 text-center max-w-sm mx-auto">
           <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-white mb-6">Success</h2>
           <Button variant="outline" onClick={() => { setStep(0); setFile(null); setRangeInput(''); }}>Process Another</Button>
        </Card>
      )}
    </div>
  );
};

const PdfOrganizer = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { origIndex, rotation, url, id }
  const [pdfBytes, setPdfBytes] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (f) => {
    if (f.type !== 'application/pdf') return setError("Invalid PDF");
    setFile(f); setIsProcessing(true); setError(null);
    try {
      const ab = await f.arrayBuffer();
      setPdfBytes(ab);
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument(ab).promise;
      const parsed = [];
      for(let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.6 }); // Thumbnail size
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        parsed.push({ id: Math.random().toString(), origIndex: i-1, rotation: 0, url: canvas.toDataURL() });
      }
      setPages(parsed);
    } catch(e) {
      setError("Failed to parse PDF pages.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const movePage = (index, dir) => {
    if (index + dir < 0 || index + dir >= pages.length) return;
    const n = [...pages];
    [n[index], n[index+dir]] = [n[index+dir], n[index]];
    setPages(n);
  };
  
  const rotatePage = (id) => setPages(pages.map(p => p.id === id ? {...p, rotation: (p.rotation + 90) % 360} : p));
  const deletePage = (id) => setPages(pages.filter(p => p.id !== id));
  const duplicatePage = (index) => {
    const toDup = pages[index];
    const n = [...pages];
    n.splice(index+1, 0, {...toDup, id: Math.random().toString()});
    setPages(n);
  };

  const exportPdf = async () => {
    if(pages.length === 0) return setError("No pages left to export.");
    setIsProcessing(true);
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const srcPdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      for(const p of pages) {
        const [copied] = await newPdf.copyPages(srcPdf, [p.origIndex]);
        if (p.rotation !== 0) {
           copied.setRotation(degrees(copied.getRotation().angle + p.rotation));
        }
        newPdf.addPage(copied);
      }
      const outBytes = await newPdf.save();
      const blob = new Blob([outBytes], {type: 'application/pdf'});
      triggerDownload(URL.createObjectURL(blob), `Organized_${file.name}`);
    } catch(e) {
      setError("Export failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!file ? (
        <Dropzone onFileSelect={handleUpload} accept="application/pdf" title="Upload PDF to organize pages" />
      ) : (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
             <div>
               <h3 className="text-lg font-bold text-white">{file.name}</h3>
               <p className="text-sm text-slate-400">Total {pages.length} pages. Reorder, rotate, or delete.</p>
             </div>
             <div className="flex gap-3">
               <Button variant="ghost" onClick={()=>setFile(null)}>Cancel</Button>
               <Button onClick={exportPdf} isLoading={isProcessing} disabled={pages.length===0}>Export PDF</Button>
             </div>
          </div>
          
          {error && <ErrorBox message={error} />}
          {isProcessing && pages.length === 0 ? (
            <div className="py-20 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500"/>Rendering thumbnails...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-2">
               {pages.map((p, i) => (
                 <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col group relative">
                    <div className="flex justify-between items-center mb-2 px-1 text-slate-400">
                      <span className="text-xs font-bold">{i + 1}</span>
                      <div className="flex gap-1">
                        <button onClick={()=>movePage(i,-1)} disabled={i===0} className="hover:text-white disabled:opacity-30"><MoveLeft className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>movePage(i,1)} disabled={i===pages.length-1} className="hover:text-white disabled:opacity-30"><MoveRight className="w-3.5 h-3.5"/></button>
                      </div>
                    </div>
                    <div className="aspect-[3/4] bg-white rounded overflow-hidden flex items-center justify-center border border-slate-700/50">
                       <img src={p.url} style={{transform:`rotate(${p.rotation}deg)`}} className="max-w-full max-h-full object-contain transition-transform" alt="thumb"/>
                    </div>
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-x-2 bottom-2 h-10 bg-slate-900/90 backdrop-blur-sm rounded translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex items-center justify-around px-2 border border-slate-700">
                       <button onClick={()=>rotatePage(p.id)} className="text-slate-300 hover:text-cyan-400 p-1" title="Rotate"><RotateCw className="w-4 h-4"/></button>
                       <button onClick={()=>duplicatePage(i)} className="text-slate-300 hover:text-blue-400 p-1" title="Duplicate"><Copy className="w-4 h-4"/></button>
                       <button onClick={()=>deletePage(p.id)} className="text-slate-300 hover:text-red-400 p-1" title="Delete"><Trash2 className="w-4 h-4"/></button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

const PassportPhotoMaker = () => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Custom reqs
  const [config, setConfig] = useState({ width: 35, height: 45, unit: 'mm', dpi: 300, maxSizeKB: 100, format: 'image/jpeg' });
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  const getPxDimensions = () => {
    if(config.unit === 'px') return { w: config.width, h: config.height };
    const factor = config.unit === 'mm' ? 25.4 : 2.54;
    return { w: Math.round((config.width * config.dpi) / factor), h: Math.round((config.height * config.dpi) / factor) };
  };

  const processPhoto = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = await fileToDataURL(file);
      const img = await loadImage(dataUrl);
      const canvas = canvasRef.current;
      
      const { w: targetW, h: targetH } = getPxDimensions();
      canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      
      // Fill white background for formal photos
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
      
      // Smart center crop
      const imgRatio = img.width / img.height;
      const targetRatio = targetW / targetH;
      
      let sX = 0, sY = 0, sW = img.width, sH = img.height;
      if (imgRatio > targetRatio) {
        sW = img.height * targetRatio;
        sX = (img.width - sW) / 2;
      } else {
        sH = img.width / targetRatio;
        sY = (img.height - sH) / 2;
      }
      
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetW, targetH);
      
      // Compression
      let bestQ = 0.95, finalUrl = '', size = Infinity;
      while (bestQ > 0.1) {
        finalUrl = canvas.toDataURL(config.format, bestQ);
        size = Math.round((finalUrl.length * 3) / 4);
        if (size <= config.maxSizeKB * 1024) break;
        bestQ -= 0.05;
      }
      
      setResult({ url: finalUrl, size });
      setStep(2);
    } catch (e) {
      alert("Error processing photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateA4 = async () => {
    const { jsPDF } = await loadJsPDF();
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const imgData = result.url;
    const wMM = config.unit === 'cm' ? config.width * 10 : (config.unit === 'px' ? (config.width*25.4)/config.dpi : config.width);
    const hMM = config.unit === 'cm' ? config.height * 10 : (config.unit === 'px' ? (config.height*25.4)/config.dpi : config.height);
    
    const startX = 10, startY = 10, gap = 5;
    const cols = Math.floor((210 - 20) / (wMM + gap));
    const rows = Math.floor((297 - 20) / (hMM + gap));
    
    for (let row = 0; row < Math.min(rows, 6); row++) {
      for (let col = 0; col < cols; col++) {
        doc.addImage(imgData, config.format === 'image/jpeg' ? 'JPEG' : 'PNG', startX + col * (wMM + gap), startY + row * (hMM + gap), wMM, hMM);
      }
    }
    doc.save('Passport_Photos_A4_Print.pdf');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload', 'Configure', 'Download']} />
      {step === 0 && <Dropzone onFileSelect={(f) => { setFile(f); setPreviewUrl(URL.createObjectURL(f)); setStep(1); }} accept="image/*" title="Upload portrait photo" />}
      
      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-8">
           <Card className="p-4 flex flex-col items-center justify-center bg-slate-950 h-[400px]">
             <div className="relative border-2 border-cyan-500 border-dashed p-1 h-full max-w-full flex items-center justify-center">
               <img src={previewUrl} alt="source" className="max-h-full max-w-full object-contain" />
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="w-[60%] h-[60%] border-2 border-white/40 rounded-[40%]"></div>
                 <div className="w-[80%] border-t border-white/20 mt-4"></div> {/* Shoulder line */}
               </div>
             </div>
             <p className="text-xs text-slate-500 mt-4 text-center">Auto-crop applied on generation. Keep face inside oval.</p>
           </Card>
           
           <Card className="p-6 space-y-5">
             <div className="flex justify-between items-center">
               <h3 className="font-semibold text-white">Requirements</h3>
               <select value={config.unit} onChange={e=>setConfig({...config, unit: e.target.value})} className="bg-slate-800 text-white text-xs px-2 py-1 rounded outline-none border border-slate-700">
                 <option value="mm">Millimeters (mm)</option>
                 <option value="cm">Centimeters (cm)</option>
                 <option value="px">Pixels (px)</option>
               </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs text-slate-400 block mb-1">Width ({config.unit})</label>
                 <input type="number" value={config.width} onChange={e=>setConfig({...config, width: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" />
               </div>
               <div>
                 <label className="text-xs text-slate-400 block mb-1">Height ({config.unit})</label>
                 <input type="number" value={config.height} onChange={e=>setConfig({...config, height: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs text-slate-400 block mb-1">Max File Size (KB)</label>
                 <input type="number" value={config.maxSizeKB} onChange={e=>setConfig({...config, maxSizeKB: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" />
               </div>
               <div>
                 <label className="text-xs text-slate-400 block mb-1">Format</label>
                 <select value={config.format} onChange={e=>setConfig({...config, format: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none">
                   <option value="image/jpeg">JPG</option>
                   <option value="image/png">PNG</option>
                 </select>
               </div>
             </div>
             
             <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl text-xs text-cyan-300">
                Custom presets supported. If your institution requires a specific ratio (e.g. 2x2 inch = 51x51 mm), set it above.
             </div>
             <div className="flex gap-3 pt-2">
               <Button variant="ghost" onClick={()=>setStep(0)}>Cancel</Button>
               <Button className="flex-1" onClick={processPhoto} isLoading={isProcessing}>Generate Final</Button>
             </div>
           </Card>
        </div>
      )}

      {step === 2 && result && (
        <Card className="p-10 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Your Photo is Ready</h2>
          <div className="flex flex-col items-center mb-8">
            <div className="p-2 bg-white rounded shadow-xl inline-block mb-4">
               <img src={result.url} alt="passport" className="object-cover" style={{height: '200px', width: `${200*(config.width/config.height)}px`}} /> 
            </div>
            <div className="text-sm text-slate-400 mb-1">Final Size: <strong className="text-white">{formatBytes(result.size)}</strong></div>
            <div className="text-xs text-slate-500">{config.width}x{config.height} {config.unit} • {config.format.split('/')[1].toUpperCase()}</div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => triggerDownload(result.url, `official_photo.${config.format.split('/')[1]}`)}>
               <Download className="w-4 h-4" /> Download Digital Copy
            </Button>
            <Button variant="secondary" onClick={generateA4}>
               <FileText className="w-4 h-4" /> Get A4 Print Sheet
            </Button>
          </div>
          <div className="mt-8"><Button variant="ghost" onClick={() => setStep(0)}>Create Another</Button></div>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const SignatureMaker = () => {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  const [config, setConfig] = useState({ targetWidth: 300, targetHeight: 100, maxSizeKB: 50, output: 'image/png' });
  const canvasRef = useRef(null);

  const processSignature = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = await fileToDataURL(file);
      const img = await loadImage(dataUrl);
      const canvas = canvasRef.current;
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      
      // Magic-wand extraction + bounding box calculation
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          
          if (brightness < 160) { // Dark ink detection
            data[i] = 10; data[i+1] = 10; data[i+2] = 20; data[i+3] = 255; // Enhance to dark blue/black
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          } else {
            // Background
            if(config.output === 'image/jpeg') {
              data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255;
            } else {
              data[i+3] = 0; // Transparent
            }
          }
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      const pad = 10;
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
      maxX = Math.min(canvas.width, maxX + pad); maxY = Math.min(canvas.height, maxY + pad);
      const cropW = maxX - minX; const cropH = maxY - minY;
      
      if (cropW <= 0 || cropH <= 0) throw new Error("No ink detected. Make sure the signature is dark enough.");

      // Final resize canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = config.targetWidth; outCanvas.height = config.targetHeight;
      const outCtx = outCanvas.getContext('2d');
      if (config.output === 'image/jpeg') {
         outCtx.fillStyle = '#FFFFFF';
         outCtx.fillRect(0,0, outCanvas.width, outCanvas.height);
      }
      
      // Draw centered
      const scale = Math.min(config.targetWidth / cropW, config.targetHeight / cropH) * 0.9;
      const finalW = cropW * scale; const finalH = cropH * scale;
      const dx = (config.targetWidth - finalW) / 2; const dy = (config.targetHeight - finalH) / 2;
      
      outCtx.drawImage(canvas, minX, minY, cropW, cropH, dx, dy, finalW, finalH);
      
      // Compress
      let bestQ = 1.0, finalUrl = '', size = Infinity;
      while(bestQ > 0.1) {
        finalUrl = outCanvas.toDataURL(config.output, bestQ);
        size = Math.round((finalUrl.length * 3) / 4);
        if(size <= config.maxSizeKB * 1024) break;
        bestQ -= 0.1;
      }
      
      setResult({ url: finalUrl, size });
      setStep(2);
    } catch (e) {
      alert(e.message || "Error processing signature.");
      setStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={step} steps={['Upload', 'Configure', 'Download']} />
      
      {step === 0 && <Dropzone onFileSelect={(f) => { setFile(f); setStep(1); }} accept="image/*" title="Upload signature photo" subtitle="Draw on white paper, snap a photo, and upload." />}
      
      {step === 1 && (
        <Card className="p-8">
           <div className="flex flex-col md:flex-row gap-8 items-center">
             <div className="flex-1 text-center w-full">
                <img src={URL.createObjectURL(file)} alt="source" className="max-h-48 mx-auto rounded border border-slate-700 mb-2" />
                <Badge variant="blue">Original: {formatBytes(file.size)}</Badge>
             </div>
             
             <div className="flex-1 space-y-4 w-full">
               <h3 className="font-semibold text-white">Target Requirements</h3>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Width (px)</label>
                   <input type="number" value={config.targetWidth} onChange={e=>setConfig({...config, targetWidth: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Height (px)</label>
                   <input type="number" value={config.targetHeight} onChange={e=>setConfig({...config, targetHeight: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Max KB</label>
                   <input type="number" value={config.maxSizeKB} onChange={e=>setConfig({...config, maxSizeKB: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Format</label>
                   <select value={config.output} onChange={e=>setConfig({...config, output: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                     <option value="image/png">PNG (Transparent)</option>
                     <option value="image/jpeg">JPG (White BG)</option>
                   </select>
                 </div>
               </div>
               <Button className="w-full mt-2" onClick={processSignature} isLoading={isProcessing}>Clean & Format Signature</Button>
             </div>
           </div>
        </Card>
      )}

      {step === 2 && result && (
        <Card className="p-10 text-center max-w-lg mx-auto">
           <h2 className="text-2xl font-bold text-white mb-6">Signature Ready</h2>
           
           <div className={`mx-auto inline-block mb-6 rounded-lg overflow-hidden border ${config.output==='image/png' ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgLz4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZWVlIiAvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2VlZSIgLz4KPC9zdmc+')]": 'bg-white'}`}>
              <img src={result.url} alt="signature" className="p-4 drop-shadow-md" style={{width: config.targetWidth, height: config.targetHeight}} />
           </div>
           
           <div className="flex justify-center gap-6 text-sm mb-8 text-slate-400">
             <div>Size: <strong className="text-white">{formatBytes(result.size)}</strong></div>
             <div>Dims: <strong className="text-white">{config.targetWidth}x{config.targetHeight}px</strong></div>
           </div>
           
           <div className="flex gap-4 justify-center">
             <Button variant="outline" onClick={() => setStep(0)}>Try Another</Button>
             <Button onClick={() => triggerDownload(result.url, `clean_signature.${config.output.split('/')[1]}`)}>
               <Download className="w-4 h-4" /> Download {config.output.split('/')[1].toUpperCase()}
             </Button>
           </div>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const SubmissionReady = ({ navigateToTool }) => {
  const [step, setStep] = useState(0);
  const [reqs, setReqs] = useState([
    { id: '1', name: 'Passport Photo', format: 'jpg', maxKB: 100, dims: '35x45', fixTool: 'passport-photo' },
    { id: '2', name: 'Signature', format: 'jpg', maxKB: 50, dims: '150x50', fixTool: 'signature-maker' },
    { id: '3', name: 'Resume', format: 'pdf', maxKB: 2048, fixTool: 'exact-compress' }
  ]);
  const [files, setFiles] = useState({}); // reqId -> file
  const [status, setStatus] = useState({}); // reqId -> { valid, msg }

  const validateFile = (reqId, file, req) => {
    let valid = true; let msgs = [];
    
    // Check format
    const ext = file.name.split('.').pop().toLowerCase();
    const typeMap = { 'jpg': ['jpg','jpeg'], 'png': ['png'], 'pdf': ['pdf'] };
    if (req.format !== 'any' && !typeMap[req.format]?.includes(ext)) {
      valid = false; msgs.push(`Format must be ${req.format.toUpperCase()} (is ${ext.toUpperCase()})`);
    }
    
    // Check size
    if (file.size > req.maxKB * 1024) {
      valid = false; msgs.push(`Too large: ${Math.round(file.size/1024)}KB > ${req.maxKB}KB limit`);
    }
    
    // Dimensions check skipped here for brevity, relies on size/format primarily for instant UI feedback.
    
    setStatus(prev => ({ ...prev, [reqId]: { valid, msg: valid ? 'READY' : msgs.join(', ') } }));
  };

  const handleUpload = (reqId, file) => {
    setFiles({...files, [reqId]: file});
    validateFile(reqId, file, reqs.find(r=>r.id===reqId));
  };

  const generateZip = async () => {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    reqs.forEach(req => {
       const f = files[req.id];
       if(f) zip.file(`${req.name.replace(/\s+/g, '_')}.${f.name.split('.').pop()}`, f);
    });
    const content = await zip.generateAsync({type:"blob"});
    triggerDownload(URL.createObjectURL(content), "Submission_Pack.zip");
  };

  const allValid = reqs.every(r => files[r.id] && status[r.id]?.valid);

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={step} steps={['Define Requirements', 'Validate Files', 'Download Pack']} />
      
      {step === 0 && (
        <Card className="p-8">
           <h2 className="text-xl font-bold text-white mb-6">Application Requirements</h2>
           <div className="space-y-4 mb-8">
             {reqs.map((req) => (
               <div key={req.id} className="grid grid-cols-4 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                 <input type="text" value={req.name} onChange={e => setReqs(reqs.map(r=>r.id===req.id?{...r, name:e.target.value}:r))} className="col-span-2 bg-transparent text-white font-medium border-b border-slate-700 outline-none focus:border-cyan-500" />
                 <select value={req.format} onChange={e => setReqs(reqs.map(r=>r.id===req.id?{...r, format:e.target.value}:r))} className="bg-slate-800 text-white rounded outline-none p-1 text-sm">
                   <option value="jpg">JPG</option><option value="png">PNG</option><option value="pdf">PDF</option><option value="any">Any</option>
                 </select>
                 <div className="flex items-center gap-1 text-sm">
                   <input type="number" value={req.maxKB} onChange={e => setReqs(reqs.map(r=>r.id===req.id?{...r, maxKB:Number(e.target.value)}:r))} className="w-16 bg-slate-800 text-white rounded px-2 py-1 outline-none text-right" /> KB
                 </div>
               </div>
             ))}
           </div>
           <div className="flex justify-between">
             <Button variant="outline" size="sm" onClick={() => setReqs([...reqs, {id:Date.now().toString(), name:'New Doc', format:'any', maxKB:1024}])}>+ Add Requirement</Button>
             <Button onClick={() => setStep(1)}>Next: Upload Files <ArrowRight className="w-4 h-4 ml-2" /></Button>
           </div>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-8">
           <h2 className="text-xl font-bold text-white mb-6">Upload & Validate</h2>
           <div className="space-y-4 mb-8">
             {reqs.map((req) => (
               <div key={req.id} className={`p-5 rounded-xl border transition-all ${!files[req.id] ? 'bg-slate-950 border-slate-800' : (status[req.id]?.valid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30')}`}>
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <div className="font-bold text-white mb-1">{req.name}</div>
                     <div className="text-xs text-slate-400">Req: {req.format.toUpperCase()} • Max {req.maxKB}KB</div>
                   </div>
                   {!files[req.id] ? (
                     <label className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors">
                       Upload <input type="file" className="hidden" accept={req.format!=='any'?`.${req.format}`:'*'} onChange={e => e.target.files[0] && handleUpload(req.id, e.target.files[0])} />
                     </label>
                   ) : (
                     <div className="flex items-center gap-2">
                       {status[req.id]?.valid ? (
                          <Badge variant="emerald"><CheckCircle className="w-3 h-3 inline mr-1"/> READY</Badge>
                       ) : (
                          <Badge variant="amber"><AlertTriangle className="w-3 h-3 inline mr-1"/> NEEDS FIX</Badge>
                       )}
                       <button onClick={()=>{const nf={...files}; delete nf[req.id]; setFiles(nf);}} className="p-1 text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
                     </div>
                   )}
                 </div>
                 {files[req.id] && !status[req.id]?.valid && (
                   <div className="mt-3 p-3 bg-slate-900 rounded-lg flex justify-between items-center text-sm">
                     <span className="text-red-400">{status[req.id].msg}</span>
                     {req.fixTool && <Button size="sm" onClick={() => navigateToTool(TOOLS.find(t=>t.id===req.fixTool))}>Fix in Tool <ArrowRight className="w-3 h-3 ml-1"/></Button>}
                   </div>
                 )}
               </div>
             ))}
           </div>
           
           <div className="flex justify-between">
             <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
             <Button onClick={() => setStep(2)} disabled={!allValid}>Generate ZIP Pack</Button>
           </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-10 text-center max-w-lg mx-auto">
           <FolderArchive className="w-16 h-16 text-blue-400 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-white mb-2">Ready for Submission!</h2>
           <p className="text-slate-400 mb-8">All files passed validation and are packed cleanly.</p>
           <Button size="lg" onClick={generateZip} className="w-full mb-4"><Download className="w-5 h-5 mr-2" /> Download Final ZIP</Button>
           <Button variant="ghost" onClick={() => setStep(0)}>Start Over</Button>
        </Card>
      )}
    </div>
  );
};

const extractPdfText = async (file) => {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
  const pages = [];

  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();
    if (text) pages.push(`Page ${index}:\n${text}`);
  }

  return pages.join('\n\n');
};

const getLocalDocumentResponse = (question, documentText) => {
  if (!documentText) {
    return 'I can work locally without an API, but I need a text-based PDF to read. Image OCR is not enabled yet. Try attaching a PDF and ask me to summarize it or find a specific detail.';
  }

  const sentences = documentText
    .split(/(?<=[.!?])\s+|\n+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 30);
  const normalizedQuestion = question.toLowerCase();
  const isSummaryRequest = /summar|overview|main points|key points|brief/i.test(normalizedQuestion);

  if (isSummaryRequest || !question.trim()) {
    const summary = sentences.slice(0, 5);
    return summary.length > 0
      ? `Local summary:\n\n${summary.map(sentence => `• ${sentence}`).join('\n')}`
      : 'I found the document, but there is not enough readable text to summarize.';
  }

  const stopWords = new Set(['what', 'which', 'where', 'when', 'does', 'this', 'that', 'with', 'from', 'about', 'have', 'into', 'your']);
  const terms = normalizedQuestion
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 2 && !stopWords.has(term));
  const matches = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: terms.reduce((score, term) => score + (sentence.toLowerCase().includes(term) ? 1 : 0), 0)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4);

  return matches.length > 0
    ? `I found these relevant passages:\n\n${matches.map(match => `• ${match.sentence}`).join('\n')}`
    : 'I could not find a matching passage in this document. Try using a more specific keyword or ask for a summary.';
};

const AIDocumentAssistant = () => {
  const [messages, setMessages] = useState([{ role: 'model', text: "Hello! I'm your local DocMate assistant. Attach a text-based PDF, then ask me to summarize it or find a specific detail." }]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null); // { file, mimeType, previewUrl, extractedText, isReading }
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileAttach = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Support Image and PDF
    if (!f.type.startsWith('image/') && f.type !== 'application/pdf') {
      alert('Only images and PDFs are currently supported for AI analysis.');
      return;
    }

    if (f.type === 'application/pdf') {
      setFile({ file: f, mimeType: f.type, previewUrl: null, extractedText: '', isReading: true });
      try {
        const extractedText = await extractPdfText(f);
        setFile(previous => previous ? { ...previous, extractedText, isReading: false } : previous);
      } catch (error) {
        setFile(previous => previous ? { ...previous, extractedText: '', isReading: false } : previous);
      }
    } else {
      const previewUrl = await fileToDataURL(f);
      setFile({ file: f, mimeType: f.type, previewUrl, extractedText: '', isReading: false });
    }
    e.target.value = null; // reset
  };

  const removeAttachedFile = () => setFile(null);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const attachedText = file?.extractedText || '';
    const userMessage = {
      role: 'user',
      text: input,
      fileName: file?.file?.name,
      previewUrl: file?.previewUrl,
      documentText: attachedText
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setFile(null);
    setIsLoading(true);

    try {
      const previousDocument = [...newMessages].reverse().find(message => message.documentText)?.documentText || '';
      const botResponseText = getLocalDocumentResponse(input, attachedText || previousDocument);
      setMessages([...newMessages, { role: 'model', text: botResponseText }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: "I couldn't read that document locally. Please try another PDF." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Local Document Assistant</h3>
          <p className="text-xs text-slate-400">Private, API-free summaries and document search in your browser.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Attached file rendering in chat history */}
              {msg.fileName && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Paperclip className="w-4 h-4 text-cyan-400" /> {msg.fileName}
                  </div>
                  {msg.previewUrl && (
                    <img src={msg.previewUrl} alt="attachment" className="max-h-48 rounded object-contain bg-slate-950" />
                  )}
                </div>
              )}
              
              {msg.text && (
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm shadow-md' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm shadow-sm'}`}>
                  {msg.text}
                  {msg.role === 'model' && idx > 0 && <div className="flex gap-3 mt-3 pt-3 border-t border-white/10"><button onClick={() => navigator.clipboard?.writeText(msg.text)} className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button><button onClick={() => triggerDownload(URL.createObjectURL(new Blob([msg.text], { type: 'text/plain' })), 'docmate-response.txt')} className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"><Download className="w-3 h-3" /> Export</button></div>}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-800 text-cyan-400 border border-cyan-500/30">
                <Loader2 className="w-4 h-4 animate-spin" />
             </div>
             <div className="bg-slate-800 border border-slate-700 text-slate-400 p-4 rounded-2xl rounded-tl-sm text-sm">
                Thinking...
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">{['Summarize this document', 'Find important dates', 'Extract contact details', 'Create study questions'].map(prompt => <button key={prompt} onClick={() => setInput(prompt)} className="whitespace-nowrap text-xs text-slate-400 border border-slate-800 rounded-full px-3 py-1.5 hover:text-cyan-300 hover:border-cyan-500/40">{prompt}</button>)}</div>
        {/* Attachment Staging */}
        {file && (
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-2 rounded-lg w-fit">
            {file.previewUrl ? (
              <img src={file.previewUrl} alt="preview" className="w-8 h-8 object-cover rounded bg-slate-800" />
            ) : (
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-slate-400" /></div>
            )}
            <span className="text-sm text-slate-300 truncate max-w-[200px]">{file.isReading ? 'Reading PDF...' : file.file.name}</span>
            <button onClick={removeAttachedFile} className="text-slate-500 hover:text-red-400 p-1"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Text Input */}
        <div className="flex items-end gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileAttach}
            accept="image/png, image/jpeg, image/webp, application/pdf"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors mb-1"
            title="Attach Image or PDF"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 min-h-[50px] max-h-[150px] resize-none focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
            rows="1"
          />
          
          <Button 
            onClick={handleSend} 
            disabled={isLoading || file?.isReading || (!input.trim() && !file)}
            className="mb-1 p-3 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <div className="text-center text-xs text-slate-500 mt-1">
          AI can make mistakes. Please verify important extracted information.
        </div>
      </div>
    </div>
  );
};

let tesseractPromise = null;
const loadTesseract = () => {
  if (tesseractPromise) return tesseractPromise;
  tesseractPromise = new Promise((resolve, reject) => {
    if (window.Tesseract) { resolve(window.Tesseract); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('Failed to load the local OCR engine.'));
    document.head.appendChild(script);
  });
  return tesseractPromise;
};

const PdfStampTool = ({ mode = 'watermark' }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState(mode === 'watermark' ? 'CONFIDENTIAL' : '');
  const [startAt, setStartAt] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processPdf = async () => {
    if (!file || (mode === 'watermark' && !text.trim())) return;
    setIsProcessing(true); setError(null);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await loadPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        if (mode === 'watermark') {
          page.drawText(text.trim(), {
            x: width / 2 - (text.length * 9), y: height / 2,
            size: 34, font, color: rgb(0.1, 0.65, 0.8), opacity: 0.25,
            rotate: degrees(-35)
          });
        } else {
          const label = `${text}${startAt + index}`;
          page.drawText(label, { x: width / 2 - (label.length * 3), y: 18, size: 10, font, color: rgb(0.25, 0.3, 0.4) });
        }
      });
      const bytes = await pdf.save();
      triggerDownload(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), `${mode === 'watermark' ? 'watermarked' : 'numbered'}_${file.name}`);
    } catch (err) {
      setError(err.message || 'Could not update this PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><Stamp className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold text-white">{mode === 'watermark' ? 'Watermark PDF' : 'Add Page Numbers'}</h2><p className="text-sm text-slate-400">Processed locally with pdf-lib. Your file never leaves this browser.</p></div>
        </div>
        {error && <ErrorBox message={error} />}
        {!file ? <Dropzone onFileSelect={setFile} accept="application/pdf" title="Upload a PDF" /> : (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center gap-3"><FileText className="text-cyan-400" /><span className="text-white truncate">{file.name}</span><Badge variant="blue">{formatBytes(file.size)}</Badge></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-400 mb-2">{mode === 'watermark' ? 'Watermark text' : 'Prefix'}</label><input value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'watermark' ? 'CONFIDENTIAL' : 'Page '} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500" /></div>
              {mode === 'numbers' && <div><label className="block text-sm text-slate-400 mb-2">Starting number</label><input type="number" min="1" value={startAt} onChange={e => setStartAt(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500" /></div>}
            </div>
            <div className="flex gap-3"><Button variant="outline" onClick={() => setFile(null)}>Choose Another</Button><Button className="flex-1" onClick={processPdf} isLoading={isProcessing}>Export PDF</Button></div>
          </div>
        )}
      </Card>
    </div>
  );
};

const ImageOcr = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const runOcr = async (selectedFile) => {
    setFile(selectedFile); setIsProcessing(true); setText(''); setError(null); setProgress(0);
    try {
      const Tesseract = await loadTesseract();
      const result = await Tesseract.recognize(selectedFile, 'eng', { logger: message => { if (message.progress) setProgress(Math.round(message.progress * 100)); } });
      setText(result.data.text.trim());
    } catch (err) {
      setError(err.message || 'OCR could not read this image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return <div className="max-w-5xl mx-auto"><Card className="p-8"><div className="flex items-start gap-3 mb-6"><div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><ScanText className="w-6 h-6" /></div><div><h2 className="text-xl font-bold text-white">Local Image OCR</h2><p className="text-sm text-slate-400">Recognize English text locally. The first run downloads the OCR model to your browser cache.</p></div></div>{error && <ErrorBox message={error} />}{!file ? <Dropzone onFileSelect={runOcr} accept="image/*" title="Upload an image to read" /> : <div className="grid lg:grid-cols-2 gap-6"><div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-center min-h-72"><img src={URL.createObjectURL(file)} alt="OCR source" className="max-h-80 max-w-full object-contain" /></div><div className="space-y-3">{isProcessing && <div className="text-sm text-cyan-300">Reading image... {progress}%</div>}<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Extracted text will appear here" className="w-full min-h-72 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 outline-none focus:border-cyan-500" />{text && <div className="flex gap-3"><Button variant="outline" onClick={() => navigator.clipboard?.writeText(text)}><Copy className="w-4 h-4" /> Copy text</Button><Button onClick={() => triggerDownload(URL.createObjectURL(new Blob([text], { type: 'text/plain' })), 'extracted-text.txt')}><Download className="w-4 h-4" /> Download TXT</Button></div>}<Button variant="ghost" onClick={() => { setFile(null); setText(''); }}>Read another image</Button></div></div>}</Card></div>;
};

const PdfCompare = () => {
  const [files, setFiles] = useState([null, null]);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const compare = async () => {
    if (!files[0] || !files[1]) return;
    setIsProcessing(true);
    try {
      const [first, second] = await Promise.all(files.map(extractPdfText));
      const firstLines = new Set(first.split(/\n+/).map(line => line.trim()).filter(Boolean));
      const secondLines = new Set(second.split(/\n+/).map(line => line.trim()).filter(Boolean));
      setResult({ added: [...secondLines].filter(line => !firstLines.has(line)).slice(0, 20), removed: [...firstLines].filter(line => !secondLines.has(line)).slice(0, 20) });
    } catch { setResult({ error: 'Could not extract text from one of these PDFs.' }); } finally { setIsProcessing(false); }
  };
  return <div className="max-w-4xl mx-auto"><Card className="p-8"><div className="flex items-start gap-3 mb-6"><div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><GitCompareArrows className="w-6 h-6" /></div><div><h2 className="text-xl font-bold text-white">Compare PDFs</h2><p className="text-sm text-slate-400">Compare extracted text locally. Layout and scanned-image differences need OCR.</p></div></div><div className="grid md:grid-cols-2 gap-4">{files.map((file, index) => <div key={index}>{file ? <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-sm text-white flex items-center gap-2"><FileText className="text-cyan-400" />{file.name}</div> : <Dropzone onFileSelect={selected => setFiles(current => current.map((item, itemIndex) => itemIndex === index ? selected : item))} accept="application/pdf" title={`Upload PDF ${index + 1}`} />}</div>)}</div>{files.every(Boolean) && <Button className="w-full mt-6" onClick={compare} isLoading={isProcessing}>Compare Documents</Button>}{result && !result.error && <div className="grid md:grid-cols-2 gap-4 mt-6"><div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><h3 className="font-semibold text-emerald-300 mb-3">Added text</h3><p className="text-sm text-slate-300 whitespace-pre-wrap">{result.added.join('\n') || 'No added text found.'}</p></div><div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"><h3 className="font-semibold text-amber-300 mb-3">Removed text</h3><p className="text-sm text-slate-300 whitespace-pre-wrap">{result.removed.join('\n') || 'No removed text found.'}</p></div></div>}{result?.error && <ErrorBox message={result.error} />}</Card></div>;
};

const PdfEditor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('Reviewed by DocMate');
  const [pageNumber, setPageNumber] = useState(1);
  const [x, setX] = useState(40);
  const [y, setY] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const exportPdf = async () => {
    if (!file || !text.trim()) return;
    setIsProcessing(true); setError(null);
    try {
      const { PDFDocument, rgb, StandardFonts } = await loadPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const page = pdf.getPages()[Math.max(0, Math.min(pageNumber - 1, pdf.getPageCount() - 1))];
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      page.drawText(text.trim(), { x: Number(x), y: Number(y), size: 16, font, color: rgb(0.05, 0.35, 0.65) });
      const bytes = await pdf.save();
      triggerDownload(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), `edited_${file.name}`);
    } catch (err) { setError(err.message || 'Could not export the edited PDF.'); } finally { setIsProcessing(false); }
  };
  return <div className="max-w-4xl mx-auto"><Card className="p-8"><div className="flex items-start gap-3 mb-6"><div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><FilePenLine className="w-6 h-6" /></div><div><h2 className="text-xl font-bold text-white">PDF Text Editor</h2><p className="text-sm text-slate-400">Add a text overlay to any page without uploading the document.</p></div></div>{error && <ErrorBox message={error} />}{!file ? <Dropzone onFileSelect={setFile} accept="application/pdf" title="Upload a PDF to edit" /> : <div className="space-y-5"><div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3"><FileText className="text-cyan-400" /><span className="text-white truncate">{file.name}</span></div><div className="grid sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><label className="block text-sm text-slate-400 mb-2">Text to add</label><input value={text} onChange={e => setText(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500" /></div>{[['Page', pageNumber, setPageNumber], ['X position', x, setX], ['Y position', y, setY]].map(([label, value, setter]) => <div key={label}><label className="block text-sm text-slate-400 mb-2">{label}</label><input type="number" min="0" value={value} onChange={e => setter(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500" /></div>)}</div><div className="text-xs text-slate-500">Coordinates use PDF points from the bottom-left corner. This lightweight editor currently supports text overlays; page annotations can be added without affecting the source file.</div><div className="flex gap-3"><Button variant="outline" onClick={() => setFile(null)}>Choose Another</Button><Button className="flex-1" onClick={exportPdf} isLoading={isProcessing}>Export Edited PDF</Button></div></div>}</Card></div>;
};

const DocumentScanner = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contrast, setContrast] = useState(1.15);
  const [grayscale, setGrayscale] = useState(true);
  const canvasRef = useRef(null);
  const processScan = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const { jsPDF } = await loadJsPDF();
      let pdf = null;
      for (const file of files) {
        const image = await loadImage(await fileToDataURL(file));
        const canvas = canvasRef.current;
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height); const data = pixels.data;
        for (let index = 0; index < data.length; index += 4) { if (grayscale) { const value = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114; data[index] = value; data[index + 1] = value; data[index + 2] = value; } data[index] = Math.max(0, Math.min(255, (data[index] - 128) * contrast + 128)); data[index + 1] = Math.max(0, Math.min(255, (data[index + 1] - 128) * contrast + 128)); data[index + 2] = Math.max(0, Math.min(255, (data[index + 2] - 128) * contrast + 128)); }
        context.putImageData(pixels, 0, 0);
        const orientation = image.width > image.height ? 'landscape' : 'portrait';
        if (!pdf) pdf = new jsPDF({ orientation, unit: 'px', format: [image.width, image.height] }); else pdf.addPage([image.width, image.height], orientation);
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, image.width, image.height);
      }
      pdf.save(`scanned_${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`);
    } finally { setIsProcessing(false); }
  };
  return <div className="max-w-4xl mx-auto"><Card className="p-8"><div className="flex items-start gap-3 mb-6"><div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><Camera className="w-6 h-6" /></div><div><h2 className="text-xl font-bold text-white">Document Scanner</h2><p className="text-sm text-slate-400">Capture or select multiple pages and export one clean PDF.</p></div></div>{!files.length ? <Dropzone onFileSelect={selected => setFiles(selected)} accept="image/*" multiple capture="environment" title="Capture or add scan pages" /> : <div className="space-y-5"><div className="grid grid-cols-3 sm:grid-cols-5 gap-3">{files.map((file, index) => <div key={`${file.name}-${index}`} className="relative"><img src={URL.createObjectURL(file)} alt={`Scan page ${index + 1}`} className="aspect-[3/4] w-full object-cover rounded-lg border border-slate-700" /><span className="absolute bottom-1 left-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-white">{index + 1}</span></div>)}</div><div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={grayscale} onChange={e => setGrayscale(e.target.checked)} className="accent-cyan-500" /> Black and white scan</label><div className="min-w-48"><label className="block text-sm text-slate-400 mb-2">Contrast: {contrast.toFixed(2)}</label><input type="range" min="0.8" max="1.8" step="0.05" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-cyan-500" /></div></div><div className="flex gap-3"><label className="inline-flex items-center justify-center font-medium rounded-xl text-sm px-4 py-2.5 gap-2 text-slate-300 border border-slate-600 hover:bg-slate-800 cursor-pointer"><Camera className="w-4 h-4" /> Add pages<input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => e.target.files?.length && setFiles(current => [...current, ...Array.from(e.target.files)])} /></label><Button variant="outline" onClick={() => setFiles([])}>Start over</Button><Button className="flex-1" onClick={processScan} isLoading={isProcessing}>Export {files.length}-page PDF</Button></div><canvas ref={canvasRef} className="hidden" /></div>}</Card></div>;
};

const ToolViewer = ({ tool, onBack, navigateToTool }) => {
  if (!tool) return null;

  const renderToolContent = () => {
    switch (tool.id) {
      case 'ai-assistant': return <AIDocumentAssistant />;
      case 'remove-bg': return <BackgroundRemover />;
      case 'exact-compress': return <ExactCompressor />;
      case 'image-converter': return <ImageConverter />;
      case 'image-to-pdf': return <ImageToPdf />;
      case 'pdf-to-images': return <PdfToImages />;
      case 'merge-pdf': return <MergePdf />;
      case 'split-pdf': return <SplitPdf />;
      case 'pdf-organizer': return <PdfOrganizer />;
      case 'passport-photo': return <PassportPhotoMaker />;
      case 'signature-maker': return <SignatureMaker />;
      case 'submission-ready': return <SubmissionReady navigateToTool={navigateToTool} />;
      case 'pdf-watermark': return <PdfStampTool />;
      case 'pdf-page-numbers': return <PdfStampTool mode="numbers" />;
      case 'image-ocr': return <ImageOcr />;
      case 'pdf-compare': return <PdfCompare />;
      case 'pdf-editor': return <PdfEditor />;
      case 'document-scanner': return <DocumentScanner />;
      default: return <div className="text-center py-20 text-slate-500">Tool not implemented yet.</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
      </button>
      
      <div className="mb-10 flex items-center gap-4">
        <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
          <tool.icon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{tool.name}</h1>
          <p className="text-slate-400">{tool.desc}</p>
        </div>
      </div>
      
      <div className="mt-8">{renderToolContent()}</div>
    </div>
  );
};

const Home = ({ navigate, navigateToTool, recentTools, searchQuery, setSearchQuery }) => (
  <div className="space-y-24 pb-20">
    <section className="text-center pt-20 pb-12 px-4 max-w-4xl mx-auto relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
      <Badge variant="cyan">Documents. Simplified.</Badge>
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-6 mb-6 tracking-tight leading-tight">
        Everything you need to <br className="hidden md:block"/> make your documents <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">ready.</span>
      </h1>
      <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
        Resize, compress, convert, edit and prepare files for college, jobs, applications and everyday work. Fast, secure, and right in your browser.
      </p>
      
      <div className="max-w-2xl mx-auto relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for a tool... (e.g., 'Compress PDF', 'Passport Photo')" 
          className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl shadow-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg"
          onFocus={() => navigate('all_tools')} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
        <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Files are processed locally on your device</span>
        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> No account required</span>
      </div>
    </section>

    {recentTools.length > 0 && (
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <Clock3 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Continue working</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTools.slice(0, 3).map(tool => (
            <button key={tool.id} onClick={() => navigateToTool(tool)} className="group flex items-center gap-4 text-left p-4 bg-slate-900/70 border border-slate-800 rounded-2xl hover:border-cyan-500/40 hover:bg-slate-900 transition-all">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20"><tool.icon className="w-5 h-5" /></div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{tool.name}</div>
                <div className="text-xs text-slate-500 truncate">{tool.category} tool</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-slate-600 group-hover:text-cyan-400" />
            </button>
          ))}
        </div>
      </section>
    )}

    <section className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Popular Tools</h2>
        <Button variant="ghost" onClick={() => navigate('all_tools')} className="hidden sm:flex">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.filter(t => t.popular).map(tool => (
          <Card key={tool.id} hover onClick={() => navigateToTool(tool)} className="p-6 group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-cyan-500/10 group-hover:text-cyan-400 text-slate-300 transition-colors">
                <tool.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{tool.name}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  </div>
);

const AllTools = ({ navigateToTool, initialSearch = '', favorites = [], toggleFavorite }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState(initialSearch);
  const filteredTools = TOOLS.filter(t => (filter === 'All' || t.category === filter) && (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">All Tools</h1>
        <p className="text-slate-400">Discover everything DocMate has to offer.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input type="text" placeholder="Search tools..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-cyan-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.length > 0 ? filteredTools.map(tool => (
          <Card key={tool.id} hover onClick={() => navigateToTool(tool)} className="p-6 group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-cyan-500/10 group-hover:text-cyan-400 text-slate-300 transition-colors"><tool.icon className="w-6 h-6" /></div>
              <button onClick={(event) => { event.stopPropagation(); toggleFavorite(tool.id); }} className={`p-2 rounded-lg transition-colors ${favorites.includes(tool.id) ? 'text-amber-300 bg-amber-400/10' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'}`} aria-label={`${favorites.includes(tool.id) ? 'Remove' : 'Add'} ${tool.name} favorite`}>
                <Star className="w-4 h-4" fill={favorites.includes(tool.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">{tool.name}</h3>
            <p className="text-sm text-slate-400 flex-grow">{tool.desc}</p>
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-500"><FolderArchive className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No tools found.</p></div>
        )}
      </div>
    </div>
  );
};

const WorkspaceDashboard = ({ navigate, navigateToTool, recentTools, favoriteTools, recentFiles, stats }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
      <div><Badge variant="cyan">PRIVATE WORKSPACE</Badge><h1 className="text-3xl sm:text-4xl font-bold text-white mt-3">Good to see you.</h1><p className="text-slate-400 mt-2">Your documents stay in this browser while you work.</p></div>
      <Button onClick={() => navigate('all_tools')}><FilePlus2 className="w-4 h-4" /> Start a task</Button>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(stat => <Card key={stat.label} className="p-4"><div className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</div><div className="text-2xl font-bold text-white mt-2">{stat.value}</div><div className="text-xs text-cyan-400 mt-1">{stat.detail}</div></Card>)}</div>
    <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6">
      <Card className="p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-semibold text-white">Continue working</h2><p className="text-sm text-slate-500 mt-1">Your most recent tools</p></div><History className="w-5 h-5 text-cyan-400" /></div>{recentTools.length ? <div className="grid sm:grid-cols-2 gap-3">{recentTools.slice(0, 4).map(tool => <button key={tool.id} onClick={() => navigateToTool(tool)} className="flex items-center gap-3 text-left p-3 rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/50 transition-colors"><tool.icon className="w-5 h-5 text-cyan-400" /><span className="text-sm text-slate-200 truncate">{tool.name}</span><ChevronRight className="w-4 h-4 ml-auto text-slate-600" /></button>)}</div> : <EmptyState icon={History} title="No recent tools" text="Open a tool and it will appear here." action="Browse tools" onClick={() => navigate('all_tools')} />}</Card>
      <Card className="p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-semibold text-white">Recent files</h2><p className="text-sm text-slate-500 mt-1">Metadata only, stored locally</p></div><Database className="w-5 h-5 text-cyan-400" /></div>{recentFiles.length ? <div className="space-y-3">{recentFiles.slice(0, 5).map(file => <div key={`${file.name}-${file.modified}`} className="flex items-center gap-3"><div className="p-2 rounded-lg bg-slate-800 text-slate-300"><FileText className="w-4 h-4" /></div><div className="min-w-0"><div className="text-sm text-slate-200 truncate">{file.name}</div><div className="text-xs text-slate-500">{formatBytes(file.size)}</div></div><span className="text-[10px] text-slate-600 ml-auto">{new Date(file.modified).toLocaleDateString()}</span></div>)}</div> : <EmptyState icon={FileText} title="No files yet" text="Upload a file in any tool to see it here." />}</Card>
    </div>
    <Card className="p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-semibold text-white">Favorite tools</h2><p className="text-sm text-slate-500 mt-1">Your fastest routes</p></div><Star className="w-5 h-5 text-amber-300" /></div>{favoriteTools.length ? <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{favoriteTools.map(tool => <button key={tool.id} onClick={() => navigateToTool(tool)} className="p-4 text-left rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-300/30"><tool.icon className="w-5 h-5 text-amber-300 mb-3" /><div className="text-sm font-medium text-white truncate">{tool.name}</div><div className="text-xs text-slate-500 mt-1">{tool.category}</div></button>)}</div> : <EmptyState icon={Star} title="Make your workspace yours" text="Favorite tools from All Tools for quick access." action="Find tools" onClick={() => navigate('all_tools')} />}</Card>
  </div>
);

const EmptyState = ({ icon: Icon, title, text, action, onClick }) => <div className="py-8 text-center"><Icon className="w-8 h-8 text-slate-700 mx-auto mb-3" /><div className="text-sm text-slate-300">{title}</div><div className="text-xs text-slate-500 mt-1">{text}</div>{action && <Button variant="ghost" size="sm" onClick={onClick} className="mt-3">{action} <ArrowRight className="w-3 h-3" /></Button>}</div>;

const WorkspaceSidebar = ({ view, navigate, isOpen, close, favoritesCount }) => {
  const links = [{ id: 'home', label: 'Workspace', icon: LayoutDashboard }, { id: 'recent', label: 'Recent files', icon: History }, { id: 'all_tools', label: 'All tools', icon: Grid }, { id: 'favorites', label: 'Favorites', icon: Star, count: favoritesCount }, { id: 'workflows', label: 'Workflows', icon: Workflow }, { id: 'privacy', label: 'Privacy center', icon: ShieldCheck }];
  return <><aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between mb-9"><button onClick={() => navigate('home')} className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-white">DocMate</span></button><button className="lg:hidden text-slate-400" onClick={close} aria-label="Close navigation"><X className="w-5 h-5" /></button></div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-3">Workspace</div><nav className="space-y-1">{links.map(link => <button key={link.id} onClick={() => navigate(link.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${view === link.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><link.icon className="w-4 h-4" />{link.label}{link.count ? <span className="ml-auto text-xs text-slate-600">{link.count}</span> : null}</button>)}</nav><div className="mt-auto p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5"><div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold"><Lock className="w-3.5 h-3.5" />Local-first mode</div><p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Files are processed in your browser. No account or API key required.</p></div></aside>{isOpen && <button className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={close} aria-label="Close navigation overlay" />}</>;
};

const RecentFilesView = ({ files, onClear }) => <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8"><div className="flex items-end justify-between mb-8"><div><Badge variant="cyan">LOCAL INDEX</Badge><h1 className="text-3xl font-bold text-white mt-3">Recent files</h1><p className="text-slate-400 mt-2">Only file names, sizes, and timestamps are remembered.</p></div>{files.length > 0 && <Button variant="outline" onClick={onClear}><Trash2 className="w-4 h-4" /> Clear history</Button>}</div>{files.length ? <Card className="divide-y divide-slate-800">{files.map(file => <div key={`${file.name}-${file.modified}`} className="p-4 flex items-center gap-4"><div className="p-3 rounded-xl bg-slate-800 text-cyan-400"><FileText className="w-5 h-5" /></div><div className="min-w-0 flex-1"><div className="text-white truncate">{file.name}</div><div className="text-sm text-slate-500 mt-1">{file.type || 'Unknown type'} · {formatBytes(file.size)}</div></div><div className="text-xs text-slate-600">{new Date(file.modified).toLocaleString()}</div></div>)}</Card> : <Card className="p-10"><EmptyState icon={History} title="Your file history is empty" text="Upload a document in any tool to start a local history." /></Card>}</div>;

const PrivacyCenter = ({ onClear }) => { const [storage, setStorage] = useState(0); useEffect(() => setStorage(new Blob(Object.values(localStorage)).size), []); return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8"><Badge variant="emerald">PRIVACY CENTER</Badge><h1 className="text-3xl font-bold text-white mt-3">Your files stay yours.</h1><p className="text-slate-400 mt-2 mb-8">DocMate is designed to process documents locally whenever the browser allows it.</p><div className="grid md:grid-cols-2 gap-4 mb-6">{[['Local processing', 'PDF, image, and conversion work happens in this browser.', Check], ['No external AI API', 'The assistant uses local extraction and retrieval only.', ShieldCheck], ['No account required', 'There is no sign-in or cloud document library.', Lock], ['Transparent storage', `${formatBytes(storage)} of local metadata currently stored.`, Database]].map(([title, text, Icon]) => <Card key={title} className="p-5"><Icon className="w-5 h-5 text-emerald-400 mb-4" /><h2 className="text-white font-semibold">{title}</h2><p className="text-sm text-slate-500 mt-2 leading-relaxed">{text}</p></Card>)}</div><Card className="p-6 border-amber-500/20"><h2 className="text-white font-semibold">Clear local data</h2><p className="text-sm text-slate-500 mt-2 mb-5">This clears recent tools, favorite tools, and recent file metadata. It does not delete files from your computer.</p><Button variant="danger" onClick={onClear}><Trash2 className="w-4 h-4" /> Clear local workspace data</Button></Card></div>; };

const Workflows = ({ navigateToTool }) => { const [saved, setSaved] = useState(() => readStoredJson('docmate-workflows', [])); const presets = [{ name: 'College application pack', desc: 'Validate photo, signature, and resume files.', tool: 'submission-ready' }, { name: 'Exam notes pack', desc: 'Merge notes, then summarize them locally.', tool: 'ai-assistant' }, { name: 'PDF cleanup', desc: 'Organize pages and add page numbers.', tool: 'pdf-organizer' }]; const save = name => { const next = [...saved, { name, created: Date.now() }]; setSaved(next); localStorage.setItem('docmate-workflows', JSON.stringify(next)); }; return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8"><Badge variant="cyan">WORKFLOWS</Badge><h1 className="text-3xl font-bold text-white mt-3">Repeatable document routines</h1><p className="text-slate-400 mt-2 mb-8">Start with a focused preset. Your saved workflow names stay local.</p><div className="grid md:grid-cols-3 gap-4">{presets.map(preset => <Card key={preset.name} hover className="p-5"><Workflow className="w-5 h-5 text-cyan-400 mb-4" /><h2 className="text-white font-semibold">{preset.name}</h2><p className="text-sm text-slate-500 mt-2 min-h-10">{preset.desc}</p><div className="flex gap-2 mt-5"><Button size="sm" onClick={() => navigateToTool(TOOLS.find(tool => tool.id === preset.tool))}>Open step</Button><Button size="sm" variant="ghost" onClick={() => save(preset.name)}>Save</Button></div></Card>)}</div>{saved.length > 0 && <Card className="p-6 mt-6"><h2 className="text-white font-semibold mb-4">Saved locally</h2><div className="space-y-2">{saved.map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950"><Check className="w-4 h-4 text-emerald-400" /><span className="text-sm text-slate-300">{item.name}</span><span className="ml-auto text-xs text-slate-600">{new Date(item.created).toLocaleDateString()}</span></div>)}</div></Card>}</div>; };

const InstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
    const handleInstallAvailable = event => { event.preventDefault(); setInstallEvent(event); };
    const handleInstalled = () => { setInstallEvent(null); setIsInstalled(true); };
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', handleInstallAvailable); window.removeEventListener('appinstalled', handleInstalled); };
  }, []);
  if (isInstalled) return null;
  const install = async () => {
    if (!installEvent) { setIsHelpOpen(true); return; }
    await installEvent.prompt();
    setInstallEvent(null);
  };
  return <>
    <button onClick={install} className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:from-blue-500 hover:to-cyan-400" aria-label="Get the DocMate app">
      <Download className="w-4 h-4" /> Get the app
    </button>
    {isHelpOpen && <div className="fixed inset-0 z-[80] bg-black/70 p-4 flex items-center justify-center" onClick={() => setIsHelpOpen(false)}><div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6" onClick={event => event.stopPropagation()}><div className="flex items-start gap-3"><div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><Download className="w-5 h-5" /></div><div><h2 className="text-lg font-semibold text-white">Add DocMate to your phone</h2><p className="text-sm text-slate-400 mt-1">DocMate works as an installable app and keeps your local workspace on this device.</p></div></div><div className="space-y-3 mt-6 text-sm text-slate-300"><div><strong className="text-white">Android Chrome</strong><p className="text-slate-500 mt-1">Tap the browser menu, then choose “Install app” or “Add to Home screen”.</p></div><div><strong className="text-white">iPhone Safari</strong><p className="text-slate-500 mt-1">Tap Share, then choose “Add to Home Screen”.</p></div><div><strong className="text-white">Desktop Chrome or Edge</strong><p className="text-slate-500 mt-1">Use the install icon in the address bar or the browser menu.</p></div></div><Button variant="outline" className="w-full mt-6" onClick={() => setIsHelpOpen(false)}>Close</Button></div></div>}
  </>;
};

const DownloadToast = () => {
  const [download, setDownload] = useState(null);
  useEffect(() => {
    const handleDownload = event => setDownload(event.detail);
    window.addEventListener('docmate-download', handleDownload);
    return () => window.removeEventListener('docmate-download', handleDownload);
  }, []);
  if (!download) return null;
  return <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[75] w-auto sm:w-96 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl" role="status" aria-live="polite"><div className="flex items-start gap-3"><div className={`p-2 rounded-lg ${download.status === 'preparing' ? 'bg-cyan-500/10 text-cyan-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{download.status === 'preparing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}</div><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-white">{download.status === 'preparing' ? 'Preparing your download...' : 'Download complete'}</div><div className="text-xs text-slate-400 mt-1 truncate" title={download.filename}>{download.filename}</div>{download.status === 'complete' && <div className="flex gap-2 mt-3"><Button size="sm" onClick={() => window.open(download.url, '_blank', 'noopener,noreferrer')}><FileText className="w-4 h-4" /> Open file</Button><Button size="sm" variant="ghost" onClick={() => setDownload(null)}>Dismiss</Button></div>}</div><button onClick={() => setDownload(null)} className="p-1 text-slate-500 hover:text-white" aria-label="Dismiss download notification"><X className="w-4 h-4" /></button></div></div>;
};

export default function App() {
  const [view, setView] = useState('home');
  const [activeTool, setActiveTool] = useState(null);
  const [recentTools, setRecentTools] = useState(() => readStoredJson('docmate-recent-tools', []).map(item => TOOLS.find(tool => tool.id === item.id)).filter(Boolean));
  const [favorites, setFavorites] = useState(() => readStoredJson('docmate-favorites', []));
  const [recentFiles, setRecentFiles] = useState(() => readStoredJson('docmate-recent-files', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [uploadRef] = useState(() => React.createRef());

  const refreshFiles = () => setRecentFiles(readStoredJson('docmate-recent-files', []));
  const navigate = (newView, replace = false) => { setView(newView); setIsMenuOpen(false); refreshFiles(); window.scrollTo(0, 0); if (window.history.state?.docmateView !== newView) { const method = replace ? 'replaceState' : 'pushState'; window.history[method]({ docmateView: newView }, '', window.location.href); } };
  const navigateToTool = tool => { if (!tool) return; setActiveTool(tool); setRecentTools(previous => { const next = [tool, ...previous.filter(item => item.id !== tool.id)].slice(0, 8); localStorage.setItem('docmate-recent-tools', JSON.stringify(next.map(item => ({ id: item.id })))); return next; }); navigate('tool_view'); };
  const toggleFavorite = id => setFavorites(previous => { const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]; localStorage.setItem('docmate-favorites', JSON.stringify(next)); return next; });
  const clearLocalData = () => { ['docmate-recent-tools', 'docmate-favorites', 'docmate-recent-files', 'docmate-workflows'].forEach(key => localStorage.removeItem(key)); setRecentTools([]); setFavorites([]); setRecentFiles([]); };

  useEffect(() => { window.history.replaceState({ docmateView: 'home' }, '', window.location.href); const onPopState = event => { setIsMenuOpen(false); setIsCommandOpen(false); setActiveTool(null); setView(event.state?.docmateView || 'home'); refreshFiles(); }; const onKeyDown = event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setIsCommandOpen(true); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'u') { event.preventDefault(); uploadRef.current?.click(); } if (event.key === 'Escape') { setIsCommandOpen(false); setIsMenuOpen(false); } }; window.addEventListener('popstate', onPopState); window.addEventListener('keydown', onKeyDown); return () => { window.removeEventListener('popstate', onPopState); window.removeEventListener('keydown', onKeyDown); }; }, [uploadRef]);
  const favoriteTools = favorites.map(id => TOOLS.find(tool => tool.id === id)).filter(Boolean);
  const stats = [{ label: 'Recent files', value: recentFiles.length, detail: 'stored locally' }, { label: 'Favorite tools', value: favoriteTools.length, detail: 'quick routes' }, { label: 'Available tools', value: TOOLS.length, detail: 'browser-first' }, { label: 'Cloud uploads', value: '0', detail: 'by design' }];
  const page = view === 'home' ? <WorkspaceDashboard navigate={navigate} navigateToTool={navigateToTool} recentTools={recentTools} favoriteTools={favoriteTools} recentFiles={recentFiles} stats={stats} /> : view === 'recent' ? <RecentFilesView files={recentFiles} onClear={() => { localStorage.removeItem('docmate-recent-files'); setRecentFiles([]); }} /> : view === 'favorites' ? <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8"><Badge variant="cyan">FAVORITES</Badge><h1 className="text-3xl font-bold text-white mt-3 mb-8">Your favorite tools</h1>{favoriteTools.length ? <div className="grid md:grid-cols-3 gap-5">{favoriteTools.map(tool => <Card key={tool.id} hover onClick={() => navigateToTool(tool)} className="p-6"><tool.icon className="w-6 h-6 text-amber-300 mb-4" /><h2 className="text-white font-semibold">{tool.name}</h2><p className="text-sm text-slate-500 mt-2">{tool.desc}</p></Card>)}</div> : <Card className="p-8"><EmptyState icon={Star} title="No favorites yet" text="Star a tool in All Tools to pin it here." action="Browse tools" onClick={() => navigate('all_tools')} /></Card>}</div> : view === 'all_tools' ? <AllTools navigateToTool={navigateToTool} initialSearch={searchQuery} favorites={favorites} toggleFavorite={toggleFavorite} /> : view === 'workflows' ? <Workflows navigateToTool={navigateToTool} /> : view === 'privacy' ? <PrivacyCenter onClear={clearLocalData} /> : <ToolViewer tool={activeTool} onBack={() => navigate('all_tools')} navigateToTool={navigateToTool} />;

  if (MAINTENANCE_MODE) return <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center px-6"><div className="w-full max-w-lg text-center"><div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.35)]"><FileText className="w-8 h-8 text-white" /></div><Badge variant="cyan">TEMPORARILY UNAVAILABLE</Badge><h1 className="text-4xl font-bold text-white mt-5">We’ll be back soon.</h1><p className="text-slate-400 mt-4 leading-relaxed">DocMate is currently undergoing a quick update. Your local documents remain on your device, and the workspace will be available again shortly.</p><div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Maintenance in progress</div></div></div>;
  return <div className="min-h-screen font-sans dark bg-slate-950 text-slate-300 selection:bg-cyan-500/30"><WorkspaceSidebar view={view} navigate={navigate} isOpen={isMenuOpen} close={() => setIsMenuOpen(false)} favoritesCount={favorites.length} /><div className="lg:pl-64"><header className="sticky top-0 z-40 h-16 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800"><div className="h-full px-4 sm:px-6 flex items-center gap-3"><button className="lg:hidden p-2 text-slate-300" onClick={() => setIsMenuOpen(true)} aria-label="Open navigation"><Menu className="w-5 h-5" /></button><button onClick={() => setIsCommandOpen(true)} className="flex-1 max-w-xl flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:border-slate-700 text-sm text-left"><Search className="w-4 h-4" /><span className="flex-1">Search tools and workflows...</span><span className="hidden sm:flex items-center gap-1 text-[10px] border border-slate-700 rounded px-1.5 py-0.5"><Command className="w-3 h-3" />K</span></button><div className="ml-auto flex items-center gap-2"><Badge variant="emerald"><Lock className="w-3 h-3 inline mr-1" />Local</Badge><button onClick={() => navigate('privacy')} className="p-2 text-slate-500 hover:text-white" aria-label="Open privacy center"><ShieldCheck className="w-5 h-5" /></button></div></div></header><main className="min-h-[calc(100vh-64px)] pb-20 lg:pb-0">{page}</main><footer className="border-t border-slate-800 px-6 py-6 text-xs text-slate-600 flex justify-between"><span>DocMate · Local-first document workspace</span><button onClick={() => navigate('privacy')} className="hover:text-slate-300">Privacy center</button></footer></div><nav className="lg:hidden fixed bottom-0 inset-x-0 z-[65] border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]"><div className="grid grid-cols-4 gap-1"><button onClick={() => navigate('home')} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${view === 'home' ? 'text-cyan-300' : 'text-slate-500'}`}><LayoutDashboard className="w-4 h-4" />Workspace</button><button onClick={() => navigate('all_tools')} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${view === 'all_tools' || view === 'tool_view' ? 'text-cyan-300' : 'text-slate-500'}`}><Grid className="w-4 h-4" />Tools</button><button onClick={() => navigate('recent')} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${view === 'recent' ? 'text-cyan-300' : 'text-slate-500'}`}><History className="w-4 h-4" />Recent</button><button onClick={() => navigate('favorites')} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${view === 'favorites' ? 'text-cyan-300' : 'text-slate-500'}`}><Star className="w-4 h-4" />Favorites</button></div></nav><InstallPrompt /><DownloadToast /><input ref={uploadRef} type="file" className="hidden" onChange={event => { if (event.target.files?.[0]) { rememberRecentFile(event.target.files[0]); refreshFiles(); navigate('recent'); } event.target.value = null; }} />{isCommandOpen && <div className="fixed inset-0 z-[80] bg-black/70 p-4 flex items-start justify-center pt-[12vh]" onClick={() => setIsCommandOpen(false)}><div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden" onClick={event => event.stopPropagation()}><div className="p-4 border-b border-slate-800 flex items-center gap-3"><Search className="w-5 h-5 text-cyan-400" /><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search tools..." className="flex-1 bg-transparent outline-none text-white" /><button onClick={() => setIsCommandOpen(false)} aria-label="Close search"><X className="w-5 h-5 text-slate-500" /></button></div><div className="max-h-80 overflow-y-auto p-2">{TOOLS.filter(tool => `${tool.name} ${tool.desc}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8).map(tool => <button key={tool.id} onClick={() => { setIsCommandOpen(false); navigateToTool(tool); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-slate-800"><tool.icon className="w-5 h-5 text-cyan-400" /><span className="text-sm text-white">{tool.name}</span><span className="text-xs text-slate-600 ml-auto">{tool.category}</span></button>)}{!TOOLS.some(tool => `${tool.name} ${tool.desc}`.toLowerCase().includes(searchQuery.toLowerCase())) && <div className="p-6 text-center text-sm text-slate-500">No matching tools.</div>}</div></div></div>}</div>;
}