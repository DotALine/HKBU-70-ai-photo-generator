
import { BackgroundScene } from '../types';
import { Button } from './Button';
import { Lock, Image as ImageIcon, ArrowLeft, Plus, Trash2, Database, RefreshCcw, Settings2 } from 'lucide-react';
import React, { useState } from 'react';

interface DeveloperPortalProps {
  onBack: () => void;
  onUpdateScenes: (scenes: BackgroundScene[]) => void;
  currentScenes: BackgroundScene[];
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ 
  onBack, 
  onUpdateScenes, 
  currentScenes
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  // Background Management State
  const [name, setName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [sceneToReplace, setSceneToReplace] = useState<string | null>(null);

  const isFull = currentScenes.length >= 3;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'HKBU70') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid passcode. Access denied.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      
      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920; 
          const scale = Math.min(1, MAX_WIDTH / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setPreview(compressed);
          }
          setIsProcessingFile(false);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull && !sceneToReplace) {
        alert("Please select a scene to replace.");
        return;
    }

    if (name && preview) {
      const newScene: BackgroundScene = {
        id: `custom-${Date.now()}`,
        name,
        description: 'Custom developer background',
        url: preview
      };

      let newScenesList = [...currentScenes];
      if (isFull && sceneToReplace) {
        newScenesList = newScenesList.map(s => s.id === sceneToReplace ? newScene : s);
      } else {
        newScenesList.push(newScene);
      }

      onUpdateScenes(newScenesList);
      setName('');
      setPreview(null);
      setSceneToReplace(null);
      alert('Background saved!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-gray-200 shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-4 rounded-full bg-[#01499b]/10 text-[#01499b]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Developer Access</h2>
          <p className="text-gray-500 text-center text-sm">
            Enter the secure passcode to manage the platform.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter Passcode"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#01499b] outline-none"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <div className="flex gap-3">
             <button type="button" onClick={onBack} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors">Back</button>
             <Button type="submit" className="flex-1">Unlock</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#01499b] transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to App
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-[#01499b]">Developer Dashboard</h2>
          <p className="text-xs text-gray-400">HKBU 70th Admin Console</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-[#01499b]" />
              {isFull ? 'Replace a Scene' : 'Add New Scene'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500">Scene Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Campus Courtyard"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#01499b] outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500">Scene Image (4:3 Recommended)</label>
                        <div className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden group">
                            {preview ? (
                                <>
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-medium">Click to change</p>
                                </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                {isProcessingFile ? <RefreshCcw className="w-10 h-10 mb-2 animate-spin" /> : <ImageIcon className="w-10 h-10 mb-2" />}
                                <p>{isProcessingFile ? 'Processing...' : 'Upload Image'}</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isProcessingFile} />
                        </div>
                    </div>
                </div>

                {isFull && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                        <p className="text-amber-800 text-sm mb-3 font-medium text-center">Select one to replace:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {currentScenes.map(scene => (
                                <div key={scene.id} onClick={() => setSceneToReplace(scene.id)} className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${sceneToReplace === scene.id ? 'border-red-500 ring-2 ring-red-200 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                    <img src={scene.url} alt={scene.name} className="w-full h-full object-cover" />
                                    {sceneToReplace === scene.id && <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-500" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button type="submit" className="w-full" disabled={!preview || !name || (isFull && !sceneToReplace) || isProcessingFile} variant={isFull ? "danger" : "primary"}>
                    {isFull ? "Confirm Replacement" : "Save to Booth"}
                </Button>
            </form>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2"><Database className="w-5 h-5" /> Active Scenes</h3>
            <div className="space-y-4">
                {currentScenes.map((scene) => (
                    <div key={scene.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 transition-colors hover:bg-white">
                        <img src={scene.url} alt={scene.name} className="h-16 w-16 object-cover rounded-lg bg-gray-200 flex-shrink-0" />
                        <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 truncate text-sm">{scene.name}</h4>
                            <div className="mt-1 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#01499b]/10 text-[#01499b] font-bold uppercase w-fit">Active</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
