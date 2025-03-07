import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import Lottie from "lottie-react";
import { LOTTIE_ANIMATIONS } from "./constants";

const SearchingOpponent = () => {
  const [searchingAnimation, setSearchingAnimation] = useState(null);

  useEffect(() => {
    LOTTIE_ANIMATIONS.SEARCHING().then((animation) => {
      setSearchingAnimation(animation.default);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        {/* Lottie Animation */}
        <div className="relative w-64 h-64 mx-auto">
          {searchingAnimation ? (
            <Lottie animationData={searchingAnimation} loop />
          ) : (
            <Users className="w-24 h-24 text-purple-500 animate-pulse mx-auto" />
          )}
        </div>

        {/* Text Content */}
        <h2 className="text-3xl font-bold text-white animate-pulse">
          Finding Your Opponent...
        </h2>
        <p className="text-purple-300">Matching you with a worthy challenger!</p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchingOpponent;
