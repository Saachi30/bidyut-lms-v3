import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import GameModeSelection from './GameModeSelection';
import SearchingOpponent from './SearchingOpponent';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import { OPPONENTS, GAME_SETTINGS } from './constants';
import Lottie from 'lottie-react';
// import { LOTTIE_ANIMATIONS } from './constants';
const LOTTIE_ANIMATIONS = {
  SPACE_BG: () => import('../../assets/quiz/space-background.json'),
};


const ROBOTICS_COURSE = {
  title: "Basic Robotics",
  topics: [
    "Robot Components",
    "Sensors and Motors",
    "Basic Programming",
    "Robot Movement",
    "Safety Rules"
  ]
};

const OPPONENT_ANSWERS = {
  0: true,   // First question correct
  1: false,  // Second question wrong
  2: true,   // Third question correct
  3: true,   // Fourth question correct
  4: false,  // Fifth question wrong
  5: true,   // Sixth question correct
  6: false,  // Seventh question wrong
  7: false,  // Eighth question wrong
  8: false,  // Ninth question wrong
  9: false   // Tenth question wrong
};

const QuizSection = () => {
  const [spaceAnimation, setSpaceAnimation] = useState(null);
  const [gameState, setGameState] = useState({
    gameMode: null,
    questions: [],
    currentQuestion: 0,
    userAnswers: [],
    showResults: false,
    isLoading: false,
    error: null,
    showAnimation: false,
    isSearchingOpponent: false,
    opponent: null,
    gameTimer: null,
    showConfetti: false,
    showIncorrect: false,
    scores: { player: 0, opponent: 0 },
    timeLeft: GAME_SETTINGS.QUESTION_TIME_LIMIT,
    showVersusAnimation: false,
    opponentAnswers: [] // Track opponent's answers
  });

  useEffect(() => {
    const loadAnimation = async () => {
      const spaceModule = await LOTTIE_ANIMATIONS.SPACE_BG();
      setSpaceAnimation(spaceModule.default);
    };
    loadAnimation();
  }, []);

  useEffect(() => {
    return () => {
      if (gameState.gameTimer) clearInterval(gameState.gameTimer);
    };
  }, [gameState.gameTimer]);

  const generateQuizPrompt = () => {
    return `Create a quiz with exactly ${GAME_SETTINGS.TOTAL_QUESTIONS} multiple choice questions about ${ROBOTICS_COURSE.title}. 
    Focus on these specific topics: ${ROBOTICS_COURSE.topics.join(', ')}
    
    Rules for questions:
    1. All questions should be specifically about ${ROBOTICS_COURSE.title}
    2. Include a mix of difficulty levels (Easy: 3, Medium: 4, Hard: 3)
    3. Make questions engaging and practical for children
    4. Include both theoretical and applied knowledge
    5. Some questions should connect multiple concepts
    6. Keep language simple and child-friendly
    7. Include visual elements where possible
    8. Add fun facts in some questions
    
    Format as JSON array with fields:
    - question: The question text
    - options: Array of 4 possible answers
    - correctAnswer: The correct answer
    - difficulty: "Easy", "Medium", or "Hard"
    - explanation: Kid-friendly explanation
    - funFact: Interesting related fact (optional)`;
  };

  const generateQuiz = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }));
  
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ 
                text: generateQuizPrompt() 
              }] 
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }
  
      const rawText = data.candidates[0].content.parts[0].text;
      
      // First attempt: Try to parse the entire response as JSON
      let quizQuestions;
      try {
        quizQuestions = JSON.parse(rawText);
      } catch (parseError) {
        // Second attempt: Look for JSON array using regex
        const jsonMatch = rawText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (!jsonMatch) {
          // Third attempt: Try to extract JSON objects one by one
          const objectMatches = [...rawText.matchAll(/{[\s\S]*?}/g)];
          if (objectMatches.length > 0) {
            try {
              quizQuestions = objectMatches.map(match => JSON.parse(match[0]));
            } catch (error) {
              throw new Error('Failed to parse individual question objects');
            }
          } else {
            throw new Error('Could not find valid JSON data in response');
          }
        } else {
          try {
            quizQuestions = JSON.parse(jsonMatch[0]);
          } catch (error) {
            throw new Error('Failed to parse matched JSON array');
          }
        }
      }
  
      // Validate quiz questions structure
      if (!Array.isArray(quizQuestions)) {
        quizQuestions = [quizQuestions]; // Convert single question to array
      }
  
      if (quizQuestions.length === 0) {
        throw new Error('No valid questions found in response');
      }
  
      // Validate and normalize each question
      const validatedQuestions = quizQuestions.map((question, index) => {
        if (!question.question || !Array.isArray(question.options) || !question.correctAnswer) {
          throw new Error(`Invalid question format at index ${index}`);
        }
  
        // Normalize the question format
        return {
          question: question.question.trim(),
          options: question.options.map(opt => opt.trim()),
          correctAnswer: question.correctAnswer.trim(),
          difficulty: question.difficulty || 'Medium',
          explanation: question.explanation || '',
          funFact: question.funFact || ''
        };
      });
  
      // Store the validated questions first
      setGameState(prev => {
        const newState = {
          ...prev,
          questions: validatedQuestions,
          currentQuestion: 0,
          userAnswers: [],
          showResults: false,
          isLoading: false
        };
  
        // Start the timer if in 1v1 mode
        if (prev.gameMode === '1v1') {
          startGameTimer();
        }
  
        return newState;
      });
  
    } catch (err) {
      console.error('Quiz Generation Error:', err);
      setGameState(prev => ({
        ...prev,
        error: `Failed to generate quiz: ${err.message}. Please try again.`,
        isLoading: false
      }));
    }
  };
  
  const startGameTimer = () => {
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    setGameState(prev => ({ ...prev, gameTimer: timer }));
  };

  const handleTimeUp = () => {
    setGameState(prev => {
      if (prev.currentQuestion < prev.questions.length - 1) {
        return {
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          timeLeft: GAME_SETTINGS.QUESTION_TIME_LIMIT
        };
      }
      return { ...prev, showResults: true };
    });
    startGameTimer();
  };

  const simulateOpponentSearch = () => {
    setGameState(prev => ({ 
      ...prev, 
      isSearchingOpponent: true,
      showVersusAnimation: false 
    }));
    
    setTimeout(() => {
      const randomOpponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
      setGameState(prev => ({
        ...prev,
        opponent: randomOpponent,
        isSearchingOpponent: false,
        showVersusAnimation: true
      }));

      // Show VS animation for 2 seconds before starting the quiz
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showVersusAnimation: false
        }));
        generateQuiz();
      }, 200);
    }, GAME_SETTINGS.OPPONENT_SEARCH_TIME);
  };
  const handleGameModeSelection = (mode) => {
    setGameState(prev => ({ ...prev, gameMode: mode }));
    if (mode === '1v1') {
      simulateOpponentSearch();
    } else {
      generateQuiz();
    }
  };

  const handleAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === gameState.questions[gameState.currentQuestion].correctAnswer;
    
    setGameState(prev => {
      const newState = { ...prev };

      if (prev.gameMode === '1v1') {
        clearInterval(prev.gameTimer);
        if (isCorrect) {
          newState.showConfetti = true;
          newState.scores.player = prev.scores.player + 1;
        } else {
          newState.showIncorrect = true;
        }

        // Use hardcoded opponent answer pattern
        const opponentCorrect = OPPONENT_ANSWERS[prev.currentQuestion];
        if (opponentCorrect) {
          newState.scores.opponent = prev.scores.opponent + 1;
        }

        // Store opponent's answer
        const opponentAnswer = opponentCorrect 
          ? prev.questions[prev.currentQuestion].correctAnswer
          : getRandomWrongAnswer(prev.questions[prev.currentQuestion]);

        newState.opponentAnswers = [...prev.opponentAnswers, opponentAnswer];
      } else {
        newState.showAnimation = true;
        newState.showConfetti = isCorrect;
        newState.showIncorrect = !isCorrect;
      }

      newState.userAnswers = [...prev.userAnswers];
      newState.userAnswers[prev.currentQuestion] = selectedAnswer;

      return newState;
    });

    setTimeout(() => {
      setGameState(prev => {
        const newState = {
          ...prev,
          showAnimation: false,
          showConfetti: false,
          showIncorrect: false
        };

        if (prev.currentQuestion < prev.questions.length - 1) {
          newState.currentQuestion = prev.currentQuestion + 1;
          if (prev.gameMode === '1v1') {
            newState.timeLeft = GAME_SETTINGS.QUESTION_TIME_LIMIT;
            startGameTimer();
          }
        } else {
          newState.showResults = true;
        }

        return newState;
      });
    }, 1500);
  };
  const getRandomWrongAnswer = (question) => {
    const wrongOptions = question.options.filter(option => 
      option !== question.correctAnswer
    );
    return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  };
  const handleTryAgain = () => {
    setGameState({
      gameMode: null,
      questions: [],
      currentQuestion: 0,
      userAnswers: [],
      showResults: false,
      isLoading: false,
      error: null,
      showAnimation: false,
      isSearchingOpponent: false,
      opponent: null,
      gameTimer: null,
      showConfetti: false,
      showIncorrect: false,
      scores: { player: 0, opponent: 0 },
      timeLeft: GAME_SETTINGS.QUESTION_TIME_LIMIT,
      opponentAnswers: []
    });
  };

  if (gameState.error) {
    return <ErrorScreen error={gameState.error} onRetry={() => window.location.reload()} />;
  }

  if (gameState.isLoading) {
    return <LoadingScreen />;
  }

  if (!gameState.gameMode) {
    return <GameModeSelection onSelectMode={handleGameModeSelection} />;
  }

  if (gameState.isSearchingOpponent) {
    return <SearchingOpponent />;
  }

  if (gameState.showVersusAnimation) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        
      </div>
    );
  }

  if (gameState.showResults) {
    return (
      <ResultsScreen
        gameMode={gameState.gameMode}
        scores={gameState.scores}
        opponent={gameState.opponent}
        questions={gameState.questions}
        userAnswers={gameState.userAnswers}
        onTryAgain={handleTryAgain}
      />
    );
  }

  if (gameState.questions.length === 0) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Space Background
      {spaceAnimation && (
        <div className="fixed inset-0 z-0">
          <Lottie
            animationData={spaceAnimation}
            loop={true}
            className="w-[100vw] h-[100vh] "
          />
        </div>
      )}
      */}
    <QuestionCard
      question={gameState.questions[gameState.currentQuestion]}
      currentQuestion={gameState.currentQuestion}
      totalQuestions={gameState.questions.length}
      onAnswer={handleAnswer}
      gameMode={gameState.gameMode}
      timeLeft={gameState.timeLeft}
      scores={gameState.scores}
      opponent={gameState.opponent}
      showConfetti={gameState.showConfetti}
      showIncorrect={gameState.showIncorrect}
    />
     </div>
  );
};

export default QuizSection;