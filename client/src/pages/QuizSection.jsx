// import React, { useState, useEffect } from 'react';
// import { ArrowRight, Loader2, Trophy, AlertCircle } from 'lucide-react';
// import { useLocation, useParams } from 'react-router-dom';

// const QuizSection = () => {
//     const location = useLocation();
//     const { courseId } = useParams();
//     const courseInfo = location.state?.courseInfo;  // Changed from courseData to courseInfo

//     const [questions, setQuestions] = useState([]);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [isLoading, setIsLoading] = useState(false);
//     const [userAnswers, setUserAnswers] = useState([]);
//     const [showResults, setShowResults] = useState(false);
//     const [error, setError] = useState(null);

//     const generateQuiz = async () => {
//         if (!courseInfo) {
//             setError('Course information not found');
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         const prompt = `Create a quiz with exactly 10 multiple choice questions about ${courseInfo.title}. 
//         Focus on these specific topics: ${courseInfo.topics.join(', ')}

//         Rules for questions:
//         1. All questions should be specifically about ${courseInfo.title}
//         2. Ensure varying difficulty levels
//         3. Make questions engaging and practical
//         4. Include both theoretical and applied knowledge
//         5. Some questions should connect multiple concepts from the topic list

//         Format each question as a JSON object with these exact fields:
//         - question: The question text
//         - options: Array of 4 possible answers
//         - correctAnswer: The correct answer (matching one of the options)
//         - difficulty: "Easy", "Medium", or "Hard"
        
//         Return as a pure JSON array of question objects. No bullet points or asterisks.`;

