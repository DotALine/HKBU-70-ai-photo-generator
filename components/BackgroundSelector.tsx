
import React from 'react';
import { BackgroundScene } from '../types';
import { CheckCircle, ImageOff } from 'lucide-react';

// Using direct download links for Google Drive IDs
export const DEFAULT_BACKGROUNDS: BackgroundScene[] = [
  {
    id: 'hkbu-aab',
    name: 'AAB building',
    url: 'https://drive.google.com/uc?export=view&id=1-M8RV41safYBTfoTwHy4TDxYYGXyerU5',
    description: 'The iconic Academic and Administration Building, a centerpiece of the HKBU campus.'
  },
  {
    id: 'hkbu-library',
    name: 'Library',
    url: 'https://drive.google.com/uc?export=view&id=1nZVSPIdM4-xkaBXboT4-ClMsNdoYBnk-',
    description: 'The modern university library, providing a focused environment for learning.'
  },
  {
    id: 'hkbu-cafeteria',
    name: 'Cafeteria',
    url: 'https://drive.google.com/uc?export=view&id=1GPWs1mxtfgjUvU1mZCBQ2saVIpp-g6q6',
    description: 'The Harmony Cafeteria, known for its vibrant interior and social atmosphere.'
  }
];

interface BackgroundSelectorProps {
  scenes: BackgroundScene[];
  selectedId: string | null;
  onSelect: (scene: BackgroundScene) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  scenes, 
  selectedId, 
  onSelect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {scenes.map((scene) => (
        <div 
          key={scene.id}
          onClick={() => onSelect(scene)}
          className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
            selectedId === scene.id 
              ? 'ring-4 ring-[#01499b] scale-[1.02] shadow-xl shadow-[#01499b]/20' 
              : 'hover:scale-[1.02] hover:shadow-lg bg-gray-50'
          }`}
        >
          <img 
            src={scene.url} 
            alt={scene.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Fallback if Drive link fails or is private
              e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1000&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-white font-bold text-lg">{scene.name}</h3>
            <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
              {scene.description}
            </p>
          </div>
          
          {selectedId === scene.id && (
            <div className="absolute top-3 right-3 bg-[#01499b] text-white p-1 rounded-full shadow-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
