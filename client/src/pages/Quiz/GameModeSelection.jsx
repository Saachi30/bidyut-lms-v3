import React from "react";
import { Brain, Users } from "lucide-react";

const GameModeSelection = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-10">
        <h1 className="text-5xl font-extrabold text-white animate-fade-in drop-shadow-lg font-heading">
          Choose Your Learning Adventure!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Practice Mode Card */}
          <button
            onClick={() => onSelectMode("practice")}
            className="group p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 
                      hover:from-blue-500 hover:to-blue-700 
                      transform hover:-translate-y-3 transition-all duration-300
                      shadow-xl hover:shadow-blue-500/50 border border-blue-400/50
                      backdrop-blur-md bg-opacity-80"
          >
            <Brain className="w-20 h-20 text-white mb-5 mx-auto transition-transform duration-300 group-hover:scale-125" />
            <h2 className="text-3xl font-bold text-white mb-2">Practice Mode</h2>
            <p className="text-blue-200 text-lg">Learn at your own pace</p>
          </button>

          {/* 1v1 Battle Card */}
          <button
            onClick={() => onSelectMode("1v1")}
            className="group p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 
                      hover:from-purple-500 hover:to-purple-700 
                      transform hover:-translate-y-3 transition-all duration-300
                      shadow-xl hover:shadow-purple-500/50 border border-purple-400/50
                      backdrop-blur-md bg-opacity-80"
          >
            <Users className="w-20 h-20 text-white mb-5 mx-auto transition-transform duration-300 group-hover:scale-125" />
            <h2 className="text-3xl font-bold text-white mb-2">1v1 Battle</h2>
            <p className="text-purple-200 text-lg">Challenge opponents!</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelection;
