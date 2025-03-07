import React from 'react';
import { Trophy, Brain, X } from 'lucide-react';
import Lottie from 'lottie-react';

// Simplified animation constant
const LOTTIE_ANIMATIONS = {
  CELEBRATION: () => import('../../assets/quiz/celebration.json'),
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'hard':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const QuestionCard = ({
  question,
  currentQuestion,
  totalQuestions,
  onAnswer,
  gameMode,
  timeLeft,
  scores,
  opponent,
  showConfetti,
  showIncorrect
}) => {
  const [celebrationAnimation, setCelebrationAnimation] = React.useState(null);

  React.useEffect(() => {
    const loadAnimation = async () => {
      const celebrationModule = await LOTTIE_ANIMATIONS.CELEBRATION();
      setCelebrationAnimation(celebrationModule.default);
    };
    loadAnimation();
  }, []);

  return (
    <div className={`
      relative w-full max-w-${gameMode === '1v1' ? '4xl' : '2xl'} h-full
      mx-auto bg-gray-900 rounded-xl shadow-lg p-8 
      border-2 ${gameMode === '1v1' ? 'border-purple-500' : 'border-blue-500'}
    `}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl">
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 opacity-50" />
      </div>
      
      <div className="relative z-10">
        {gameMode === '1v1' ? (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-purple-400">You</p>
                <h3 className="text-2xl font-bold text-white">{scores.player}</h3>
              </div>
              <div className="w-16 h-16">
                <Trophy className="text-yellow-400 w-full h-full animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm text-purple-400">{opponent?.name}</p>
                <h3 className="text-2xl font-bold text-white">{scores.opponent}</h3>
              </div>
            </div>
            <div className="bg-purple-900 rounded-full px-4 py-2">
              <span className="text-2xl font-bold text-white">{timeLeft}s</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-bold text-blue-400">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span className="text-3xl font-bold text-blue-500">
                {currentQuestion + 1}/{totalQuestions}
              </span>
            </div>
            <div className="w-16 h-16">
              <Brain className="w-full h-full text-blue-500 animate-pulse" />
            </div>
          </div>
        )}

        <div className="w-full h-3 bg-gray-700 rounded-full mb-6">
          <div
            className={`h-full ${gameMode === '1v1' ? 'bg-purple-500' : 'bg-blue-500'} 
                     rounded-full transition-all duration-300`}
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{question.question}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(option)}
              className={`
                w-full text-left p-6 rounded-lg border-2 
                ${gameMode === '1v1' 
                  ? 'border-purple-500 hover:border-purple-400' 
                  : 'border-blue-500 hover:border-blue-400'
                }
                bg-gray-800 hover:bg-gray-700 
                transition-all duration-200 flex items-center space-x-4
                hover:scale-102 transform
              `}
            >
              <span className={`
                w-10 h-10 flex items-center justify-center rounded-full 
                ${gameMode === '1v1' ? 'bg-purple-500' : 'bg-blue-500'}
                text-white font-bold text-lg
              `}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium text-white text-lg">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {showConfetti && celebrationAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Lottie
            animationData={celebrationAnimation}
            loop={true}
            className="w-full h-full"
          />
        </div>
      )}
      
      {showIncorrect && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-500 bg-opacity-30 z-50">
          <X className="w-24 h-24 text-red-500" />
        </div>
      )}
    </div>
  );
};

export default QuestionCard;