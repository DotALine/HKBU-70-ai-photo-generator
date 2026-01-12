
import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Image as ImageIcon, ArrowRight, RefreshCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { validateHumanPresence } from '../services/geminiService';
import { Button } from './Button';

interface UploadSectionProps {
  onImageVerified: (base64: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageVerified }) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedPreview, setVerifiedPreview] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    setIsValidating(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const result = await validateHumanPresence(base64);
        if (result.valid) {
          setVerifiedPreview(base64);
        } else {
          setError(result.reason || "We couldn't detect any people in this photo.");
        }
      } catch (err) {
        setError("There was an error verifying your photo.");
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  }, []);

  if (!hasConsented) {
    return (
      <div className="w-full p-8 text-[#002d61]">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#002d61]">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-3xl font-black uppercase">Start Creation</h3>
          <div className="text-sm space-y-4 text-left bg-gray-50 p-6 rounded-3xl">
            <p className="font-bold">Guidelines:</p>
            <ul className="space-y-2">
              <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 mt-1" /> Use clear photos of individuals or groups.</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 mt-1" /> AI will automatically remove the background.</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 mt-1" /> Photos are processed securely via Google Gemini.</li>
            </ul>
          </div>
          <Button onClick={() => setHasConsented(true)} className="w-full h-14" variant="primary">Agree & Start</Button>
        </div>
      </div>
    );
  }

  if (verifiedPreview) {
    return (
      <div className="w-full p-8 space-y-6 text-[#002d61]">
        <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-2xl font-bold">
          <CheckCircle /> Photo Verified
        </div>
        <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl">
          <img src={verifiedPreview} className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setVerifiedPreview(null)} className="flex-1">Retry</Button>
          <Button variant="primary" onClick={() => onImageVerified(verifiedPreview)} className="flex-1">Continue <ArrowRight size={20} /></Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 ${isDragging ? 'border-hkbu-navy bg-blue-50 scale-95' : 'border-gray-200 bg-white hover:border-hkbu-navy'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} disabled={isValidating} />
      <div className="flex flex-col items-center gap-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isValidating ? 'bg-hkbu-navy text-white animate-spin' : 'bg-gray-100 text-hkbu-navy'}`}>
          {isValidating ? <RefreshCcw size={32} /> : <UserPlus size={32} />}
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-[#002d61]">{isValidating ? "Validating..." : "Upload Your Photo"}</h3>
          <p className="text-gray-400 font-medium mt-1">Drag and drop or click to browse</p>
        </div>
        {!isValidating && <div className="bg-[#002d61] text-white px-8 py-2 rounded-full font-bold text-sm">Select Image</div>}
      </div>
      {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
    </div>
  );
};