//         try {
//             const response = await fetch(
//                 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs',
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         contents: [
//                             {
//                                 parts: [
//                                     { text: prompt }
//                                 ]
//                             }
//                         ],
//                     }),
//                 }
//             );

//             const data = await response.json();
//             const rawText = data.candidates[0].content.parts[0].text;

//             // Extract JSON array from the response
//             const jsonStr = rawText.substring(
//                 rawText.indexOf('['),
//                 rawText.lastIndexOf(']') + 1
//             );

//             const quizQuestions = JSON.parse(jsonStr);
//             setQuestions(quizQuestions);
//             setCurrentQuestion(0);
//             setUserAnswers([]);
//             setShowResults(false);
//         } catch (err) {
//             setError('Failed to generate quiz. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (courseInfo) {
//             generateQuiz();
//         }
//     }, [courseInfo]);

//     // Rest of the component remains exactly the same...
//     const handleAnswer = (selectedAnswer) => {
//         const newAnswers = [...userAnswers];
//         newAnswers[currentQuestion] = selectedAnswer;
//         setUserAnswers(newAnswers);

//         if (currentQuestion < questions.length - 1) {
//             setCurrentQuestion(currentQuestion + 1);
//         } else {
//             setShowResults(true);
//         }
//     };

//     const calculateScore = () => {
//         return userAnswers.reduce((score, answer, index) => {
//             return score + (answer === questions[index].correctAnswer ? 1 : 0);
//         }, 0);
//     };

//     const getScoreColor = (score) => {
//         if (score >= 8) return 'text-green-600';
//         if (score >= 5) return 'text-yellow-600';
//         return 'text-red-600';
//     };

//     const getDifficultyColor = (difficulty) => {
//         switch (difficulty.toLowerCase()) {
//             case 'easy':
//                 return 'text-green-500';
//             case 'medium':
//                 return 'text-yellow-500';
//             case 'hard':
//                 return 'text-red-500';
//             default:
//                 return 'text-gray-500';
//         }
//     };

//     const renderQuestion = () => {
//         const question = questions[currentQuestion];
//         return (
//             <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
//                 <div className="mb-8">
//                     <div className="flex justify-between items-center mb-6">
//                         <span className="text-sm font-medium text-gray-500">
//                             Question {currentQuestion + 1} of {questions.length}
//                         </span>
//                         <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
//                             {question.difficulty}
//                         </span>
//                     </div>

//                     <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
//                         <div
//                             className="h-full bg-ternary-500 rounded-full transition-all duration-300"
//                             style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
//                         />
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h2>
//                     <div className="space-y-4">
//                         {question.options.map((option, index) => (
//                             <button
//                                 key={index}
//                                 onClick={() => handleAnswer(option)}
//                                 className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-3"
//                             >
//                                 <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium">
//                                     {String.fromCharCode(65 + index)}
//                                 </span>
//                                 <span className="font-medium text-gray-700">{option}</span>
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const renderResults = () => {
//         const score = calculateScore();
//         return (
//             <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
//                 <div className="text-center mb-8">
//                     <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
//                     <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
//                     <p className={`text-4xl font-bold ${getScoreColor(score)} mb-4`}>
//                         {score} / {questions.length}
//                     </p>
//                     <p className="text-gray-600 mb-8">
//                         {score >= 8 ? `Expert in ${courseData?.title}!` :
//                             score >= 5 ? 'Good understanding of the concepts!' :
//                                 'Keep learning and practicing!'}
//                                 </p>
//                 </div>

//                 <div className="space-y-6">
//                     {questions.map((question, index) => (
//                         <div key={index} className="p-4 rounded-lg bg-gray-50">
//                             <div className="flex justify-between items-center mb-2">
//                                 <span className="font-medium text-gray-800">Question {index + 1}</span>
//                                 <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
//                                     {question.difficulty}
//                                 </span>
//                             </div>
//                             <p className="font-medium text-gray-800 mb-2">{question.question}</p>
//                             <p className="text-sm">
//                                 <span className="text-gray-600">Your answer: </span>
//                                 <span className={userAnswers[index] === question.correctAnswer ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
//                                     {userAnswers[index]}
//                                 </span>
//                             </p>
//                             {userAnswers[index] !== question.correctAnswer && (
//                                 <p className="text-sm mt-1">
//                                     <span className="text-gray-600">Correct answer: </span>
//                                     <span className="text-green-600 font-medium">{question.correctAnswer}</span>
//                                 </p>
//                             )}
//                         </div>
//                     ))}
//                 </div>

//                 <button
//                     onClick={generateQuiz}
//                     className="mt-8 w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
//                 >
//                     <ArrowRight className="w-5 h-5" />
//                     <span>Try Another Quiz</span>
//                 </button>
//             </div>
//         );
//     };

//     if (error) {
//         return (
//             <div className="min-h-[400px] flex items-center justify-center">
//                 <div className="text-center">
//                     <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//                     <p className="text-red-600 font-medium mb-4">{error}</p>
//                     <button
//                         onClick={generateQuiz}
//                         className="py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     if (isLoading) {
//         return (
//             <div className="min-h-[400px] flex items-center justify-center">
//                 <div className="text-center">
//                     <Loader2 className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
//                     <p className="text-gray-600 font-medium">Generating your {courseInfo?.title} quiz...</p>
//                     <p className="text-sm text-gray-500 mt-2">Preparing challenging questions for you</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-[400px] p-4">
//             {questions.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center min-h-[400px]">
//                     <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//                         Test Your Knowledge in {courseInfo?.title}
//                     </h1>
//                     <p className="text-gray-600 mb-8 text-center max-w-md">
//                         Challenge yourself with questions about {courseInfo?.description}
//                     </p>
//                     <button
//                         onClick={generateQuiz}
//                         className="py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
//                     >
//                         <span>Start Quiz</span>
//                         <ArrowRight className="w-5 h-5" />
//                     </button>
//                 </div>
//             ) : showResults ? (
//                 renderResults()
//             ) : (
//                 renderQuestion()
//             )}
//         </div>
//     );
// };

// export default QuizSection;
// import React, { useState, useEffect } from 'react';
// import { ArrowRight, Loader2, Trophy, AlertCircle } from 'lucide-react';
// import { useLocation, useParams } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import spaceBackground from '../assets/quiz/space-background.json';
import rocketLaunch from '../assets/quiz/rocket-launch.json';
import robotThinking from '../assets/quiz/robot-thinking.json';
import celebration from '../assets/quiz/celebration.json';
import sadRobot from '../assets/quiz/sad-robot.json';
import { useLocation, useParams } from 'react-router-dom';

const QuizSection = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);
    const [showAnimation, setShowAnimation] = useState(false);
    const location = useLocation();
         const { courseId } = useParams();
         const courseInfo = location.state?.courseInfo;  
    const generateQuiz = async () => {
        if (!courseInfo) {
            setError('Course information not found');
            return;
        }

        setIsLoading(true);
        setError(null);

        const prompt = `Create a quiz with exactly 10 multiple choice questions about ${courseInfo.title}. 
        Focus on these specific topics: ${courseInfo.topics.join(', ')}

        Rules for questions:
        1. All questions should be specifically about ${courseInfo.title}
        2. Ensure varying difficulty levels
        3. Make questions engaging and practical
        4. Include both theoretical and applied knowledge
        5. Some questions should connect multiple concepts from the topic list

        Format each question as a JSON object with these exact fields:
        - question: The question text
        - options: Array of 4 possible answers
        - correctAnswer: The correct answer (matching one of the options)
        - difficulty: "Easy", "Medium", or "Hard"
        
        Return as a pure JSON array of question objects. No bullet points or asterisks.`;

        try {
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt }
                                ]
                            }
                        ],
                    }),
                }
            );

            const data = await response.json();
            const rawText = data.candidates[0].content.parts[0].text;

            // Extract JSON array from the response
            const jsonStr = rawText.substring(
                rawText.indexOf('['),
                rawText.lastIndexOf(']') + 1
            );

            const quizQuestions = JSON.parse(jsonStr);
            setQuestions(quizQuestions);
            setCurrentQuestion(0);
            setUserAnswers([]);
            setShowResults(false);
        } catch (err) {
            setError('Failed to generate quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseInfo) {
            generateQuiz();
        }
    }, [courseInfo]);

    const handleAnswer = (selectedAnswer) => {
        setShowAnimation(true);
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestion] = selectedAnswer;
        setUserAnswers(newAnswers);

        setTimeout(() => {
            setShowAnimation(false);
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    const calculateScore = () => {
        return userAnswers.reduce((score, answer, index) => {
            return score + (answer === questions[index].correctAnswer ? 1 : 0);
        }, 0);
    };

    const getScoreMessage = (score) => {
        if (score >= 8) return "You're a Robot Master! 🚀";
        if (score >= 5) return "Junior AI Engineer in Training! 💻";
        return "Robot Apprentice - Keep Learning! ⚡";
    };


    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'text-green-500';
            case 'medium':
                return 'text-yellow-500';
            case 'hard':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const renderQuestion = () => {
        const question = questions[currentQuestion];
        return (
            <div className="relative w-full max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-lg p-8 border-2 border-blue-500">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl">
                    <Lottie 
                        animationData={spaceBackground}
                        className="opacity-20"
                        loop={true}
                    />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-blue-400">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                        <div className="w-16 h-16">
                            <Lottie 
                                animationData={robotThinking}
                                loop={true}
                            />
                        </div>
                    </div>

                    <div className="w-full h-3 bg-gray-700 rounded-full mb-6">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-8">{question.question}</h2>

                    <div className="space-y-4">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="w-full text-left p-6 rounded-lg border-2 border-blue-500 hover:border-blue-400 
                                         bg-gray-800 hover:bg-gray-700 transition-all duration-200 flex items-center space-x-4"
                            >
                                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="font-medium text-white text-lg">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {showAnimation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="w-64 h-64  ml-24">
                            <Lottie 
                                animationData={rocketLaunch}
                                loop={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderResults = () => {
        const score = calculateScore();
        const isHighScore = score >= 8;

        return (
            <div className="relative w-full max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-lg p-8 border-2 border-blue-500">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl">
                    <Lottie 
                        animationData={spaceBackground}
                        className="opacity-20"
                        loop={true}
                    />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-48 h-48 mx-auto mb-6">
                            <Lottie 
                                animationData={isHighScore ? celebration : sadRobot}
                                loop={true}
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Mission Complete!</h2>
                        <p className="text-5xl font-bold text-purple-400 mb-4">
                            {score} / {questions.length}
                        </p>
                        <p className="text-2xl font-bold text-purple-300 mb-8">
                            {getScoreMessage(score)}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <div key={index} className="p-6 rounded-lg bg-gray-800 border border-blue-500">
                                <p className="font-bold text-white mb-3">{question.question}</p>
                                <p className="text-lg">
                                    <span className="text-gray-400">Your answer: </span>
                                    <span className={userAnswers[index] === question.correctAnswer ? 
                                        'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                        {userAnswers[index]}
                                    </span>
                                </p>
                                {userAnswers[index] !== question.correctAnswer && (
                                    <p className="text-lg mt-2">
                                        <span className="text-gray-400">Correct answer: </span>
                                        <span className="text-green-400 font-bold">{question.correctAnswer}</span>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setShowResults(false);
                            generateQuiz();
                        }}
                        className="mt-8 w-full py-4 px-6 rounded-lg transition-all duration-200 
                                 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                                 text-white text-xl font-bold flex items-center justify-center space-x-3"
                    >
                        <span>Start New Quiz</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4">
                        <Lottie 
                            animationData={sadRobot}
                            loop={true}
                        />
                    </div>
                    <p className="text-red-400 font-bold text-xl mb-4">{error}</p>
                    <button
                        onClick={generateQuiz}
                        className="py-3 px-6 rounded-lg bg-secondary-600 hover:bg-secondary-500 transition-colors text-white font-bold"
                    >
                        Retry Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[800px] flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4">
                        <Lottie 
                            animationData={robotThinking}
                            loop={true}
                        />
                    </div>
                    <p className="text-primary-400 font-bold text-xl">Preparing Your Quiz...</p>
                    <p className="text-gray-400 mt-2">Getting your questions ready!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-48 h-48 mb-6">
                        <Lottie 
                            animationData={rocketLaunch}
                            loop={true}
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-6 text-center">
                         Quiz Adventure!
                    </h1>
                    <p className="text-purple-300 text-xl mb-8 text-center max-w-md">
                        Ready to explore?
                    </p>
                    <button
                        onClick={generateQuiz}
                        className="py-4 px-8 rounded-lg transition-all duration-200 
                                 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                                 text-white text-xl font-bold flex items-center space-x-3"
                    >
                        <span>Launch</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            ) : showResults ? (
                renderResults()
            ) : (
                renderQuestion()
            )}
        </div>
    );
};

export default QuizSection;