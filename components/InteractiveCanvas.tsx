
import React, { useRef, useState, useEffect } from 'react';
import { Coordinate } from '../types';
import { MapPin } from 'lucide-react';

interface InteractiveCanvasProps {
  backgroundUrl: string;
  onPositionSelected: (coord: Coordinate) => void;
  selectedCoordinate: Coordinate | null;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ 
  backgroundUrl, 
  onPositionSelected, 
  selectedCoordinate 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onPositionSelected({ x, y });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#01499b]" />
          Click where people should stand
        </h3>
        {selectedCoordinate && (
            <span className="text-sm text-[#01499b] font-mono font-medium bg-[#01499b]/10 px-2 py-1 rounded">
                X: {Math.round(selectedCoordinate.x)}%, Y: {Math.round(selectedCoordinate.y)}%
            </span>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl cursor-crosshair border border-gray-200 bg-gray-100 group"
        onClick={handleClick}
      >
        <img 
          src={backgroundUrl} 
          alt="Scene Background" 
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />

        {/* Selected Marker */}
        {selectedCoordinate && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
            style={{ 
              left: `${selectedCoordinate.x}%`, 
              top: `${selectedCoordinate.y}%` 
            }}
          >
            <div className="relative">
                <MapPin className="w-10 h-10 text-[#01499b] fill-[#01499b] drop-shadow-lg filter" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 blur-[2px] rounded-full" />
            </div>
          </div>
        )}
      </div>
      
      <p className="text-center text-gray-500 text-sm">
        The AI will blend lighting and perspective based on this location.
      </p>
    </div>
  );
};
