// cources
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Book, Video, FileText, Brain, Plus } from 'lucide-react';

const SCourses = () => {
  const courses = [
    {
      id: 'grade-6',
      title: 'Grade 6 Robotics',
      description: 'Learn practical robotics through hands-on projects and experiments',
      totalModules: 18,
      duration: '9 months',
      color: 'from-blue-400 to-indigo-500',
      icon: Brain
    },
    {
      id: 'grade-7',
      title: 'Grade 7 Robotics',
      description: 'Advanced robotics concepts with real-world applications',
      totalModules: 16,
      duration: '8 months',
      color: 'from-purple-400 to-pink-500',
      icon: Brain
    },
    {
      id: 'grade-8',
      title: 'Grade 8 Robotics',
      description: 'Complex robotics systems and programming',
      totalModules: 20,
      duration: '10 months',
      color: 'from-orange-400 to-red-500',
      icon: Brain
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
          <div className='flex items-center space-x-3'> 
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>

          <button  className="flex items-center space-x-2 px-3 py-3 bg-ternary-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <Plus size={20} />
            <span>Add Course</span>
          </button>
          
          </div>
         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const IconComponent = course.icon;
            return (
              <Link 
                to={`/lms/coursedetail/${course.id}`} 
                key={course.id}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className={`h-32 bg-gradient-to-r ${course.color} p-6 relative`}>
                    <IconComponent className="w-16 h-16 text-white/90 absolute right-6 top-6 group-hover:scale-110 transition-all duration-300" />
                    <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700">
                      {course.duration}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Book size={16} />
                        <span>{course.totalModules} Modules</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Video size={16} />
                          <span>{course.totalModules}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={16} />
                          <span>{course.totalModules}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SCourses;