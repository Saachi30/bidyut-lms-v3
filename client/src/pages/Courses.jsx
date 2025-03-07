import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Grid,
  List,
  FilePlus,
  ArrowRight,
  Tag,
  School,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CoursesPage = ({ currUserRole }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    categoryId: '',
    instituteId: '',
    grade: '',
  });

  const navigate = useNavigate();

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        
        // Add filters to query params if they exist
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.instituteId) queryParams.append('instituteId', filters.instituteId);
        if (filters.grade) queryParams.append('grade', filters.grade);

        const response = await axios.get(`/api/courses?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch courses');
        setLoading(false);
        toast.error(err.response?.data?.message || 'Failed to fetch courses');
      }
    };

    fetchCourses();
  }, [filters]);

  // Check if user can create course
  const canCreateCourse = () => {
    return ['admin', 'institute', 'faculty'].includes(currUserRole);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
            {canCreateCourse() && (
              <Link
                to="/lms/courses/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FilePlus size={16} className="mr-2" />
                Create Course
              </Link>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 flex space-x-4">
          {/* Category Filter */}
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
            className="px-3 py-2 border rounded-lg w-full"
          >
            <option value="">All Categories</option>
            {/* You would typically fetch categories dynamically */}
            <option value="1">Science</option>
            <option value="2">Math</option>
          </select>

          {/* Grade Filter */}
          <select
            value={filters.grade}
            onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
            className="px-3 py-2 border rounded-lg w-full"
          >
            <option value="">All Grades</option>
            <option value="6">Grade 6</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <School size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No courses found</h3>
            <p className="text-gray-500 mt-2">
              {canCreateCourse()
                ? 'Start by creating a new course.'
                : 'No courses are currently available.'}
            </p>
            {canCreateCourse() && (
              <Link
                to="/lms/courses/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-6"
              >
                <FilePlus size={16} className="mr-2" />
                Create First Course
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/lms/coursedetail/${course.id}`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-lg mb-2 text-gray-800">{course.name}</h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {course.description || 'No description available'}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag size={16} className="mr-2" />
                    <span>{course.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <School size={16} className="mr-2" />
                    <span>{course.institute?.name || 'No Institute'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <GraduationCap size={16} className="mr-2" />
                    <span>Grade {course.grade}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {course._count?.subtopics || 0} Subtopics
                  </span>
                  <span className="text-primary-600 text-sm font-medium inline-flex items-center">
                    View Details <ArrowRight size={16} className="ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institute
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtopics
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">Grade {course.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.institute?.name || 'No Institute'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course._count?.subtopics || 0} Subtopics</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/lms/coursedetail/${course.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;