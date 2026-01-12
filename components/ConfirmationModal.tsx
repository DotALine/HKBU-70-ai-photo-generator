
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl scale-in">
        <p className="text-gray-700 text-lg font-medium text-center mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 px-6 rounded-xl font-bold bg-blue-100 border-2 border-[#01499b] text-[#002d61] hover:bg-blue-200 transition-colors"
          >
            confirm
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 px-6 rounded-xl font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};
