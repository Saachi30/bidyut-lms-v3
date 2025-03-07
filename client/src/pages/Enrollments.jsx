import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, AlertTriangle, ChevronRight, Loader } from 'lucide-react';

const EnrollmentManagement = () => {
  // State management
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [gradeEnrollments, setGradeEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [newEnrollment, setNewEnrollment] = useState({
    studentId: '',
    grade: '', // Changed from gradeId to grade (string)
    assignedById: '13' // Default to your ID
  });
  const [selectedId, setSelectedId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all enrollments
  const fetchAllEnrollments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/enrollments');
      setEnrollments(response.data.data);
    } catch (err) {
      setError('Failed to fetch enrollments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollment details
  const fetchEnrollmentDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/enrollments/${id}`);
      setEnrollmentDetails(response.data.data);
    } catch (err) {
      setError('Failed to fetch enrollment details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student enrollments
  const fetchStudentEnrollments = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/enrollments/student/${studentId}`);
      setStudentEnrollments(response.data.data);
    } catch (err) {
      setError('Failed to fetch student enrollments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch grade enrollments
  const fetchGradeEnrollments = async (grade) => {
    if (!grade) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/enrollments/grade/${grade}`);
      setGradeEnrollments(response.data.data);
    } catch (err) {
      setError('Failed to fetch grade enrollments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create new enrollment
  const createEnrollment = async () => {
    if (!newEnrollment.studentId || !newEnrollment.grade) {
      setError('Student ID and Grade are required');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/enrollments', 
        newEnrollment
      );
      
      // Show success message
      setSuccessMessage('Enrollment created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Clear form
      setNewEnrollment({
        studentId: '',
        grade: '',
        assignedById: '13'
      });
      
      // Refresh enrollments list
      fetchAllEnrollments();
      
    } catch (err) {
      setError('Failed to create enrollment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load all enrollments on initial render
  useEffect(() => {
    fetchAllEnrollments();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEnrollment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex space-x-8 items-center mb-8">
        <h1 className="text-4xl font-bold text-ternary-500">
          Enrollment Management
        </h1>
        
        <button 
          onClick={() => setActiveTab('create')}
          className="flex items-center space-x-2 px-6 py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300 hover:bg-ternary-600"
        >
          <Plus size={20} />
          <span>Create Enrollment</span>
        </button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-gray-200 mb-8">
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => {
            setActiveTab('all');
            fetchAllEnrollments();
          }}
        >
          All Enrollments
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setActiveTab('details')}
        >
          Enrollment Details
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'student' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setActiveTab('student')}
        >
          Student Enrollments
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'grade' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => setActiveTab('grade')}
        >
          Grade Enrollments
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-ternary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading enrollments...</p>
        </div>
      )}

      {/* All Enrollments Tab */}
      {activeTab === 'all' && !loading && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Enrollments</h2>
          {enrollments.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-6 font-semibold text-gray-700">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Student</div>
                <div className="col-span-3">Grade</div>
                <div className="col-span-3">Assigned Date</div>
                <div className="col-span-2">Actions</div>
              </div>
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="grid grid-cols-12 p-6 border-b hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center">
                  <div className="col-span-1 font-semibold text-primary-600">{enrollment.id}</div>
                  <div className="col-span-3 font-medium">
                    {enrollment.student ? enrollment.student.name : `Student ID: ${enrollment.studentId}`}
                  </div>
                  <div className="col-span-3 text-gray-600">
                    {enrollment.grade}
                  </div>
                  <div className="col-span-3 text-gray-600">
                    {formatDate(enrollment.assignedAt)}
                  </div>
                  <div className="col-span-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => {
                        setActiveTab('details');
                        fetchEnrollmentDetails(enrollment.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No enrollments found.</p>
          )}
        </div>
      )}

      {/* Enrollment Details Tab */}
      {activeTab === 'details' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Enrollment Details</h2>
          <div className="mb-6 flex">
            <input
              type="text"
              placeholder="Enter Enrollment ID"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 flex-grow"
            />
            <button
              onClick={() => fetchEnrollmentDetails(selectedId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
            >
              Fetch Details
            </button>
          </div>
          
          {enrollmentDetails && !loading && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Enrollment #{enrollmentDetails.id}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-2 text-gray-700">Student Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="mb-2"><span className="font-medium">Name:</span> {enrollmentDetails.student.name}</p>
                    <p className="mb-2"><span className="font-medium">Email:</span> {enrollmentDetails.student.email}</p>
                    <p><span className="font-medium">ID:</span> {enrollmentDetails.student.id}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2 text-gray-700">Grade Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="mb-2"><span className="font-medium">Grade:</span> {enrollmentDetails.grade}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-2 text-gray-700">Enrollment Details</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-2"><span className="font-medium">Assigned Date:</span> {formatDate(enrollmentDetails.assignedAt)}</p>
                  <p><span className="font-medium">Assigned By ID:</span> {enrollmentDetails.assignedById}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Enrollments Tab */}
      {activeTab === 'student' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Student Enrollments</h2>
          <div className="mb-6 flex">
            <input
              type="text"
              placeholder="Enter Student ID"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 flex-grow"
            />
            <button
              onClick={() => fetchStudentEnrollments(selectedId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
            >
              Fetch Enrollments
            </button>
          </div>
          
          {studentEnrollments.length > 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-6 font-semibold text-gray-700">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Grade</div>
                <div className="col-span-4">Institute</div>
                <div className="col-span-2">Assigned Date</div>
              </div>
              {studentEnrollments.map(enrollment => (
                <div key={enrollment.id} className="grid grid-cols-12 p-6 border-b hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center">
                  <div className="col-span-1 font-semibold text-primary-600">{enrollment.id}</div>
                  <div className="col-span-3 font-medium">
                    {enrollment.grade}
                  </div>
                  <div className="col-span-4 text-gray-600">
                    {enrollment.student.institute ? enrollment.student.institute.name : ''}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {formatDate(enrollment.assignedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedId && studentEnrollments.length === 0 && !loading && (
            <p className="text-gray-600">No enrollments found for this student.</p>
          )}
        </div>
      )}

      {/* Grade Enrollments Tab */}
      {activeTab === 'grade' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Grade Enrollments</h2>
          <div className="mb-6 flex">
            <input
              type="text"
              placeholder="Enter Grade"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 flex-grow"
            />
            <button
              onClick={() => fetchGradeEnrollments(selectedId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
            >
              Fetch Enrollments
            </button>
          </div>
          
          {gradeEnrollments.length > 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-6 font-semibold text-gray-700">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Student</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Assigned Date</div>
              </div>
              {gradeEnrollments.map(enrollment => (
                <div key={enrollment.id} className="grid grid-cols-12 p-6 border-b hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center">
                  <div className="col-span-1 font-semibold text-primary-600">{enrollment.id}</div>
                  <div className="col-span-3 font-medium">
                    {enrollment.student ? enrollment.student.name : `Student ID: ${enrollment.studentId}`}
                    </div>
                  <div className="col-span-4 text-gray-600">
                    {enrollment.student ? enrollment.student.email : ''}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {formatDate(enrollment.assignedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedId && gradeEnrollments.length === 0 && !loading && (
            <p className="text-gray-600">No students enrolled in this grade.</p>
          )}
        </div>
      )}

      {/* Create Enrollment Tab */}
      {activeTab === 'create' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Enrollment</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={newEnrollment.studentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Student ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <input
                  type="text"
                  name="grade"
                  value={newEnrollment.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Grade"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={createEnrollment}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {loading ? 'Creating...' : 'Create Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;