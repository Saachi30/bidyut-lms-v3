import React, { useState } from 'react';
import { X, Trash2, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateQuizModal = ({ onClose }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [subtopicId, setSubtopicId] = useState('');
  const [questions, setQuestions] = useState([{ 
    question: '', 
    options: ['', '', '', ''], 
    correctAnswer: 0 
  }]);

  const navigate=useNavigate();
  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }]);
  };

  const handleRemoveQuestion = (indexToRemove) => {
    // Prevent removing the last question
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== indexToRemove));
    } else {
      toast.error('At least one question is required');
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCreateQuiz = async () => {
    // Validation
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    // Validate each question
    const invalidQuestions = questions.some(q => 
      !q.question.trim() || 
      q.options.some(opt => !opt.trim()) ||
      q.correctAnswer === undefined
    );

    if (invalidQuestions) {
      toast.error('Please fill in all question details');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/quizzes', {
        title: quizTitle, 
        description: quizDescription,
        questions: questions, // Direct array to match backend expectation
        subtopicId: subtopicId ? parseInt(subtopicId) : null, // Parse to int or send null
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      toast.success('Quiz created successfully');
      onClose();
      
      navigate(`/lms/quiz/${response.data.data.quiz.id}`);
    } catch (err) {
      // Handle specific error messages from backend
      const errorMessage = err.response?.data?.message || 'Failed to create quiz';
      toast.error(errorMessage);
      console.error('Quiz creation error:', err.response?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20 overflow-y-scroll">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Create Quiz</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter unique quiz title"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Description</label>
          <textarea
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter quiz description (optional)"
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtopic ID (Optional)</label>
          <input
            type="number"
            value={subtopicId}
            onChange={(e) => setSubtopicId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter subtopic ID if applicable"
          />
        </div>
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-6 relative">
            {questions.length > 1 && (
              <button 
                onClick={() => handleRemoveQuestion(questionIndex)}
                className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                title="Remove Question"
                type="button"
              >
                <Trash2 size={20} />
              </button>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question {questionIndex + 1} *</label>
              <input
                type="text"
                value={question.question}
                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter question"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option {optionIndex + 1} *</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={`Enter option ${optionIndex + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuestionChange(questionIndex, 'correctAnswer', index)}
                    className={`flex-1 px-4 py-2 text-center ${
                      question.correctAnswer === index 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Option {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <PlusCircle className="mr-2" size={20} /> Add Question
          </button>
        </div>
        <button
          onClick={handleCreateQuiz}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export default CreateQuizModal;