import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, BookOpen, Trash2, AlertTriangle, Loader } from 'lucide-react';
import axios from 'axios';

const Faculties = ({ currUserRole }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('All Institutes');
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [courses, setCourses] = useState([]);

  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}api/users/faculties/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const transformedData = response.data.data.map(faculty => ({
            ...faculty,
            institute: faculty.institute ? faculty.institute.name : 'Unassigned'
          }));
          setFaculties(transformedData);
        }
      } catch (err) {
        console.error('Error fetching faculties:', err);
        setError('Failed to load faculties data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setCourses(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchFaculties();
    fetchCourses();
  }, []);

  const handleEditFaculty = (faculty) => {
    setEditingFaculty(faculty);
  };

  const handleSaveFaculty = async (updatedFaculty) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${baseURL}api/users/faculties/${updatedFaculty.id}`, updatedFaculty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const updatedFaculties = faculties.map(faculty =>
          faculty.id === updatedFaculty.id ? updatedFaculty : faculty
        );
        setFaculties(updatedFaculties);
        setEditingFaculty(null);
      }
    } catch (err) {
      console.error('Error updating faculty:', err);
      setError('Failed to update faculty. Please try again later.');
    }
  };

  const handleAddFaculty = async (newFaculty) => {
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: Create the faculty (without the grade field)
      const facultyData = { ...newFaculty };
      delete facultyData.grade; // Remove grade from faculty creation data
      
      const createResponse = await axios.post(`${baseURL}api/users/faculties`, facultyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (createResponse.data.success) {
        const createdFaculty = createResponse.data.data;
        
        // Step 2: If a grade was selected, enroll the faculty in that grade
        if (newFaculty.grade) {
          try {
            // Make sure we're sending the exact parameters the server expects
            await axios.post(`${baseURL}api/faculty-grades`, {
              facultyId: createdFaculty.id,
              grade: newFaculty.grade
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Add the grade back to the faculty object for display purposes
            createdFaculty.grade = newFaculty.grade;
          } catch (enrollError) {
            console.error('Error enrolling faculty in grade:', enrollError);
            // Still show the faculty was created, but with a note that grade enrollment failed
          }
        }
        
        // Add the new faculty to the list
        setFaculties([...faculties, createdFaculty]);
        setEditingFaculty(null);
      }
    } catch (err) {
      console.error('Error adding faculty:', err);
      setError('Failed to add faculty. Please try again later.');
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${baseURL}api/users/faculties/${facultyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const updatedFaculties = faculties.filter(faculty => faculty.id !== facultyId);
        setFaculties(updatedFaculties);
      }
    } catch (err) {
      console.error('Error deleting faculty:', err);
      setError('Failed to delete faculty. Please try again later.');
    }
  };

  const filteredFaculties = faculties.filter(faculty => {
    const matchesSearch = searchTerm === '' ||
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty.phoneNumber && faculty.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesInstitute = selectedInstitute === 'All Institutes' || faculty.institute === selectedInstitute;

    return matchesSearch && matchesInstitute;
  });

  const institutes = ['All Institutes', ...Array.from(new Set(faculties.map(f => f.institute)))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-xl font-medium text-gray-700">Loading faculties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex space-x-8 items-center mb-8">
        <h1 className="text-4xl font-bold text-ternary-500">
          Faculties Management
        </h1>
        {currUserRole === 'admin' || currUserRole === 'institute' ? (
          <button
            className="flex items-center space-x-2 px-6 py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300 hover:bg-ternary-600"
            onClick={() => setEditingFaculty({})}
          >
            <Plus size={20} />
            <span>Add Faculty</span>
          </button>
        ) : null}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ternary-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ternary-300 bg-white pr-8"
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
            >
              {institutes.map(institute => (
                <option key={institute} value={institute}>{institute}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-6 font-semibold text-gray-700">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Institute</div>
            <div className="col-span-1">Grade</div>
            <div className="col-span-2">Actions</div>
          </div>
          {filteredFaculties.length > 0 ? (
            filteredFaculties.map((faculty) => (
              <div key={faculty.id} className="grid grid-cols-12 p-6 border-b hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center">
                <div className="col-span-1 font-semibold text-primary-600">#{faculty.id}</div>
                <div className="col-span-2 font-medium">{faculty.name || 'N/A'}</div>
                <div className="col-span-2 text-gray-600">{faculty.email || 'N/A'}</div>
                <div className="col-span-2 text-gray-600">{faculty.phoneNumber || 'N/A'}</div>
                <div className="col-span-2 text-gray-600">{faculty.institute || 'Unassigned'}</div>
                <div className="col-span-1 text-gray-600">{faculty.grade || 'N/A'}</div>
                <div className="col-span-2">
                  {currUserRole === 'admin' || currUserRole === 'institute' ? (
                    <>
                      <button
                        onClick={() => handleEditFaculty(faculty)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(faculty.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No faculties found matching your search criteria
            </div>
          )}
        </div>
      </div>

      {editingFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">{editingFaculty.id ? 'Edit Faculty' : 'Add Faculty'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingFaculty.id) {
                handleSaveFaculty(editingFaculty);
              } else {
                handleAddFaculty(editingFaculty);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingFaculty.name || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingFaculty.email || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={editingFaculty.phoneNumber || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, phoneNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={editingFaculty.password || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
                  required={!editingFaculty.id}
                />
                {editingFaculty.id && (
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Institute</label>
                <input
                  type="text"
                  value={editingFaculty.institute || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, institute: e.target.value })}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <select
                  value={editingFaculty.grade || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, grade: e.target.value })}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2"
                >
                  <option value="">Select a grade</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ternary-500 text-white rounded-lg hover:bg-ternary-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculties;