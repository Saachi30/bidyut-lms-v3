import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Lottie from 'lottie-react';
import { LOTTIE_ANIMATIONS } from './constants';

const ErrorScreen = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative w-48 h-48 mx-auto">
          <Lottie 
            animationData={LOTTIE_ANIMATIONS.SAD_ROBOT}
            loop={true}
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <AlertTriangle className="w-24 h-24 text-red-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-red-500">Oops!</h2>
        <p className="text-white text-lg">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                   font-medium transition-all duration-200 transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;