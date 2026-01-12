
import React, { useState } from 'react';
import { GalleryImage } from '../types';
import { ArrowLeft, ImageOff, Clock, Star, X } from 'lucide-react';

interface GalleryProps {
  images: GalleryImage[];
  onBack: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Sorting: isStarred (true first), then timestamp (newest first)
  const sortedImages = [...images].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return b.timestamp - a.timestamp;
  });

  const closeLightbox = () => setSelectedImage(null);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#01499b] transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Booth
        </button>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-[#01499b]">Community Gallery</h2>
          <p className="text-gray-500">See what others have created</p>
        </div>
      </div>

      {sortedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <ImageOff className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No photos have been uploaded yet.</p>
          <button 
            onClick={onBack}
            className="mt-4 text-[#01499b] hover:underline font-bold"
          >
            Be the first to create!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedImages.map((image) => (
            <div 
              key={image.id} 
              onClick={() => setSelectedImage(image)}
              className={`group bg-white rounded-2xl overflow-hidden shadow-lg border transition-all hover:shadow-2xl hover:-translate-y-1 cursor-zoom-in ${image.isStarred ? 'border-yellow-200 ring-2 ring-yellow-50 shadow-yellow-100/50' : 'border-gray-100'}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={image.url} 
                  alt="Gallery" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {image.isStarred && (
                  <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-yellow-500 animate-fade-in">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Featured</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[#01499b] font-bold text-xs shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      View Full Image
                   </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-white border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(image.timestamp).toLocaleDateString()}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${image.isStarred ? 'text-yellow-600' : 'text-[#01499b]/40'}`}>
                  HKBU 70th
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            className="fixed top-6 right-6 z-[210] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:rotate-90 shadow-2xl group"
          >
            <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>
          
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.url} 
              alt="Gallery Full Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />
            
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {new Date(selectedImage.timestamp).toLocaleDateString()}
                </span>
                {selectedImage.isStarred && (
                   <span className="bg-yellow-400 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Featured Creation</span>
                )}
              </div>
              <h3 className="text-white/40 font-bold tracking-[0.2em] text-xs uppercase">HKBU 70th Anniversary Platform</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
