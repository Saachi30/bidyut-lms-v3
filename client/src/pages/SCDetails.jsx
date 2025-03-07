import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Brain,
  ChevronDown,
  Play,
  Download,
  CheckCircle
} from 'lucide-react';
import bgImage from '../assets/sBgimage.png'


const SCDetails = () => {
  const [activeTab, setActiveTab] = useState('introduction');
  const [activeModule, setActiveModule] = useState('S01');
  
  const modules = [
    {
      id: 'S01',
      title: 'Introduction',
      description: 'Overview of the course and basic concepts of robotics',
      duration: '45 mins',
      completed: true
    },
    {
      id: 'S02',
      title: 'Zoom Spotlight',
      description: 'Understanding optics and light behavior through practical experiments',
      duration: '60 mins',
      completed: true
    },
    {
      id: 'S03',
      title: 'Connecting Batteries in Series and Parallel',
      description: 'Learn about electrical circuits and power sources',
      duration: '90 mins',
      completed: false
    },
    // ... other modules
  ];

  const TabContent = () => {
    switch(activeTab) {
      case 'introduction':
        return (
          <div className="space-y-6">
            {modules.map((module) => (
              <div 
                key={module.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {module.id}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {module.title}
                      </h3>
                      {module.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{module.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Play size={16} />
                        {module.duration}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'documents':
        return (
          <div className="space-y-6">
            {modules.map((module) => (
              <div 
                key={module.id}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">{module.title}</h3>
                  <span className="text-sm text-gray-500">{module.id}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" size={20} />
                      <span>Module Notes.pdf</span>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600">
                      {/* <Download size={20} /> */}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" size={20} />
                      <span>Practice Worksheet.pdf</span>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600">
                      {/* <Download size={20} /> */}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-6">
            {modules.map((module) => (
              <div 
                key={module.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-video bg-gray-900 relative">
                  <img 
                    src="/api/placeholder/800/450" 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-blue-500" />
                    </div>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{module.title}</h3>
                    <span className="text-sm text-gray-500">{module.duration}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-6">
            {modules.map((module) => (
              <div 
                key={module.id}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-500">10 questions • 15 minutes</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Start Quiz
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Brain size={16} />
                    Multiple Choice
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle size={16} />
                    Pass: 70%
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white "
     style={{ 
      backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.5), rgba(79,70,229,0.1)),url(${bgImage})`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '200px'
    }}>
        <div className="max-w-7xl mx-auto px-8 py-12 bg-black-70 ">
          <h1 className="text-3xl font-bold mb-4 text-white">Grade 6 Robotics</h1>
          <p className="text-white mb-8 max-w-2xl">
            Learn practical robotics through hands-on projects and experiments. 
            This course covers basic electronics, programming, and mechanical concepts.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen size={20} />
              <span>18 Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <Video size={20} />
              <span>36 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain size={20} />
              <span>18 Quizzes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex space-x-1 mb-8 border-b">
          {['introduction', 'documents', 'video', 'quiz'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium  relative
                focus:outline-none focus:ring-0 active:bg-transparent
                ${activeTab === tab 
                  ? 'bg-slate-50' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        <TabContent />
      </div>
    </div>
  );
};

export default SCDetails;