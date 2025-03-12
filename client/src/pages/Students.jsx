import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, ChevronRight, Loader, Trash2, Edit, Mail, Phone } from 'lucide-react';
import axios from 'axios';

const Students = ({ currUserRole }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',  // Added password field
    phoneNumber: '',
    instituteId: '',
    grade: '',
    courseIds: []  // Added courseIds array
  });
  const [availableCourses, setAvailableCourses] = useState([]);

  const studentsPerPage = 10;
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}api/students`);
        if (response.data.success) {
          setStudents(response.data.data);
        } else {
          setError('Failed to fetch students data');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Fetch available courses when modal is opened
    if (isAddModalOpen) {
      const fetchCourses = async () => {
        try {
          const response = await axios.get(`${baseURL}api/courses`);
          if (response.data.success) {
            setAvailableCourses(response.data.data);
          }
        } catch (err) {
          console.error('Error fetching courses:', err);
        }
      };
      
      fetchCourses();
    }
  }, [isAddModalOpen]);

  // Filter students based on search term and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.institute?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'With Institute' && student.instituteId) ||
      (statusFilter === 'No Institute' && !student.instituteId);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCourseSelection = (courseId) => {
    setNewStudent(prev => {
      const courseIdNum = parseInt(courseId);
      if (prev.courseIds.includes(courseIdNum)) {
        return {
          ...prev,
          courseIds: prev.courseIds.filter(id => id !== courseIdNum)
        };
      } else {
        return {
          ...prev,
          courseIds: [...prev.courseIds, courseIdNum]
        };
      }
    });
  };

  const validateForm = () => {
    const { name, email, password, instituteId } = newStudent;
    return name && email && password && instituteId;
  };

  const handleAddStudent = async () => {
    try {
      if (!validateForm()) {
        setError('Please fill all required fields (Name, Email, Password, Institute ID)');
        return;
      }

      const studentData = {
        ...newStudent,
        instituteId: parseInt(newStudent.instituteId)
      };

      const response = await axios.post(`${baseURL}api/students`, studentData);
      if (response.data.success) {
        setStudents([...students, response.data.data]);
        setIsAddModalOpen(false);
        setNewStudent({
          name: '',
          email: '',
          password: '',
          phoneNumber: '',
          instituteId: '',
          grade: '',
          courseIds: []
        });
      }
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student. Please try again later.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await axios.delete(`${baseURL}api/students/${studentId}`);
        if (response.data.success) {
          setStudents(students.filter(student => student.id !== studentId));
        }
      } catch (err) {
        console.error('Error deleting student:', err);
        setError('Failed to delete student. Please try again later.');
      }
    }
  };

  const handleEnrollStudent = async (studentId, grade) => {
    // Implementation for enrolling student
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-500 mt-1">Manage all students enrolled in your institutes</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          {currUserRole === 'admin' || currUserRole === 'institute' ? (
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex-grow md:flex-grow-0"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Filter section */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'All' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All Students
        </button>
        <button
          onClick={() => setStatusFilter('With Institute')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'With Institute' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          With Institute
        </button>
        <button
          onClick={() => setStatusFilter('No Institute')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'No Institute' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          No Institute
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="float-right font-bold" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newStudent.phoneNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institute ID *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.instituteId}
                    onChange={(e) => setNewStudent({ ...newStudent, instituteId: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {availableCourses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enroll in Courses</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableCourses.map(course => (
                      <div key={course.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={newStudent.courseIds.includes(course.id)}
                          onChange={() => handleCourseSelection(course.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`course-${course.id}`} className="text-sm">
                          {course.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="mr-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : (
        <>
          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{student.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-1" />
                            {student.phoneNumber || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.institute ? (
                            <div className="text-sm text-gray-900">{student.institute.name}</div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">Not assigned</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            student.instituteId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.instituteId ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {currUserRole === 'admin' || currUserRole === 'institute' ? (
                              <button
                                onClick={() => handleEnrollStudent(student.id, 'Grade 10')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Enroll student"
                              >
                                <Edit size={16} />
                              </button>
                            ) : null}
                            {currUserRole === 'admin' && (
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete student"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        No students found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Section */}
          {filteredStudents.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Students;