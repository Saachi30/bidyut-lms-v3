import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart,
  Brain,
  Loader2
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [answersAnalysis, setAnswersAnalysis] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Define colors for charts
  const CHART_COLORS = {
    correct: '#10B981',
    incorrect: '#EF4444',
    unanswered: '#9CA3AF',
    background: {
      correct: '#D1FAE5',
      incorrect: '#FEE2E2',
      unanswered: '#F3F4F6'
    },
    topics: ['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#14B8A6']
  };
  
  useEffect(() => {
    // Try to get results from sessionStorage first
    const sessionResults = sessionStorage.getItem('quizResults');
    
    if (sessionResults) {
      const parsedResults = JSON.parse(sessionResults);
      setResults(parsedResults);
      setLoading(false);
      
      // Initialize expanded state for all questions (collapsed by default)
      const expanded = {};
      parsedResults.questions.forEach((_, index) => {
        expanded[index] = false;
      });
      setExpandedQuestions(expanded);
      
      // Generate AI insights
      generateAiInsights(parsedResults);
    } else {
      // If not available in session, fetch from API
      fetchQuizReport();
    }
  }, [id]);
  
  const fetchQuizReport = async () => {
    try {
      setLoading(true);
      
      // Get the current user's latest report for this quiz
      const reportResponse = await axios.get(`/api/quizzes/reports/quiz/${id}`);
      
      if (!reportResponse.data.data) {
        setError('No quiz report found');
        setLoading(false);
        return;
      }
      
      // Get the quiz details
      const quizResponse = await axios.get(`/api/quizzes/${id}`);
      
      // Combine the data
      const quizData = quizResponse.data.data;
      const reportData = reportResponse.data.data;
      
      // Parse questions if needed
      const parsedQuestions = typeof quizData.questions === 'string' 
        ? JSON.parse(quizData.questions) 
        : quizData.questions;
      
      // Parse user answers if available
      const userAnswers = reportData.answers ? 
        (typeof reportData.answers === 'string' ? JSON.parse(reportData.answers) : reportData.answers) 
        : {};
      
      const resultData = {
        quizId: id,
        quizTitle: quizData.title,
        score: reportData.score,
        totalQuestions: parsedQuestions.length,
        answers: userAnswers,
        questions: parsedQuestions,
        reportId: reportData.id,
        completedAt: reportData.updatedAt
      };
      
      setResults(resultData);
      
      // Generate explanations for incorrect answers during initial load
      if (Object.keys(userAnswers).length > 0) {
        const incorrectIndices = Object.keys(userAnswers).filter(
          idx => userAnswers[idx] !== parsedQuestions[idx].correctAnswer
        );
        
        if (incorrectIndices.length > 0) {
          // Queue up generation of AI explanations (can be done asynchronously)
          setTimeout(() => {
            generateQuestionExplanations(
              incorrectIndices.map(idx => ({
                question: parsedQuestions[idx],
                userAnswer: userAnswers[idx],
                index: idx
              }))
            );
          }, 0);
        }
      }
      
      // Initialize expanded state for all questions (collapsed by default)
      const expanded = {};
      parsedQuestions.forEach((_, index) => {
        expanded[index] = false;
      });
      setExpandedQuestions(expanded);
      
      // Generate AI insights
      generateAiInsights(resultData);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch quiz results:', err);
      setError(err.response?.data?.message || 'Failed to fetch quiz results');
      setLoading(false);
    }
  };
  
  const generateQuestionExplanations = async (incorrectQuestions) => {
    // This function is called above but not defined in the original code
    // Implementation would go here to generate explanations for individual questions
    console.log("Generating explanations for incorrect questions", incorrectQuestions);
  };
  
  const generateAiInsights = async (quizResults) => {
    setAiLoading(true);
    // Updated API endpoint for the latest Gemini API version
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBYMVbC7zYzpX6gpdfp4nXWY8sgGZ7_tJw';
      
    try {
      // Prepare data for the Gemini API
      const correctAnswers = Object.keys(quizResults.answers).filter(
        index => quizResults.answers[index] === quizResults.questions[index].correctAnswer
      ).length;
      
      const incorrectAnswers = Object.keys(quizResults.answers).filter(
        index => quizResults.answers[index] !== undefined && 
                quizResults.answers[index] !== quizResults.questions[index].correctAnswer
      ).length;
      
      const unanswered = quizResults.totalQuestions - (correctAnswers + incorrectAnswers);
      
      // Group questions by topics if available
      const topicPerformance = {};
      quizResults.questions.forEach((q, index) => {
        if (q.topic) {
          if (!topicPerformance[q.topic]) {
            topicPerformance[q.topic] = { 
              total: 0, 
              correct: 0, 
              questions: [] 
            };
          }
          
          topicPerformance[q.topic].total++;
          
          // Only include essential information to reduce payload size
          topicPerformance[q.topic].questions.push({
            question: q.question,
            isCorrect: quizResults.answers[index] === q.correctAnswer
          });
          
          if (quizResults.answers[index] === q.correctAnswer) {
            topicPerformance[q.topic].correct++;
          }
        }
      });
      
      // Simplified topic performance for API request
      const topicSummary = Object.entries(topicPerformance).map(([topic, data]) => ({
        topic,
        correctRatio: `${data.correct}/${data.total}`,
        percentage: Math.round((data.correct / data.total) * 100)
      }));
      
      // IMPROVED PROMPT for Gemini API
      const prompt = {
        contents: [{
          role: "user",
          parts: [{
            text: `You are a supportive, professional educational assistant. Analyze the following quiz results and provide clear feedback in 4 distinct sections with visual separation:

1. ASSESSMENT: Write a brief overall assessment (2-3 sentences) with a professional, encouraging tone.

2. STRENGTHS: Identify 3-4 specific areas of mastery based on the data, with each strength on a new line starting with "✓ " (not as a bullet point).

3. IMPROVEMENT AREAS: Suggest 3-4 specific focus areas with clear recommendations, each on a new line starting with "→ " (not as a bullet point).

4. STUDY PLAN: Present a personalized 3-5 item study plan with clear, concrete action items. Each step should be on a new line starting with a number and period (e.g., "1. ").

IMPORTANT FORMATTING:
- Use paragraph breaks between sections
- Use blank lines between sections for visual separation
- Do NOT use Markdown symbols like asterisks (*), hashtags (#), or hyphens (-) for formatting
- Never use bullet points or star symbols
- Use "✓" for strengths and "→" for improvement items
- Start each study plan item with a number followed by period
- Use professional, clear language

Quiz Title: ${quizResults.quizTitle}
Score: ${quizResults.score} out of ${quizResults.totalQuestions * 10}
Percentage: ${Math.round((quizResults.score / (quizResults.totalQuestions * 10)) * 100)}%
Correct Answers: ${correctAnswers}
Incorrect Answers: ${incorrectAnswers}
Unanswered Questions: ${unanswered}

Topic Performance: ${JSON.stringify(topicSummary)}`
          }]
        }]
      };
      
      // Simplify the detailed answer analysis to reduce payload size
      const simplifiedAnswers = quizResults.questions.map((q, i) => ({
        topic: q.topic || "General",
        isCorrect: quizResults.answers[i] === q.correctAnswer,
        questionType: detectQuestionType(q.question)
      }));
      
      // Helper function to categorize question types
      function detectQuestionType(question) {
        if (question.toLowerCase().includes("calculate") || 
            question.toLowerCase().includes("solve") ||
            question.match(/\d+[+\-*/]\d+/)) {
          return "calculation";
        } else if (question.toLowerCase().includes("define") || 
                  question.toLowerCase().includes("what is")) {
          return "definition";
        } else if (question.toLowerCase().includes("compare") || 
                  question.toLowerCase().includes("contrast")) {
          return "comparison";
        } else {
          return "conceptual";
        }
      }
      
      // IMPROVED PROMPT for answer analysis
      const answerAnalysisPrompt = {
        contents: [{
          role: "user",
          parts: [{
            text: `You are an experienced educational analyst. Review the following quiz performance data and provide a visually organized analysis with:

1. PATTERN ANALYSIS: Identify 2-3 clear patterns in where mistakes were made, with each insight on a separate line prefaced by "■ " (not as a bullet point).

2. MISCONCEPTIONS: Highlight any potential misconceptions evident across multiple questions, with each on a separate line prefaced by "✗ " (not as a bullet point).

3. PRIORITY TOPICS: List 1-3 topics requiring immediate attention, with each on a separate line prefaced by "! " (not as a bullet point).

4. RESOURCE RECOMMENDATIONS: Suggest specific study approaches or resource types (not specific titles), with each on a separate line prefaced by "→ " (not as a bullet point).

IMPORTANT FORMATTING:
- Use paragraph breaks between sections
- Use blank lines between sections for visual separation
- Do NOT use Markdown symbols like asterisks (*), hashtags (#), or hyphens (-) for formatting
- Never use bullet points or star symbols
- Use the specific symbols indicated for each section (■, ✗, !, →)
- Use professional, clear language with a supportive tone
- Keep your analysis concise but insightful
- Focus on actionable feedback

Quiz overview: ${JSON.stringify(simplifiedAnswers)}`
          }]
        }]
      };
      
      // Generate explanations for incorrect answers
      const incorrectQuestions = quizResults.questions.filter((q, idx) => 
        quizResults.answers[idx] !== undefined && 
        quizResults.answers[idx] !== q.correctAnswer
      );

      if (incorrectQuestions.length > 0) {
        // IMPROVED PROMPT for question explanations
        const questionExplanationsPrompt = {
          contents: [{
            role: "user",
            parts: [{
              text: `You are a clear, supportive educational assistant helping a student understand their quiz mistakes. For each of the following incorrectly answered questions, provide a brief, focused explanation that:

1. Clearly states why the correct answer is right
2. Identifies the likely misconception that led to the error
3. Offers one specific, concise tip to better understand this concept

IMPORTANT FORMATTING:
- Write each explanation as a single paragraph (2-3 sentences maximum)
- Use plain, straightforward language
- Do NOT use Markdown symbols, bullet points, or special formatting
- Focus on clarity and helpfulness
- Maintain a supportive, non-judgmental tone

Questions and answers:
${incorrectQuestions.map((q, i) => `
Question: ${q.question}
Selected answer: ${q.options[quizResults.answers[quizResults.questions.indexOf(q)]]}
Correct answer: ${q.options[q.correctAnswer]}
Topic: ${q.topic || "General"}
`).join('\n\n')}`
            }]
          }]
        };
        
        const explanationsResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionExplanationsPrompt),
        });
        
        if (explanationsResponse.ok) {
          const explanationsData = await explanationsResponse.json();
          const explanations = explanationsData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Parse explanations and add them to questions
          const explanationParts = explanations.split(/Question:/g).filter(p => p.trim());
          incorrectQuestions.forEach((q, i) => {
            if (explanationParts[i]) {
              const qIndex = quizResults.questions.indexOf(q);
              if (qIndex !== -1) {
                quizResults.questions[qIndex].aiExplanation = explanationParts[i]
                  .split(/^Selected answer:|^Correct answer:|^Topic:/m)[0].trim();
              }
            }
          });
        }
      }
      
      // Make API calls to Gemini
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt),
      });
      
      const answerResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerAnalysisPrompt),
      });
      
      // Enhanced error handling
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { rawError: errorText };
        }
        console.error('Gemini API Error Details:', errorData);
        throw new Error(`Failed to get insights from Gemini API: ${response.status} ${response.statusText}`);
      }
      
      if (!answerResponse.ok) {
        const errorText = await answerResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { rawError: errorText };
        }
        console.error('Gemini API Error Details for Answer Analysis:', errorData);
        throw new Error(`Failed to get answer analysis from Gemini API: ${answerResponse.status} ${answerResponse.statusText}`);
      }
      
      const data = await response.json();
      const answerData = await answerResponse.json();
      
      // Extract the insights from the response
      const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated.';
      const analysis = answerData.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated.';
      
      setAiInsights(insights);
      setAnswersAnalysis(analysis);
    } catch (err) {
      console.error('Error generating AI insights:', err);
      setAiInsights('Unable to generate AI insights at this time. Error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };
  
  const getPerformanceData = () => {
    if (!results) return { chartData: [], hasTopics: false };
    
    // Group by topics if available
    const topicData = {};
    let hasTopics = false;
    
    results.questions.forEach((q, index) => {
      if (q.topic) {
        hasTopics = true;
        if (!topicData[q.topic]) {
          topicData[q.topic] = { correct: 0, incorrect: 0, unanswered: 0, total: 0 };
        }
        
        topicData[q.topic].total++;
        
        if (results.answers[index] === undefined) {
          topicData[q.topic].unanswered++;
        } else if (results.answers[index] === q.correctAnswer) {
          topicData[q.topic].correct++;
        } else {
          topicData[q.topic].incorrect++;
        }
      }
    });
    
    if (hasTopics && Object.keys(topicData).length > 1) {
      // Transform for Recharts
      const chartData = Object.keys(topicData).map((topic, index) => {
        const data = topicData[topic];
        const correctPct = Math.round((data.correct / data.total) * 100);
        const incorrectPct = Math.round((data.incorrect / data.total) * 100);
        const unansweredPct = Math.round((data.unanswered / data.total) * 100);
        
        return {
          name: topic,
          correct: correctPct,
          incorrect: incorrectPct,
          unanswered: unansweredPct,
          totalQuestions: data.total,
          color: CHART_COLORS.topics[index % CHART_COLORS.topics.length]
        };
      });
      
      return { chartData, hasTopics: true };
    } else {
      // Overall performance data
      const correctCount = Object.keys(results.answers).filter(
        index => results.answers[index] === results.questions[index].correctAnswer
      ).length;
      
      const incorrectCount = Object.keys(results.answers).filter(
        index => results.answers[index] !== undefined && 
                results.answers[index] !== results.questions[index].correctAnswer
      ).length;
      
      const unansweredCount = results.totalQuestions - (correctCount + incorrectCount);
      
      const pieData = [
        { name: 'Correct', value: correctCount, color: CHART_COLORS.correct },
        { name: 'Incorrect', value: incorrectCount, color: CHART_COLORS.incorrect },
        { name: 'Unanswered', value: unansweredCount, color: CHART_COLORS.unanswered }
      ].filter(item => item.value > 0);
      
      return { chartData: pieData, hasTopics: false };
    }
  };
  
  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Calculate percentage score
  const calculatePercentage = () => {
    if (!results) return 0;
    return Math.round((results.score / (results.totalQuestions * 10)) * 100);
  };
  
  // Determine if passed (assuming 60% is passing)
  const isPassed = () => {
    const percentage = calculatePercentage();
    return percentage >= 60;
  };
  
  // Get appropriate message based on score
  const getScoreMessage = () => {
    const percentage = calculatePercentage();
    
    if (percentage >= 90) return "Excellent work! You've mastered this material.";
    if (percentage >= 80) return "Great job! You have a strong understanding of the content.";
    if (percentage >= 70) return "Good work! You're on the right track.";
    if (percentage >= 60) return "You've passed! Keep studying to improve further.";
    return "Don't worry! Review the material and try again.";
  };
  
  // Generate and download PDF report
  const downloadReport = async () => {
    if (!reportRef.current) return;
    
    setDownloadLoading(true);
    
    try {
      const percentage = calculatePercentage();
      const passed = isPassed();
      
      // Create HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Quiz Results: ${results.quizTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #4B5563; }
            h1 { color: #4338CA; border-bottom: 2px solid #6366F1; padding-bottom: 10px; }
            h2 { color: #4338CA; margin-top: 30px; }
            .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; }
            .summary-card { border: 1px solid #E0E7FF; border-radius: 10px; padding: 15px; background-color: #EEF2FF; }
            .ai-insights { background-color: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 10px; padding: 15px; margin-top: 20px; }
            .question { border: 1px solid #E0E7FF; border-radius: 10px; padding: 15px; margin-top: 15px; }
            .question-correct { background-color: #ECFDF5; }
            .question-incorrect { background-color: #FEF2F2; }
            .question-unanswered { background-color: #F9FAFB; }
            .options { margin-top: 10px; }
            .option { padding: 8px; margin-bottom: 5px; border-radius: 5px; }
            .option-correct { background-color: #D1FAE5; border-left: 4px solid #10B981; }
            .option-incorrect { background-color: #FEE2E2; border-left: 4px solid #EF4444; }
            .explanation { background-color: #EFF6FF; padding: 10px; border-radius: 5px; margin-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.8em; color: #9CA3AF; }
          </style>
        </head>
        <body>
          <h1>Quiz Results: ${results.quizTitle}</h1>
          <p>Completed on: ${new Date(results.completedAt).toLocaleString()}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Score</h3>
              <p style="font-size: 24px; font-weight: bold;">${results.score}/${results.totalQuestions * 10}</p>
            </div>
            <div class="summary-card">
              <h3>Percentage</h3>
              <p style="font-size: 24px; font-weight: bold;">${percentage}%</p>
            </div>
            <div class="summary-card">
              <h3>Status</h3>
              <p style="font-size: 24px; font-weight: bold; color: ${passed ? '#10B981' : '#EF4444'}">
                ${passed ? 'PASSED' : 'FAILED'}
              </p>
            </div>
          </div>
          
          <div class="ai-insights">
            <h2>AI Performance Insights</h2>
            ${aiInsights ? aiInsights.replace(/\n/g, '<br>') : 'No AI insights available.'}
          </div>
          
          ${answersAnalysis ? `
          <div class="ai-insights" style="background-color: #EFF6FF; border-color: #BFDBFE;">
            <h2>Detailed Answer Analysis</h2>
            ${answersAnalysis.replace(/\n/g, '<br>')}
          </div>
          ` : ''}
          
          <h2>Question Details</h2>
          ${results.questions.map((question, index) => {
            const userAnswer = results.answers[index] !== undefined ? results.answers[index] : null;
            const isCorrect = userAnswer === question.correctAnswer;
            
            return `
              <div class="question ${isCorrect ? 'question-correct' : userAnswer === null ? 'question-unanswered' : 'question-incorrect'}">
                <h3>Question ${index + 1}: ${question.question}</h3>
                ${question.topic ? `<p><strong>Topic:</strong> ${question.topic}</p>` : ''}
                
                <div class="options">
                  ${question.options.map((option, optIndex) => {
                    const isUserAnswer = userAnswer === optIndex;
                    const isCorrectAnswer = question.correctAnswer === optIndex;
                    
                    return `
                      <div class="option ${isCorrectAnswer ? 'option-correct' : (isUserAnswer && !isCorrectAnswer) ? 'option-incorrect' : ''}">
                        <strong>${String.fromCharCode(65 + optIndex)}.</strong> ${option}
                        ${isCorrectAnswer ? ' ✓' : (isUserAnswer && !isCorrectAnswer) ? ' ✗' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
                
                ${question.explanation ? `
                  <div class="explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                  </div>
                ` : ''}
                
                ${question.aiExplanation && !isCorrect ? `
                  <div class="explanation" style="background-color: ${isCorrect ? '#D1FAE5' : '#FEE2E2'};">
                    <strong>AI Explanation:</strong> ${question.aiExplanation}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} with Learning Management System</p>
          </div>
        </body>
        </html>
      `;
      
      // Create a temporary iframe to generate the PDF
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
      
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();
      
      setTimeout(() => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          document.body.removeChild(iframe);
          setDownloadLoading(false);
        }, 500);
      }, 500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
      setDownloadLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 size={24} className="animate-spin mr-2 text-blue-600" />
          <span className="text-xl text-gray-600">Loading your quiz results...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600 bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
          <XCircle size={24} className="inline-block mr-2 mb-1" />
          {error}
        </div>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AlertTriangle size={24} className="inline-block mr-2 mb-1 text-amber-500" />
          No results found for this quiz.
        </div>
      </div>
    );
  }
  
  const percentage = calculatePercentage();
  const passed = isPassed();
  const { chartData, hasTopics } = getPerformanceData();
  
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div ref={reportRef}>
        {/* Back button and download button */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <Link 
            to="/lms/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 hover:text-blue-700 rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200 transition-colors mb-2 md:mb-0"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          
          <button
            onClick={downloadReport}
            disabled={downloadLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
          >
            {downloadLoading ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Download size={18} className="mr-2" />
            )}
            <span>Download Report</span>
          </button>
        </div>
        
        {/* Results summary card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
          <h1 className="text-xl md:text-2xl font-bold">{results.quizTitle}</h1>
            <p className="text-sm mt-1">Completed on: {new Date(results.completedAt).toLocaleString()}</p>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm">Total Score</p>
                <p className="text-2xl font-bold text-gray-900">{results.score}/{results.totalQuestions * 10}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm">Percentage</p>
                <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm">Status</p>
                <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-lg text-gray-700">{getScoreMessage()}</p>
            </div>
          </div>
        </div>
        
        {/* Performance Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              {hasTopics ? (
                <RechartsBarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="correct" stackId="a" fill={CHART_COLORS.correct} name="Correct" />
                  <Bar dataKey="incorrect" stackId="a" fill={CHART_COLORS.incorrect} name="Incorrect" />
                  <Bar dataKey="unanswered" stackId="a" fill={CHART_COLORS.unanswered} name="Unanswered" />
                </RechartsBarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Topic Performance</h2>
            <div className="space-y-2">
              {chartData.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{topic.name}</span>
                  <div className="w-1/2 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${topic.correct}%`,
                        backgroundColor: topic.color || CHART_COLORS.topics[index % CHART_COLORS.topics.length]
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-700">{topic.correct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* AI Insights */}
        {aiInsights && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Brain size={20} className="mr-2 text-blue-600" />
              AI Performance Insights
            </h2>
            <div className="text-gray-700 whitespace-pre-line">
              {aiInsights}
            </div>
          </div>
        )}
        
        {/* Detailed Answer Analysis */}
        {answersAnalysis && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart size={20} className="mr-2 text-blue-600" />
              Detailed Answer Analysis
            </h2>
            <div className="text-gray-700 whitespace-pre-line">
              {answersAnalysis}
            </div>
          </div>
        )}
        
        {/* Questions Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Questions Breakdown</h2>
          <div className="space-y-4">
            {results.questions.map((question, index) => {
              const userAnswer = results.answers[index] !== undefined ? results.answers[index] : null;
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? 'bg-green-50 border border-green-200'
                      : userAnswer === null
                      ? 'bg-gray-50 border border-gray-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-800 font-medium">
                      Question {index + 1}: {question.question}
                    </h3>
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {expandedQuestions[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  
                  {expandedQuestions[index] && (
                    <div className="mt-4">
                      {question.topic && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Topic:</strong> {question.topic}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                isCorrectAnswer
                                  ? 'bg-green-100 border-l-4 border-green-500'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'bg-red-100 border-l-4 border-red-500'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                              {isCorrectAnswer && <CheckCircle size={16} className="inline-block ml-2 text-green-500" />}
                              {isUserAnswer && !isCorrectAnswer && <XCircle size={16} className="inline-block ml-2 text-red-500" />}
                            </div>
                          );
                        })}
                      </div>
                      
                      {question.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                      
                      {question.aiExplanation && !isCorrect && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>AI Explanation:</strong> {question.aiExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import {
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
//   Award,
//   ArrowLeft,
//   ChevronDown,
//   ChevronUp,
//   Trophy
// } from 'lucide-react';

// const QuizResults = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expandedQuestions, setExpandedQuestions] = useState({});
  
//   useEffect(() => {
//     // Try to get results from sessionStorage first
//     const sessionResults = sessionStorage.getItem('quizResults');
    
//     if (sessionResults) {
//       setResults(JSON.parse(sessionResults));
//       setLoading(false);
      
//       // Initialize expanded state for all questions (collapsed by default)
//       const expanded = {};
//       const parsedResults = JSON.parse(sessionResults);
//       parsedResults.questions.forEach((_, index) => {
//         expanded[index] = false;
//       });
//       setExpandedQuestions(expanded);
//     } else {
//       // If not available in session, fetch from API
//       fetchQuizReport();
//     }
//   }, [id]);
  
//   const fetchQuizReport = async () => {
//     try {
//       setLoading(true);
      
//       // Get the current user's latest report for this quiz
//       const reportResponse = await axios.get(`/api/quizzes/reports/quiz/${id}`);
      
//       if (!reportResponse.data.data) {
//         setError('No quiz report found');
//         setLoading(false);
//         return;
//       }
      
//       // Get the quiz details
//       const quizResponse = await axios.get(`/api/quizzes/${id}`);
      
//       // Combine the data
//       const quizData = quizResponse.data.data;
//       const reportData = reportResponse.data.data;
      
//       // Parse questions if needed
//       const parsedQuestions = typeof quizData.questions === 'string' 
//         ? JSON.parse(quizData.questions) 
//         : quizData.questions;
      
//       // Parse user answers if available
//       const userAnswers = reportData.answers ? 
//         (typeof reportData.answers === 'string' ? JSON.parse(reportData.answers) : reportData.answers) 
//         : {};
      
//       const resultData = {
//         quizId: id,
//         quizTitle: quizData.title,
//         score: reportData.score,
//         totalQuestions: parsedQuestions.length,
//         answers: userAnswers,
//         questions: parsedQuestions,
//         reportId: reportData.id,
//         completedAt: reportData.updatedAt,
//         isCompetition: quizData.isCompetition || false
//       };
      
//       // If it's a competition quiz, fetch leaderboard
//       if (quizData.isCompetition) {
//         try {
//           const leaderboardResponse = await axios.get(`/api/quizzes/leaderboard/${id}`);
//           resultData.leaderboard = leaderboardResponse.data.data || [];
//         } catch (err) {
//           console.error('Failed to fetch leaderboard:', err);
//           resultData.leaderboard = [];
//         }
//       }
      
//       setResults(resultData);
      
//       // Initialize expanded state for all questions (collapsed by default)
//       const expanded = {};
//       parsedQuestions.forEach((_, index) => {
//         expanded[index] = false;
//       });
//       setExpandedQuestions(expanded);
      
//       setLoading(false);
//     } catch (err) {
//       console.error('Failed to fetch quiz results:', err);
//       setError(err.response?.data?.message || 'Failed to fetch quiz results');
//       setLoading(false);
//     }
//   };
  
//   const toggleQuestion = (index) => {
//     setExpandedQuestions(prev => ({
//       ...prev,
//       [index]: !prev[index]
//     }));
//   };
  
//   // Calculate percentage score
//   const calculatePercentage = () => {
//     if (!results) return 0;
//     return Math.round((results.score / (results.totalQuestions * 10)) * 100);
//   };
  
//   // Determine if passed (assuming 60% is passing)
//   const isPassed = () => {
//     const percentage = calculatePercentage();
//     return percentage >= 60;
//   };
  
//   // Get appropriate message based on score
//   const getScoreMessage = () => {
//     const percentage = calculatePercentage();
    
//     if (percentage >= 90) return "Excellent work! You've mastered this material.";
//     if (percentage >= 80) return "Great job! You have a strong understanding of the content.";
//     if (percentage >= 70) return "Good work! You're on the right track.";
//     if (percentage >= 60) return "You've passed! Keep studying to improve further.";
//     return "Don't worry! Review the material and try again.";
//   };

//   // Leaderboard component
//   const Leaderboard = ({ leaderboard }) => (
//     <div className="bg-white rounded-xl shadow-lg p-6 h-full">
//       <div className="flex items-center mb-4">
//         <Trophy size={20} className="text-yellow-500 mr-2" />
//         <h3 className="text-lg font-medium">Competition Results</h3>
//       </div>
      
//       {leaderboard.length === 0 ? (
//         <div className="text-gray-500 text-center py-4">
//           No participants yet
//         </div>
//       ) : (
//         <>
//           {/* Winner highlight - only if there's at least one entry */}
//           {leaderboard.length > 0 && (
//             <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//               <div className="text-center">
//                 <div className="font-bold text-gray-800 mb-1">Winner</div>
//                 <div className="text-xl font-bold text-yellow-700">
//                   {leaderboard[0].userId === id ? 'You' : `User ${leaderboard[0].userId.slice(0, 5)}`}
//                 </div>
//                 <div className="text-yellow-600 mt-1">
//                   Score: {leaderboard[0].score}/{leaderboard[0].totalQuestions * 10}
//                 </div>
//               </div>
//             </div>
//           )}
        
//           <div className="space-y-3">
//             {leaderboard.sort((a, b) => b.score - a.score).map((entry, index) => (
//               <div 
//                 key={entry.userId} 
//                 className={`flex justify-between items-center p-2 rounded-lg ${
//                   entry.userId === id ? 'bg-blue-50' : 'hover:bg-gray-50'
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
//                     index === 0 ? 'bg-yellow-400 text-white' :
//                     index === 1 ? 'bg-gray-300 text-gray-800' :
//                     index === 2 ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {index + 1}
//                   </div>
//                   <span className={`${entry.userId === id ? 'font-bold' : ''}`}>
//                     {entry.userId === id ? 'You' : `User ${entry.userId.slice(0, 5)}`}
//                   </span>
//                 </div>
//                 <div className="font-medium">
//                   {entry.score}/{entry.totalQuestions * 10}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
  
//   if (loading) {
//     return (
//       <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="text-xl text-gray-600">Loading results...</div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="text-xl text-red-600">{error}</div>
//       </div>
//     );
//   }
  
//   if (!results) {
//     return (
//       <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="text-xl text-gray-600">No results found for this quiz.</div>
//       </div>
//     );
//   }
  
//   const percentage = calculatePercentage();
//   const passed = isPassed();
  
//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       {/* Back button */}
//       <Link 
//         to="/lms/dashboard" 
//         className="inline-flex items-center mb-6 text-primary-600 hover:text-primary-700"
//       >
//         <ArrowLeft size={20} className="mr-2" />
//         <span>Back to Dashboard</span>
//       </Link>
      
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left side - Results content */}
//         <div className="w-full lg:w-3/4 flex flex-col gap-6">
//           {/* Results summary card */}
//           <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Quiz Results: {results.quizTitle}</h1>
//                 {results.completedAt && (
//                   <p className="text-gray-600 text-sm mt-1">
//                     Completed on {new Date(results.completedAt).toLocaleString()}
//                   </p>
//                 )}
//               </div>
              
//               <div className="flex items-center mt-4 md:mt-0">
//                 <Award size={24} className={passed ? "text-yellow-500" : "text-gray-400"} />
//                 <span className="ml-2 font-medium">
//                   {passed ? "Passed" : "Try Again"}
//                 </span>
//               </div>
//             </div>
            
//             {/* Score overview */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="bg-gray-50 rounded-xl p-6 text-center">
//                 <h3 className="text-gray-600 mb-2">Total Score</h3>
//                 <p className="text-3xl font-bold text-gray-800">{results.score}/{results.totalQuestions * 10}</p>
//               </div>
              
//               <div className="bg-gray-50 rounded-xl p-6 text-center">
//                 <h3 className="text-gray-600 mb-2">Percentage</h3>
//                 <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
//               </div>
              
//               <div className="bg-gray-50 rounded-xl p-6 text-center">
//                 <h3 className="text-gray-600 mb-2">Status</h3>
//                 <p className={`text-3xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
//                   {passed ? "PASSED" : "FAILED"}
//                 </p>
//               </div>
//             </div>
            
//             {/* Feedback message */}
//             <div className={`p-4 rounded-lg mb-6 ${
//               passed ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"
//             }`}>
//               <p className="font-medium">{getScoreMessage()}</p>
//             </div>
//           </div>
          
//           {/* Detailed question review */}
//           <div className="bg-white rounded-2xl shadow-lg p-8">
//             <h2 className="text-xl font-bold text-gray-800 mb-6">Question Details</h2>
            
//             <div className="space-y-4">
//               {results.questions.map((question, index) => {
//                 const userAnswer = results.answers[index] !== undefined ? results.answers[index] : null;
//                 const isCorrect = userAnswer === question.correctAnswer;
//                 const isExpanded = expandedQuestions[index];
                
//                 return (
//                   <div 
//                     key={index} 
//                     className="border rounded-lg overflow-hidden"
//                   >
//                     {/* Question header (always visible) */}
//                     <div 
//                       className={`p-4 flex justify-between items-center cursor-pointer ${
//                         isCorrect ? "bg-green-50" : userAnswer === null ? "bg-gray-50" : "bg-red-50"
//                       }`}
//                       onClick={() => toggleQuestion(index)}
//                     >
//                       <div className="flex items-center">
//                         <span className="mr-3 font-medium">Q{index + 1}.</span>
//                         <span className="font-medium">{question.question}</span>
//                       </div>
                      
//                       <div className="flex items-center">
//                         {userAnswer !== null ? (
//                           isCorrect ? (
//                             <CheckCircle size={20} className="text-green-600 mr-2" />
//                           ) : (
//                             <XCircle size={20} className="text-red-600 mr-2" />
//                           )
//                         ) : (
//                           <AlertTriangle size={20} className="text-orange-600 mr-2" />
//                         )}
                        
//                         {isExpanded ? (
//                           <ChevronUp size={20} className="text-gray-500" />
//                         ) : (
//                           <ChevronDown size={20} className="text-gray-500" />
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Expanded details */}
//                     {isExpanded && (
//                       <div className="p-4 border-t bg-white">
//                         <div className="space-y-3">
//                           {/* Topic if available */}
//                           {question.topic && (
//                             <div className="text-sm text-gray-600">
//                               Topic: <span className="font-medium">{question.topic}</span>
//                             </div>
//                           )}
                          
//                           {/* Options */}
//                           <div className="mt-3">
//                             <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
//                             <div className="space-y-2 pl-4">
//                               {question.options.map((option, optIndex) => {
//                                 const isUserAnswer = userAnswer === optIndex;
//                                 const isCorrectAnswer = question.correctAnswer === optIndex;
                                
//                                 return (
//                                   <div 
//                                     key={optIndex}
//                                     className={`p-2 rounded ${
//                                       isCorrectAnswer 
//                                         ? "bg-green-100 border-l-4 border-green-500" 
//                                         : isUserAnswer 
//                                           ? "bg-red-100 border-l-4 border-red-500" 
//                                           : "bg-gray-50"
//                                     }`}
//                                   >
//                                     <div className="flex items-center">
//                                       <div className="w-6 h-6 flex items-center justify-center rounded-full mr-3 bg-white text-gray-700 border font-medium">
//                                         {String.fromCharCode(65 + optIndex)}
//                                       </div>
//                                       <span className={isCorrectAnswer ? "font-medium" : ""}>{option}</span>
                                      
//                                       {isCorrectAnswer && (
//                                         <CheckCircle size={16} className="ml-2 text-green-600" />
//                                       )}
                                      
//                                       {isUserAnswer && !isCorrectAnswer && (
//                                         <XCircle size={16} className="ml-2 text-red-600" />
//                                       )}
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           </div>
                          
//                           {/* Explanation if available */}
//                           {question.explanation && (
//                             <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                               <h4 className="text-sm font-medium text-blue-800 mb-1">Explanation:</h4>
//                               <p className="text-blue-700">{question.explanation}</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
        
//         {/* Right side - Leaderboard (only for competition quizzes) */}
//         {results.isCompetition && (
//           <div className="w-full lg:w-1/4">
//             <Leaderboard leaderboard={results.leaderboard || []} />
//           </div>
//         )}
//       </div>
      
//       {/* Action buttons */}
//       <div className="mt-8 flex gap-4">
//         <button
//           onClick={() => navigate('/lms/dashboard')}
//           className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg"
//         >
//           Back to Dashboard
//         </button>
        
//         {!passed && (
//           <button
//             onClick={() => navigate(`/lms/quizzes/${results.quizId}`)}
//             className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
//           >
//             Retake Quiz
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default QuizResults;