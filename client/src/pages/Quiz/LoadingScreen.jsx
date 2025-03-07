import React, { useState, useEffect } from 'react';
import { Loader2, Brain } from 'lucide-react';
import Lottie from 'lottie-react';
import { LOTTIE_ANIMATIONS } from './constants';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <Brain className="w-24 h-24 text-blue-500 animate-pulse" />
          {/* <Loader2 className="w-12 h-12 text-blue-300 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> */}
        </div>
        <h2 className="text-2xl font-bold text-white animate-pulse">Generating Your Quiz...</h2>
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;