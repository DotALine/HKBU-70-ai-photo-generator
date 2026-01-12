
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadSection } from './components/UploadSection';
import { BackgroundSelector, DEFAULT_BACKGROUNDS } from './components/BackgroundSelector';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { DeveloperPortal } from './components/DeveloperPortal';
import { Button } from './components/Button';
import { generateCompositeScene } from './services/geminiService';
import { addWatermarkToImage } from './services/imageUtils';
import { AppState, BackgroundScene, Coordinate } from './types';
import { Layers, Wand2, RefreshCcw, Download, ArrowRight, User, Shield, ArrowLeft, Trophy, Sparkles } from 'lucide-react';

// ============================================================================
// APP CONSTANTS & TYPES
// ============================================================================
const LOGO_HKBU_URL = "https://image2url.com/images/1765897606349-3c07426e-b3de-4602-ac23-7ababd2c8d73.svg";
const LOGO_70TH_URL = "https://image2url.com/images/1765897259008-afc0713c-70b6-4e14-9568-857bc4ff6806.png";
const WATERMARK_TEXT = "HKBU 70th Anniversary AI Photobooth";

const CONFETTI_COLORS = [
  '#002d61', // HKBU Navy
  '#C5A059', // HKBU Gold
  '#C0C0C0'  // Silver
];

interface ConfettiProps {
  x: number;
  y: number;
}

// ============================================================================
// DECORATIVE COMPONENTS
// ============================================================================

