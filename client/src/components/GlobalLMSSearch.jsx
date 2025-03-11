import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Filter, X, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const baseURL = import.meta.env.VITE_BASE_URL;
const GlobalLMSSearch = () => {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [searchTypes, setSearchTypes] = useState([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Refs and Navigation
  const speechRecognitionRef = useRef(null);
  const navigate = useNavigate();

  // Browser Speech Recognition Support Check
  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window) {
      setVoiceSupported(true);
      
      // Initialize Speech Recognition
      speechRecognitionRef.current = new window.webkitSpeechRecognition();
      const recognition = speechRecognitionRef.current;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        // Update search query with final transcript
        if (finalTranscript) {
          setSearchQuery(prev => {
            // Append the new transcript, adding a space if there's existing text
            return prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceSearch();
        
        // Set specific error messages
        switch(event.error) {
          case 'no-speech':
            setError('No speech was detected. Please try again.');
            break;
          case 'audio-capture':
            setError('Audio capture failed. Check your microphone.');
            break;
          case 'not-allowed':
            setError('Permission to use microphone was denied.');
            break;
          default:
            setError('An error occurred with speech recognition.');
        }
      };

      recognition.onend = () => {
        stopVoiceSearch();
      };
    } else {
      setVoiceSupported(false);
    }

    // Cleanup
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Voice Search Methods
  const startVoiceSearch = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
        setIsVoiceActive(true);
        setError(null);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsVoiceActive(false);
        setError('Could not start voice search');
      }
    }
  };

  const stopVoiceSearch = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsVoiceActive(false);
    }
  };

  const toggleVoiceSearch = () => {
    if (!voiceSupported) {
      setError('Voice search is not supported in this browser');
      return;
    }

    if (isVoiceActive) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
    }
  };

  // Search Performance Methods
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${baseURL}api/search/advanced`, {
        query: searchQuery,
        types: searchTypes.length ? searchTypes : undefined,
        minRelevance: 5,
        limit: 10
      });

      setSearchResults(response.data.results);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to reduce unnecessary API calls
  useEffect(() => {
    let debounceTimer;
    if (searchQuery.length > 2) {
      debounceTimer = setTimeout(() => {
        performSearch();
      }, 500);
    }
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchTypes]);

  // Navigation Handler
  const handleResultNavigation = (result) => {
    switch(result.type) {
      case 'course':
        navigate(`/lms/coursedetail/${result.id}`);
        break;
      case 'quiz':
        navigate(`/lms/quiz/${result.id}`);
        break;
      case 'user':
        navigate(`/lms/profile/${result.id}`);
        break;
      default:
        console.log('Unhandled result type', result);
    }
    setIsSearchOpen(false);
  };

  // Search Type Toggle
  const toggleSearchType = (type) => {
    setSearchTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Main Render
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Search Button */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all"
        aria-label="Open LMS Global Search"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            {/* Close Button */}
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold mb-4">LMS Global Search</h2>

            {/* Search Input with Voice and Filter Toggle */}
            <div className="flex items-center space-x-2 mb-4">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, quizzes, users..."
                className="flex-grow p-2 border rounded"
              />
              <div className="flex space-x-2">
                {/* Voice Search Toggle */}
                <button 
                  onClick={toggleVoiceSearch}
                  className={`p-2 rounded ${
                    !voiceSupported 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : isVoiceActive 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200'
                  }`}
                  disabled={!voiceSupported}
                  aria-label={
                    !voiceSupported 
                      ? 'Voice search not supported' 
                      : isVoiceActive 
                      ? 'Stop Voice Search' 
                      : 'Start Voice Search'
                  }
                >
                  {!voiceSupported ? (
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  ) : isVoiceActive ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                
                {/* Filter Toggle */}
                <button 
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className={`p-2 rounded ${showAdvancedOptions ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voice Listening Indicator */}
            {isVoiceActive && (
              <div className="text-sm text-blue-600 mb-2 text-center">
                Listening... Speak to search
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded mb-4 flex items-center">
                <AlertCircle className="mr-2 w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Advanced Search Options */}
            {showAdvancedOptions && (
              <div className="mb-4 flex space-x-2">
                {['course', 'quiz', 'user'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleSearchType(type)}
                    className={`px-3 py-1 rounded ${
                      searchTypes.includes(type) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center text-blue-600">Searching...</div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto">
                <h3 className="font-medium mb-2">Results:</h3>
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleResultNavigation(result)}
                  >
                    <div>
                      <p className="font-semibold">{result.title}</p>
                      <p className="text-sm text-gray-600">
                        {result.type} | Relevance: {result.relevanceScore}
                      </p>
                    </div>
                    <span className="text-blue-500">→</span>
                  </div>
                ))}
              </div>
            )}

            {/* No Results State */}
            {!isLoading && searchQuery.length > 2 && searchResults.length === 0 && (
              <div className="text-center text-gray-500">
                No results found. Try a different search term.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLMSSearch;