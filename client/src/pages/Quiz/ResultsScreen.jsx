import React from 'react';
import Lottie from 'lottie-react';
import { LOTTIE_ANIMATIONS } from './constants';

const ResultsScreen = ({
  gameMode,
  scores,
  opponent,
  questions,
  userAnswers,
  onTryAgain
}) => {
  const correctAnswers = userAnswers.filter(
    (answer, index) => answer === questions[index].correctAnswer
  ).length;
  const score = Math.round((correctAnswers / questions.length) * 100);

  const ScoreDisplay = () => {
    if (gameMode === '1v1') {
      return (
        <div className="flex justify-center items-center space-x-16 mb-12">
          <div className="text-center">
            <p className="text-purple-400 mb-2">Your Score</p>
            <h3 className="text-5xl font-bold text-white">{scores.player}</h3>
          </div>
          <div className="text-4xl font-bold text-purple-400">VS</div>
          <div className="text-center">
            <p className="text-purple-400 mb-2">{opponent?.name}</p>
            <h3 className="text-5xl font-bold text-white">{scores.opponent}</h3>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center mb-12">
        <div className="w-48 h-48 mx-auto mb-6">
          {/* <Lottie 
            animationData={score >= 70 
              ? LOTTIE_ANIMATIONS.CELEBRATION 
              : LOTTIE_ANIMATIONS.SAD_ROBOT}
            loop={true}
          /> */}
        </div>
        <p className="text-3xl font-bold mb-2">
          Your Score: <span className="text-blue-400">{score}%</span>
        </p>
        <p className="text-xl text-gray-400">
          {correctAnswers} correct out of {questions.length} questions
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* <Lottie 
            animationData={score >= 70 
              ? LOTTIE_ANIMATIONS.CELEBRATION 
              : LOTTIE_ANIMATIONS.SAD_ROBOT}
            className="opacity-20"
            loop={true}
          /> */}
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-center mb-8">
            {gameMode === '1v1' ? (
              <span className={
                scores.player > scores.opponent 
                  ? "text-green-400"
                  : scores.player === scores.opponent
                    ? "text-yellow-400"
                    : "text-red-400"
              }>
                {scores.player > scores.opponent 
                  ? "Victory!" 
                  : scores.player === scores.opponent
                    ? "It's a tie!"
                    : "Good try!"}
              </span>
            ) : (
              <span className={score >= 70 ? "text-green-400" : "text-yellow-400"}>
                Quiz Complete!
              </span>
            )}
          </h2>

          <ScoreDisplay />

          <div className="space-y-6 mb-12">
            {questions.map((question, index) => (
              <div 
                key={index}
                className={`p-6 rounded-lg ${
                  userAnswers[index] === question.correctAnswer
                    ? 'bg-green-900 bg-opacity-20 border-2 border-green-500'
                    : 'bg-red-900 bg-opacity-20 border-2 border-red-500'
                }`}
              >
                <p className="font-medium text-white mb-2">
                  {index + 1}. {question.question}
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Your answer: </span>
                  <span className={
                    userAnswers[index] === question.correctAnswer
                      ? "text-green-400"
                      : "text-red-400"
                  }>
                    {userAnswers[index]}
                  </span>
                </p>
                {userAnswers[index] !== question.correctAnswer && (
                  <p className="text-sm">
                    <span className="text-gray-400">Correct answer: </span>
                    <span className="text-green-400">{question.correctAnswer}</span>
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2">{question.explanation}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onTryAgain}
              className="px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 
                       text-white font-medium transition-all duration-200
                       transform hover:scale-105"
            >
              Try Another Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;