const ConfettiBurst: React.FC<ConfettiProps> = ({ x, y }) => {
  // 40 particles per burst for a rich celebratory feel
  const particles = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {particles.map((_, i) => {
        // Distribute particles in a circular spread
        const angle = (Math.PI * 2 * i) / (particles.length / 2) + (Math.random() * 0.5);
        const distance = 80 + Math.random() * 160;
        const size = 6 + Math.random() * 8;
        const isCircle = Math.random() > 0.5;
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const duration = 1.5 + Math.random() * 1.5;
        const rotation = 360 + Math.random() * 720;
        
        return (
          <div
            key={i}
            className="absolute animate-confetti-burst"
            style={{
              left: x,
              top: y,
              width: `${size}px`,
              height: isCircle ? `${size}px` : `${size * 0.7}px`,
              backgroundColor: color,
              borderRadius: isCircle ? '999px' : '2px',
              '--dx': `${Math.cos(angle) * distance}px`,
              // Add vertical bias for a gravity/fall effect
              '--dy': `${Math.sin(angle) * distance + 120}px`,
              '--dr': `${rotation}deg`,
              '--duration': `${duration}s`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

const CelebrationDecor: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
    <svg className="absolute -left-20 top-0 w-[500px] h-[800px] text-hkbu-navy/10 animate-pulse" style={{ animationDuration: '8s' }} viewBox="0 0 200 800">
      <path d="M0,0 C50,200 150,400 50,800" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round" />
    </svg>
    <svg className="absolute -right-20 top-40 w-[400px] h-[600px] text-hkbu-gold/20" viewBox="0 0 200 600">
      <path d="M200,0 C100,150 50,300 200,600" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="round" />
    </svg>
    <div className="absolute top-[15%] left-[10%] w-4 h-4 bg-hkbu-gold rounded-full opacity-20 animate-bounce" style={{ animationDuration: '4s' }}></div>
    <div className="absolute top-[45%] right-[15%] w-6 h-6 bg-hkbu-navy rounded-full opacity-10 animate-bounce" style={{ animationDuration: '6s' }}></div>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const [backgrounds, setBackgrounds] = useState<BackgroundScene[]>(() => {
    try {
      const savedScenes = localStorage.getItem('scene_composer_backgrounds');
      return savedScenes ? JSON.parse(savedScenes) : DEFAULT_BACKGROUNDS;
    } catch (error) {
      return DEFAULT_BACKGROUNDS;
    }
  });

  const [personImage, setPersonImage] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundScene | null>(null);
  const [targetCoordinate, setTargetCoordinate] = useState<Coordinate | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const positionSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBackground && positionSectionRef.current) {
      setTimeout(() => {
        positionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedBackground]);

  const handleGlobalClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if click is on an interactive element to avoid triggering confetti when using buttons/inputs
    const isInteractive = target.closest('button, a, input, canvas, .container section');
    
    if (!isInteractive) {
      const id = Date.now();
      setBursts(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      // Cleanup confetti burst after animation finishes (approx 3s)
      setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== id));
      }, 3000);
    }
  }, []);

  const resetApp = () => {
    setPersonImage(null);
    setSelectedBackground(null);
    setTargetCoordinate(null);
    setGeneratedImage(null);
    setAppState(AppState.UPLOAD);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!personImage || !selectedBackground || !targetCoordinate) return;
    setIsProcessing(true);
    setError(null);
    setAppState(AppState.GENERATING);
    try {
      const bgBase64 = await (async (url: string) => {
        if (url.startsWith('data:')) return url;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      })(selectedBackground.url);
      
      const rawResult = await generateCompositeScene(personImage, bgBase64, targetCoordinate.x, targetCoordinate.y);
      const watermarkedResult = await addWatermarkToImage(rawResult, WATERMARK_TEXT);
      setGeneratedImage(watermarkedResult);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      setError(err.message);
      setAppState(AppState.POSITION_ACTORS);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-hkbu-cream font-sans relative overflow-x-hidden cursor-default"
      onClick={handleGlobalClick}
    >
      <CelebrationDecor />
      
      {bursts.map(b => (
        <ConfettiBurst key={b.id} x={b.x} y={b.y} />
      ))}

      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-hkbu-gold/20 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
                <img src={LOGO_HKBU_URL} alt="HKBU" className="h-10 w-auto" />
                <img src={LOGO_70TH_URL} alt="HKBU 70th" className="h-8 w-auto" />
            </div>
            <button 
              onClick={resetApp}
              className="font-serif text-2xl font-black text-hkbu-navy tracking-tight hidden lg:block"
            >
              Main Page
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setAppState(AppState.DEVELOPER_PORTAL)} className="text-gray-300 hover:text-hkbu-navy">
              <Shield size={20} />
            </button>
            {appState !== AppState.UPLOAD && (
              <Button onClick={resetApp} variant="secondary" className="px-5 py-2 text-sm border-none bg-gray-50">Reset</Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 relative z-10">
        {appState === AppState.UPLOAD ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="text-center mb-16 relative">
              <h1 className="font-serif text-6xl md:text-7xl font-black text-hkbu-navy mb-4 tracking-tight leading-tight">
                HKBU 70th <span className="text-hkbu-gold italic">Photo Booth</span>
              </h1>
              <p className="text-hkbu-navy/60 text-xl font-medium max-w-2xl mx-auto">
                Upload a photo of people, choose a background, and place them anywhere in the scene.
              </p>
            </div>
            <div className="w-full max-w-xl bg-white/60 backdrop-blur-md p-3 rounded-[3rem] shadow-2xl border border-white">
              <UploadSection onImageVerified={(base64) => { setPersonImage(base64); setAppState(AppState.SELECT_BACKGROUND); }} />
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {appState === AppState.RESULT && generatedImage ? (
              <div className="max-w-4xl mx-auto text-center space-y-10 animate-scale-in">
                <h2 className="font-serif text-5xl font-black text-hkbu-navy">Creation Complete</h2>
                <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden transform hover:rotate-1 transition-transform">
                  <img src={generatedImage} alt="Result" className="w-full rounded-2xl shadow-inner" />
                </div>
                <div className="flex justify-center gap-6">
                  <a href={generatedImage} download="hkbu-photo.png" className="bg-hkbu-navy text-white px-12 py-5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
                    <Download size={24} /> Download
                  </a>
                  <Button onClick={resetApp} variant="secondary" className="px-12 rounded-full">New Session</Button>
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-12">
                <section className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-hkbu-gold/10">
                  <h2 className="font-serif text-3xl font-bold text-hkbu-navy mb-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-hkbu-gold text-white rounded-2xl flex items-center justify-center font-bold shadow-lg transform rotate-3">1</div>
                    Select Background
                  </h2>
                  <BackgroundSelector 
                    scenes={backgrounds}
                    selectedId={selectedBackground?.id || null} 
                    onSelect={(s) => { setSelectedBackground(s); setAppState(AppState.POSITION_ACTORS); }} 
                  />
                </section>

                {selectedBackground && (
                  <section ref={positionSectionRef} className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-hkbu-gold/10 animate-fade-in scroll-mt-28">
                    <h2 className="font-serif text-3xl font-bold text-hkbu-navy mb-10 flex items-center gap-4">
                      <div className="w-12 h-12 bg-hkbu-gold text-white rounded-2xl flex items-center justify-center font-bold shadow-lg transform -rotate-3">2</div>
                      Set Position
                    </h2>
                    <InteractiveCanvas 
                      backgroundUrl={selectedBackground.url} 
                      onPositionSelected={setTargetCoordinate}
                      selectedCoordinate={targetCoordinate}
                    />
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {(appState === AppState.POSITION_ACTORS || appState === AppState.SELECT_BACKGROUND) && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
           <Button 
              onClick={handleGenerate} 
              disabled={!selectedBackground || !targetCoordinate || isProcessing}
              isLoading={isProcessing}
              className="w-full h-18 rounded-full text-xl shadow-2xl bg-gradient-to-r from-hkbu-gold to-hkbu-goldLight text-white font-black"
            >
              Generate Image <Wand2 className="ml-2" />
            </Button>
        </div>
      )}
    </div>
  );
};

export default App;
